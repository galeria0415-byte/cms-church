import Link from "next/link";

import { buttonStyles } from "@/components/ui/button";
import { DeleteButton } from "@/components/ui/delete-button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function EventsPage() {
  const events = await prisma.event.findMany({ orderBy: { eventDate: "asc" } });

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">CMS</p>
          <h1 className="mt-2 text-xl font-semibold text-[var(--ink)]">Events</h1>
        </div>
        <Link href="/admin/events/new" className={buttonStyles({ className: "no-underline" })}>
          New event
        </Link>
      </div>
      {events.length === 0 ? (
        <EmptyState title="No events yet" message="Create an event to display on the church calendar." />
      ) : (
        <Card>
          <div className="space-y-3">
            {events.map((event) => (
              <div key={event.id} className="flex flex-col gap-2 rounded-2xl border border-[var(--line)] px-4 py-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold text-[var(--ink)]">{event.title}</p>
                  <p className="text-sm text-[var(--muted)]">{formatDate(event.eventDate)} • {event.location ?? "Location TBD"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/admin/events/${event.id}/edit`} className="text-sm font-semibold text-[var(--accent)]">Edit</Link>
                  <DeleteButton apiPath={`/api/events/${event.id}`} label="Delete" confirmMessage={`Delete event "${event.title}"? This cannot be undone.`} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}