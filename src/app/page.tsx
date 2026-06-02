import Link from "next/link";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { VerseOfTheDayCard } from "@/components/verse-of-the-day";
import { getSafeHomepageData } from "@/lib/public-content";
import { ministryHighlights } from "@/lib/site";
import { getSiteSettings } from "@/lib/site-settings";
import { formatDate } from "@/lib/utils";
import HomeHeroSlider from "@/components/home-hero-slider";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [data, settings] = await Promise.all([
    getSafeHomepageData(),
    getSiteSettings(),
  ]);

  const now = new Date();
  const odbUrl = `https://odb.org/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${String(now.getDate()).padStart(2, "0")}/`;

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,var(--background),#f8fbfd)]">
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden px-0 pt-0 pb-0">
          {/* Hero slider (images/videos) */}
          <div className="w-full">
            <HomeHeroSlider />
          </div>
        </section>

        <section className="mx-auto mt-8 w-full max-w-7xl px-6 pb-16 lg:mt-10 lg:px-10">
          <Card>
            <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">Latest updates</p>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {data.latestPosts.map((post) => (
                <article key={post.id} className="rounded-3xl border border-[var(--line)] bg-[var(--mist)] p-5">
                  <p className="text-sm text-[var(--muted)]">{formatDate(post.publishDate)}</p>
                  <h2 className="mt-3 font-serif text-2xl text-[var(--ink)]">{post.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{post.excerpt ?? post.content.slice(0, 140)}</p>
                </article>
              ))}
            </div>
          </Card>
        </section>

        <section className="mx-auto grid w-full max-w-7xl gap-6 px-6 pb-16 lg:grid-cols-2 lg:px-10">
          <Card>
            <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">Programs and schedules</p>
            <div className="mt-6 space-y-3">
              {data.programs.map((program) => (
                <div key={program.id} className="flex items-center justify-between rounded-2xl border border-[var(--line)] bg-white px-4 py-4">
                  <div>
                    <p className="font-semibold text-[var(--ink)]">{program.title}</p>
                    <p className="text-sm text-[var(--muted)]">{program.scheduleDay} • {program.scheduleTime}</p>
                  </div>
                  <p className="text-sm text-[var(--muted)]">{program.location ?? "Main campus"}</p>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">Upcoming events</p>
            <div className="mt-6 space-y-3">
              {data.events.map((event) => (
                <div key={event.id} className="rounded-2xl border border-[var(--line)] bg-white px-4 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-semibold text-[var(--ink)]">{event.title}</p>
                    <p className="text-sm text-[var(--accent-strong)]">{formatDate(event.eventDate, "MMM d")}</p>
                  </div>
                  <p className="mt-2 text-sm text-[var(--muted)]">{event.location ?? "Location to be announced"}</p>
                </div>
              ))}
            </div>
          </Card>
        </section>

        <section className="mx-auto w-full max-w-7xl px-6 pb-16 lg:px-10">
            <div className="grid gap-6 lg:grid-cols-2">
              <VerseOfTheDayCard />
              <Card className="flex flex-col gap-4">
                <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">Daily Devotion</p>
                <p className="font-serif text-xl text-[var(--ink)]">Our Daily Bread</p>
                <p className="text-sm leading-7 text-[var(--muted)]">Start your day with a short, scripture-based reflection from Our Daily Bread.</p>
                <a
                  href={odbUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent)]"
                >
                  Read today&apos;s devotion &rarr;
                </a>
              </Card>
            </div>
          </section>

        <section className="mx-auto w-full max-w-7xl px-6 pb-16 lg:px-10">
          <Card>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">Ministries</p>
                <h2 className="mt-2 font-serif text-3xl text-[var(--ink)]">Where people serve and grow</h2>
              </div>
              <Link href="/ministries" className="text-sm font-semibold text-[var(--accent)]">
                See all ministries
              </Link>
            </div>
            <div className="mt-6 grid gap-4 lg:grid-cols-4">
              {ministryHighlights.map((ministry) => (
                <div key={ministry.name} className="rounded-3xl border border-[var(--line)] bg-[var(--mist)] p-5">
                  <h3 className="font-serif text-2xl text-[var(--ink)]">{ministry.name}</h3>
                  <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{ministry.description}</p>
                </div>
              ))}
            </div>
          </Card>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
