import Link from "next/link";
import { LayoutDashboard, Images, Newspaper, Users, CalendarDays, BookOpen, Settings, SlidersHorizontal, UserCog } from "lucide-react";

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
  { href: "/admin/slides", label: "Slides", icon: SlidersHorizontal },
  { href: "/admin/users", label: "Users", icon: UserCog },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole(DASHBOARD_ROLES);
  const settings = await getSiteSettings();

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="mx-auto grid min-h-screen max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[260px_1fr] lg:px-8">
        <aside className="rounded-[32px] border border-[var(--line)] bg-[var(--surface-strong)] p-6 text-white shadow-[0_30px_80px_-55px_rgba(15,23,42,0.9)]">
          <Link href="/admin" className="flex items-center gap-4">
            {settings.logoUrl ? <img src={settings.logoUrl} alt={settings.name} className="h-11 w-11 rounded-2xl bg-white object-contain p-2" /> : null}
            <div>
              <p className="font-serif text-2xl tracking-[0.04em]">{settings.name}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.2em] text-white/55">Role: {titleize(session.user.role)}</p>
            </div>
          </Link>
          <nav className="mt-8 space-y-2">
            {adminNavigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-white/80 transition hover:bg-white/10 hover:text-white">
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-8 rounded-3xl border border-white/10 bg-white/8 p-4">
            <p className="text-sm font-semibold">Signed in as</p>
            <p className="mt-2 text-sm text-white/70">{session.user.name ?? session.user.email}</p>
          </div>
          <div className="mt-6">
            <AdminSignOutButton />
          </div>
        </aside>
        <main className="space-y-6 py-2">{children}</main>
      </div>
    </div>
  );
}