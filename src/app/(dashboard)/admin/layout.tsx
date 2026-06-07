import { AdminShell } from "@/components/layout/admin-shell";
import { requireRole } from "@/lib/auth";
import { DASHBOARD_ROLES } from "@/lib/permissions";
import { getSiteSettings } from "@/lib/site-settings";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole(DASHBOARD_ROLES);
  const settings = await getSiteSettings();

  return (
    <AdminShell logoUrl={settings.logoUrl} name={settings.name} role={session.user.role} userLabel={session.user.name ?? session.user.email ?? ""}>{children}</AdminShell>
  );
}