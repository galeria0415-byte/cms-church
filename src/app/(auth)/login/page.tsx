import Link from "next/link";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/forms/login-form";
import { getAuthSession } from "@/lib/auth";
import { getSiteSettings } from "@/lib/site-settings";

export default async function LoginPage() {
  const session = await getAuthSession();

  if (session?.user) {
    redirect("/admin");
  }

  const settings = await getSiteSettings();

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0d1117] px-4 py-12">
      {/* Subtle radial glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-[#c9a455]/8 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-sm space-y-6">
        {/* Branding */}
        <div className="text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#c9a455]">
            Admin Portal
          </p>
          <h1 className="mt-1 text-2xl font-bold text-white">{settings.name}</h1>
          <p className="mt-1 text-sm text-white/40">Sign in to manage your church.</p>
        </div>

        {/* Form card */}
        <div className="rounded-xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur-sm">
          <LoginForm />
        </div>

        {/* Setup link */}
        <p className="text-center text-xs text-white/30">
          First time?{" "}
          <Link href="/setup" className="text-[#c9a455] underline-offset-2 hover:underline">
            Create your admin account →
          </Link>
        </p>
      </div>
    </main>
  );
}