import { notFound } from "next/navigation";

import { EventForm, mapEventToForm } from "@/components/forms/event-form";
import { requireRole } from "@/lib/auth";
import { EVENT_MANAGER_ROLES } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

type Params = Promise<{ id: string }>;

export default async function EditEventPage({ params }: { params: Params }) {
  await requireRole(EVENT_MANAGER_ROLES);
  const { id } = await params;
  const event = await prisma.event.findUnique({ where: { id } });

  if (!event) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-[var(--ink)]">Edit event</h1>
      <EventForm event={mapEventToForm(event)} />
    </div>
  );
}