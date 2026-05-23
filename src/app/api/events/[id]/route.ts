import { NextResponse } from "next/server";

import { requireRole } from "@/lib/auth";
import { EVENT_MANAGER_ROLES } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { eventSchema } from "@/lib/validators/content";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  const session = await requireRole(EVENT_MANAGER_ROLES);
  const { id } = await params;
  const parsed = eventSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid event data." }, { status: 400 });
  }

  try {
    const event = await prisma.event.update({ where: { id }, data: parsed.data });
    await prisma.activityLog.create({ data: { action: "update", entityType: "event", entityId: event.id, summary: `Updated event ${event.title}`, userId: session.user.id } });
    return NextResponse.json({ event });
  } catch (e: unknown) {
    const code = (e as { code?: string })?.code;
    if (code === "P2025") return NextResponse.json({ error: "Event not found." }, { status: 404 });
    if (code === "P2002") return NextResponse.json({ error: "An event with that slug already exists." }, { status: 409 });
    return NextResponse.json({ error: "Failed to update event." }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: Params) {
  const session = await requireRole(EVENT_MANAGER_ROLES);
  const { id } = await params;
  try {
    const event = await prisma.event.delete({ where: { id } });
    await prisma.activityLog.create({ data: { action: "delete", entityType: "event", entityId: event.id, summary: `Deleted event ${event.title}`, userId: session.user.id } });
    return NextResponse.json({ event });
  } catch (e: unknown) {
    const code = (e as { code?: string })?.code;
    if (code === "P2025") return NextResponse.json({ error: "Event not found." }, { status: 404 });
    return NextResponse.json({ error: "Failed to delete event." }, { status: 500 });
  }
}