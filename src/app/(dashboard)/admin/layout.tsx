import Link from "next/link";

import { AdminNav } from "@/components/layout/admin-nav";
import { AdminSignOutButton } from "@/components/layout/admin-signout-button";
import { requireRole } from "@/lib/auth";
import { DASHBOARD_ROLES } from "@/lib/permissions";
import { getSiteSettings } from "@/lib/site-settings";
import { titleize } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole(DASHBOARD_ROLES);
  const settings = await getSiteSettings();

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="mx-auto grid min-h-screen max-w-[1400px] gap-4 px-3 py-4 lg:grid-cols-[220px_1fr] lg:px-5">
        <aside className="rounded-xl bg-[#111827] p-4 text-white">
          <Link href="/admin" className="flex items-center gap-3 px-1">
            {settings.logoUrl ? (
              <img src={settings.logoUrl} alt={settings.name} className="h-8 w-8 rounded-lg bg-white/10 object-contain p-1" />
            ) : (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)]">
                <span className="text-xs font-bold text-[#111827]">✝</span>
              </div>
            )}
            <div>
              <p className="text-sm font-semibold leading-tight">{settings.name}</p>
              <p className="text-[11px] uppercase tracking-wider text-[var(--accent)]/70">
                {titleize(session.user.role)}
              </p>
            </div>
          </Link>
          <AdminNav />
          <div className="mt-6 border-t border-white/10 pt-4">
            <p className="text-[11px] font-medium uppercase tracking-wider text-white/30">Signed in as</p>
            <p className="mt-0.5 truncate text-sm font-medium text-white/80">
              {session.user.name ?? session.user.email}
            </p>
            <div className="mt-3">
              <AdminSignOutButton />
            </div>
          </div>
        </aside>
        <main className="min-w-0 space-y-4 py-1">{children}</main>
      </div>
    </div>
  );
}