import { EventForm } from "@/components/forms/event-form";
import { requireRole } from "@/lib/auth";
import { EVENT_MANAGER_ROLES } from "@/lib/permissions";

export default async function NewEventPage() {
  await requireRole(EVENT_MANAGER_ROLES);

  return (
    <div className="space-y-4">
      <h1 className="font-serif text-4xl text-[var(--ink)]">Create event</h1>
      <EventForm />
    </div>
  );
}