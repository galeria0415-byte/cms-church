import Link from "next/link";
import { LayoutDashboard, Images, Newspaper, Users, CalendarDays, BookOpen, Settings } from "lucide-react";

import { AdminSignOutButton } from "@/components/layout/admin-signout-button";
import { requireRole } from "@/lib/auth";
import { DASHBOARD_ROLES } from "@/lib/permissions";
import { getSiteSettings } from "@/lib/site-settings";
import { titleize } from "@/lib/utils";

export const dynamic = "force-dynamic";

const adminNavigation = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/members", label: "Members", icon: Users },
  { href: "/admin/posts", label: "Posts", icon: Newspaper },
  { href: "/admin/events", label: "Events", icon: CalendarDays },
  { href: "/admin/programs", label: "Programs", icon: BookOpen },
  { href: "/admin/galleries", label: "Galleries", icon: Images },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole(DASHBOARD_ROLES);
  const settings = await getSiteSettings();

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="mx-auto grid min-h-screen max-w-[1400px] gap-4 px-3 py-4 lg:grid-cols-[220px_1fr] lg:px-5">
        <aside className="rounded-xl border border-[var(--line)] bg-[var(--surface-strong)] p-4 text-white">
          <Link href="/admin" className="flex items-center gap-3">
            {settings.logoUrl ? <img src={settings.logoUrl} alt={settings.name} className="h-8 w-8 rounded-lg bg-white object-contain p-1" /> : null}
            <div>
              <p className="text-sm font-semibold">{settings.name}</p>
              <p className="text-[11px] uppercase tracking-wider text-white/50">Role: {titleize(session.user.role)}</p>
            </div>
          </Link>
          <nav className="mt-6 space-y-0.5">
            {adminNavigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-white/75 transition hover:bg-white/10 hover:text-white">
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-6 rounded-lg border border-white/10 bg-white/8 px-3 py-2.5">
            <p className="text-xs font-medium text-white/50">Signed in as</p>
            <p className="mt-0.5 text-sm font-medium truncate">{session.user.name ?? session.user.email}</p>
          </div>
          <div className="mt-3">
            <AdminSignOutButton />
          </div>
        </aside>
        <main className="min-w-0 space-y-4 py-1">{children}</main>
      </div>
    </div>
  );
}