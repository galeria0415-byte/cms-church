import { NextResponse } from "next/server";

import { requireRole } from "@/lib/auth";
import { CONTENT_MANAGER_ROLES } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { programSchema } from "@/lib/validators/content";

export async function POST(request: Request) {
  const session = await requireRole(CONTENT_MANAGER_ROLES);
  const parsed = programSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid program data." }, { status: 400 });
  }

  try {
    const program = await prisma.program.create({
      data: {
        ...parsed.data,
        createdById: session.user.id,
      },
    });

    await prisma.activityLog.create({ data: { action: "create", entityType: "program", entityId: program.id, summary: `Created program ${program.title}`, userId: session.user.id } });
    return NextResponse.json({ program });
  } catch (e: unknown) {
    const code = (e as { code?: string })?.code;
    if (code === "P2002") return NextResponse.json({ error: "A program with that slug already exists." }, { status: 409 });
    return NextResponse.json({ error: "Failed to create program." }, { status: 500 });
  }
}