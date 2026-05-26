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
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-6 py-4 lg:px-10">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-4">
            {settings.logoUrl ? (
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--line)] bg-white shadow-sm">
                <img src={settings.logoUrl} alt={settings.name} className="h-8 w-8 object-contain" />
              </span>
            ) : (
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent)] text-sm font-semibold text-white shadow-[0_18px_40px_-26px_rgba(24,63,84,0.9)]">
                {settings.name.slice(0, 2).toUpperCase()}
              </span>
            )}
            <div>
              <p className="font-serif text-xl font-semibold tracking-[0.03em] text-[var(--ink)]">{settings.name}</p>
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">{settings.tagline}</p>
            </div>
          </Link>
        </div>
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
          className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]"
        >
          {session?.user ? "Dashboard" : "Admin Login"}
        </Link>
      </div>
    </header>
  );
}