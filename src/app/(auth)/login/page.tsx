import { redirect } from "next/navigation";

import { LoginForm } from "@/components/forms/login-form";
import { Card } from "@/components/ui/card";
import { getAuthSession } from "@/lib/auth";

export default async function LoginPage() {
  const session = await getAuthSession();

  if (session?.user) {
    redirect("/admin");
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-16">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(190,144,112,0.22),_transparent_45%),linear-gradient(180deg,_#fbf6ef_0%,_#f2e4d3_100%)]" />
      <Card className="relative z-10 w-full max-w-md bg-white/95">
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">Secure access</p>
        <h1 className="mt-3 font-serif text-4xl text-[var(--ink)]">Church admin login</h1>
        <p className="mt-3 text-sm text-[var(--muted)]">Sign in to manage members, programs, events, galleries, and website content.</p>
        <div className="mt-8">
          <LoginForm />
        </div>
      </Card>
    </main>
  );
}