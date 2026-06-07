import { UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { getServerSession, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { hasRole } from "@/lib/permissions";
import { loginSchema } from "@/lib/validators/auth";

// Explicitly override cookie names to remove __Secure-/__Host- prefixes.
// cPanel Passenger terminates TLS before Node.js, so the browser-enforced
// __Host- CSRF prefix can silently fail CSRF validation on external devices.
// We keep secure:true in production for the Secure attribute without the prefix.
const useSecure = process.env.NODE_ENV === "production";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: { httpOnly: true, sameSite: "lax", path: "/", secure: useSecure },
    },
    callbackUrl: {
      name: "next-auth.callback-url",
      options: { httpOnly: false, sameSite: "lax", path: "/", secure: useSecure },
    },
    csrfToken: {
      name: "next-auth.csrf-token",
      options: { httpOnly: true, sameSite: "lax", path: "/", secure: useSecure },
    },
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email.toLowerCase() },
        });

        if (!user) {
          return null;
        }

        const passwordValid = await bcrypt.compare(parsed.data.password, user.passwordHash);

        if (!passwordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id && token.role) {
        session.user.id = token.id;
        session.user.role = token.role as UserRole;
      }

      return session;
    },
  },
};

export async function getAuthSession() {
  return getServerSession(authOptions);
}

export async function getOptionalAuthSession() {
  try {
    return await getServerSession(authOptions);
  } catch (error) {
    console.error("[auth] optional session lookup failed", error);
    return null;
  }
}

export async function requireSession() {
  const session = await getAuthSession();

  if (!session?.user) {
    redirect("/login");
  }

  return session;
}

export async function requireRole(roles: UserRole[]) {
  const session = await requireSession();

  if (!hasRole(session.user.role, roles)) {
    redirect("/admin");
  }

  return session;
}