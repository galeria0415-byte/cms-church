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
    <main className="relative flex min-h-screen items-center justify-center px-4 py-12">
      <div className="absolute inset-0 bg-[var(--background)]" />
      <Card className="relative z-10 w-full max-w-sm">
        <h1 className="text-xl font-semibold text-[var(--ink)]">Sign in</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">Access the church admin dashboard.</p>
        <div className="mt-5">
          <LoginForm />
        </div>
      </Card>
    </main>
  );
}