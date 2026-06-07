"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";

import { publicNavigation } from "@/lib/site";
import { cn } from "@/lib/utils";

export function SiteHeaderShell({
  isAuthenticated,
  name,
  tagline,
  logoUrl,
  enableMemberRegistration,
}: {
  isAuthenticated: boolean;
  name: string;
  tagline: string;
  logoUrl: string;
  enableMemberRegistration: boolean;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[color:rgba(248,250,252,0.88)] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 lg:px-10">
        <Link href="/" className="flex min-w-0 flex-shrink items-center gap-3">
          {logoUrl ? (
            <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl border border-[var(--line)] bg-white shadow-sm">
              <img src={logoUrl} alt={name} className="h-7 w-7 object-contain" />
            </span>
          ) : (
            <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-[var(--accent)] text-xs font-bold text-white shadow-[0_12px_28px_-14px_rgba(24,63,84,0.75)]">
              {name.slice(0, 2).toUpperCase()}
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate text-[15px] font-bold leading-tight tracking-[0.01em] text-[var(--ink)]">{name}</p>
            <p className="truncate text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--muted)]">{tagline}</p>
          </div>
        </Link>

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

        <div className="hidden items-center gap-3 lg:flex">
          {enableMemberRegistration ? (
            <Link href="/register/member" className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm font-medium text-[var(--ink)] transition hover:bg-[var(--surface-subtle)]">
              Register
            </Link>
          ) : null}
          <Link href={isAuthenticated ? "/admin" : "/login"} className="rounded-full bg-[var(--accent)] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]">
            {isAuthenticated ? "Dashboard" : "Login"}
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((current) => !current)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--line)] bg-white text-[var(--ink)] lg:hidden"
          aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div className={cn("border-t border-[var(--line)] bg-white/95 px-4 pb-4 pt-3 shadow-sm lg:hidden", mobileOpen ? "block" : "hidden")}>
        <nav className="space-y-2">
          {publicNavigation.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className="block rounded-2xl px-4 py-3 text-sm font-medium text-[var(--ink)] transition hover:bg-[var(--surface-subtle)]">
              {item.label}
            </Link>
          ))}
          {enableMemberRegistration ? <Link href="/register/member" onClick={() => setMobileOpen(false)} className="block rounded-2xl px-4 py-3 text-sm font-medium text-[var(--ink)] transition hover:bg-[var(--surface-subtle)]">Member Registration</Link> : null}
          <Link href={isAuthenticated ? "/admin" : "/login"} onClick={() => setMobileOpen(false)} className="block rounded-2xl bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]">
            {isAuthenticated ? "Dashboard" : "Login"}
          </Link>
        </nav>
      </div>
    </header>
  );
}