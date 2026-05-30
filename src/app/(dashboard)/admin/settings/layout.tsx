import { SettingsTabNav } from "@/components/layout/settings-tab-nav";
import { requireRole } from "@/lib/auth";
import { DASHBOARD_ROLES } from "@/lib/permissions";

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  await requireRole(DASHBOARD_ROLES);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">Settings</p>
        <h1 className="mt-2 text-xl font-semibold text-[var(--ink)]">Administration</h1>
      </div>
      <SettingsTabNav />
      {children}
    </div>
  );
}
