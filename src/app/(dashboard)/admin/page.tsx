import Link from "next/link";

import { ObservancePanel } from "@/components/dashboard/observance-panel";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card } from "@/components/ui/card";
import { getDashboardSummary } from "@/lib/dashboard";

export default async function AdminDashboardPage() {
  const summary = await getDashboardSummary().catch(() => null);

  if (!summary) {
    return (
      <div className="rounded-[32px] bg-[var(--surface-strong)] px-6 py-8">
        <p className="text-sm text-[var(--muted)]">Dashboard data is temporarily unavailable. Please refresh.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] bg-[linear-gradient(135deg,_#f4e1cf_0%,_#fff8f1_60%,_#ecd6be_100%)] px-6 py-8 shadow-[0_30px_80px_-45px_rgba(80,62,44,0.45)] lg:px-8">
        <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">Admin dashboard</p>
        <h1 className="mt-3 text-xl font-semibold text-[var(--ink)]">Church operations overview</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted)]">Track the people database, public content, and upcoming church activity from one dashboard.</p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Members" value={summary.memberCount} hint={`${summary.activeMembers} active and visible`} />
        <StatCard label="Posts" value={summary.posts} hint="Updates and announcements ready for the website" />
        <StatCard label="Events" value={summary.upcomingEvents} hint="Upcoming gatherings and registrations" />
        <StatCard label="Programs" value={summary.programs} hint="Active schedules published to the church site" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <ObservancePanel observances={summary.observances} title="Birthdays and anniversaries today" />
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">Quick links</p>
              <h2 className="mt-2 text-base font-semibold text-[var(--ink)]">Jump to work</h2>
            </div>
          </div>
          <div className="mt-6 grid gap-3">
            <Link className="rounded-2xl border border-[var(--line)] px-4 py-4 font-medium text-[var(--ink)] transition hover:bg-[var(--mist)]" href="/admin/members/new">
              Add a new member
            </Link>
            <Link className="rounded-2xl border border-[var(--line)] px-4 py-4 font-medium text-[var(--ink)] transition hover:bg-[var(--mist)]" href="/admin/posts">
              Publish a church update
            </Link>
            <Link className="rounded-2xl border border-[var(--line)] px-4 py-4 font-medium text-[var(--ink)] transition hover:bg-[var(--mist)]" href="/admin/events">
              Schedule an event
            </Link>
          </div>
        </Card>
      </section>

    </div>
  );
}