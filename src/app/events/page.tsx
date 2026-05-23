import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Card } from "@/components/ui/card";
import { getSafeUpcomingEvents } from "@/lib/public-content";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function EventsPublicPage() {
  const events = await getSafeUpcomingEvents();

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <SiteHeader />
      <main className="mx-auto max-w-6xl space-y-8 px-6 py-16 lg:px-10">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">Events</p>
          <h1 className="mt-2 font-serif text-5xl text-[var(--ink)]">Upcoming gatherings, registrations, and special services.</h1>
        </div>
        <div className="grid gap-4">
          {events.map((event) => (
            <Card key={event.id} className="grid gap-4 md:grid-cols-[180px_1fr]">
              <div className="rounded-3xl bg-[var(--mist)] p-5 text-center">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Event date</p>
                <p className="mt-3 font-serif text-4xl text-[var(--ink)]">{formatDate(event.eventDate, "MMM d")}</p>
              </div>
              <div>
                <h2 className="font-serif text-3xl text-[var(--ink)]">{event.title}</h2>
                <p className="mt-3 text-sm text-[var(--muted)]">{event.time ?? "Time TBA"} • {event.location ?? "Location TBA"}</p>
                <p className="mt-4 text-sm leading-7 text-[var(--muted)]">{event.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}