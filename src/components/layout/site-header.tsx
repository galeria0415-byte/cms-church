import Link from "next/link";
import { connection } from "next/server";

import { getOptionalAuthSession } from "@/lib/auth";
import { publicNavigation } from "@/lib/site";
import { getSiteSettings } from "@/lib/site-settings";

export async function SiteHeader() {
  await connection();
  const session = await getOptionalAuthSession();
  const settings = await getSiteSettings();

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[color:rgba(248,250,252,0.88)] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-3 lg:px-10">
        <Link href="/" className="flex min-w-0 flex-shrink items-center gap-3">
          {settings.logoUrl ? (
            <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl border border-[var(--line)] bg-white shadow-sm">
              <img src={settings.logoUrl} alt={settings.name} className="h-7 w-7 object-contain" />
            </span>
          ) : (
            <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-[var(--accent)] text-xs font-bold text-white shadow-[0_12px_28px_-14px_rgba(24,63,84,0.75)]">
              {settings.name.slice(0, 2).toUpperCase()}
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate text-[15px] font-bold leading-tight tracking-[0.01em] text-[var(--ink)]">{settings.name}</p>
            <p className="truncate text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--muted)]">{settings.tagline}</p>
          </div>
        </Link>
        <div className="flex items-center gap-4">
          <nav className="hidden items-center gap-2 rounded-full border border-[var(--line)] bg-white/80 px-3 py-2 lg:flex">
            {publicNavigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium text-[var(--ink)] transition hover:bg-[var(--surface-subtle)] hover:text-[var(--accent)]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <Link
            href={session?.user ? "/admin" : "/login"}
            className="rounded-full bg-[var(--accent)] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]"
          >
            {session?.user ? "Dashboard" : "Login"}
          </Link>
        </div>
      </div>
    </header>
  );
}