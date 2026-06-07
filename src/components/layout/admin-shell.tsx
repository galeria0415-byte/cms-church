"use client";

import Link from "next/link";
import { BookOpen, CalendarDays, Images, LayoutDashboard, Menu, Newspaper, Presentation, Settings, SlidersHorizontal, UserCog, Users, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { AdminSignOutButton } from "@/components/layout/admin-signout-button";
import { cn, titleize } from "@/lib/utils";

const adminNavigation = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/members", label: "Members", icon: Users },
  { href: "/admin/posts", label: "Posts", icon: Newspaper },
  { href: "/admin/events", label: "Events", icon: CalendarDays },
  { href: "/admin/programs", label: "Programs", icon: BookOpen },
  { href: "/admin/order-of-worship", label: "Worship", icon: Presentation },
  { href: "/admin/galleries", label: "Galleries", icon: Images },
  { href: "/admin/slides", label: "Slides", icon: SlidersHorizontal },
  { href: "/admin/users", label: "Users", icon: UserCog },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

function SidebarContent({ onNavigate, userLabel }: { onNavigate?: () => void; userLabel: string }) {
  const pathname = usePathname();

  return (
    <>
      <nav className="mt-8 min-h-0 flex-1 space-y-2 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {adminNavigation.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn("flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition", active ? "bg-white/14 text-white" : "text-white/80 hover:bg-white/10 hover:text-white")}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="shrink-0 border-t border-white/10 pt-5">
        <div className="rounded-2xl border border-white/10 bg-white/6 px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/45">Signed in as</p>
          <p className="mt-1 truncate text-sm font-medium text-white/82">{userLabel}</p>
        </div>
        <div className="mt-3">
          <AdminSignOutButton />
        </div>
        <p className="mt-4 text-center text-[10px] uppercase tracking-[0.22em] text-white/38">Built and maintained by DMG.</p>
      </div>
    </>
  );
}

export function AdminShell({ children, logoUrl, name, role, userLabel }: { children: React.ReactNode; logoUrl: string; name: string; role: string; userLabel: string; }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 pt-4 lg:hidden">
        <button type="button" onClick={() => setMobileOpen(true)} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--line)] bg-white text-[var(--ink)]">
          <Menu className="h-5 w-5" />
        </button>
        <p className="text-sm font-semibold text-[var(--ink)]">{name}</p>
      </div>

      {mobileOpen ? <div className="fixed inset-0 z-50 bg-slate-950/45 lg:hidden" onClick={() => setMobileOpen(false)} /> : null}
      <aside className={cn("fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-[var(--line)] bg-[var(--surface-strong)] p-6 text-white shadow-[0_30px_80px_-55px_rgba(15,23,42,0.9)] transition-transform lg:hidden", mobileOpen ? "translate-x-0" : "-translate-x-full")}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {logoUrl ? <img src={logoUrl} alt={name} className="h-11 w-11 rounded-2xl bg-white object-contain p-2" /> : null}
            <div>
              <p className="font-serif text-2xl tracking-[0.04em]">{name}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.2em] text-white/55">Role: {titleize(role)}</p>
            </div>
          </div>
          <button type="button" onClick={() => setMobileOpen(false)} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/10">
            <X className="h-5 w-5" />
          </button>
        </div>
        <SidebarContent onNavigate={() => setMobileOpen(false)} userLabel={userLabel} />
      </aside>

      <div className="mx-auto grid min-h-screen max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[auto_1fr] lg:px-8">
        <aside className="hidden w-[260px] flex-col rounded-[32px] border border-[var(--line)] bg-[var(--surface-strong)] p-6 text-white shadow-[0_30px_80px_-55px_rgba(15,23,42,0.9)] lg:sticky lg:top-6 lg:flex lg:h-[calc(100vh-3rem)] lg:overflow-hidden">
          <div className="flex items-center gap-4">
            {logoUrl ? <img src={logoUrl} alt={name} className="h-11 w-11 rounded-2xl bg-white object-contain p-2" /> : null}
            <div>
              <p className="font-serif text-2xl tracking-[0.04em]">{name}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.2em] text-white/55">Role: {titleize(role)}</p>
            </div>
          </div>
          <SidebarContent userLabel={userLabel} />
        </aside>
        <main className="space-y-6 py-2">{children}</main>
      </div>
    </div>
  );
}