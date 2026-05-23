import { NextResponse } from "next/server";

import { requireRole } from "@/lib/auth";
import { EVENT_MANAGER_ROLES } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { eventSchema } from "@/lib/validators/content";

export async function POST(request: Request) {
  const session = await requireRole(EVENT_MANAGER_ROLES);
  const parsed = eventSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid event data." }, { status: 400 });
  }

  try {
    const event = await prisma.event.create({
      data: {
        ...parsed.data,
        createdById: session.user.id,
      },
    });

    await prisma.activityLog.create({ data: { action: "create", entityType: "event", entityId: event.id, summary: `Created event ${event.title}`, userId: session.user.id } });

    return NextResponse.json({ event });
  } catch (e: unknown) {
    const code = (e as { code?: string })?.code;
    if (code === "P2002") return NextResponse.json({ error: "An event with that slug already exists." }, { status: 409 });
    return NextResponse.json({ error: "Failed to create event." }, { status: 500 });
  }
}