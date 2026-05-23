import { NextResponse } from "next/server";

import { requireRole } from "@/lib/auth";
import { CONTENT_MANAGER_ROLES } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { programSchema } from "@/lib/validators/content";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  const session = await requireRole(CONTENT_MANAGER_ROLES);
  const { id } = await params;
  const parsed = programSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid program data." }, { status: 400 });
  }

  try {
    const program = await prisma.program.update({ where: { id }, data: parsed.data });
    await prisma.activityLog.create({ data: { action: "update", entityType: "program", entityId: program.id, summary: `Updated program ${program.title}`, userId: session.user.id } });
    return NextResponse.json({ program });
  } catch (e: unknown) {
    const code = (e as { code?: string })?.code;
    if (code === "P2025") return NextResponse.json({ error: "Program not found." }, { status: 404 });
    if (code === "P2002") return NextResponse.json({ error: "A program with that slug already exists." }, { status: 409 });
    return NextResponse.json({ error: "Failed to update program." }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: Params) {
  const session = await requireRole(CONTENT_MANAGER_ROLES);
  const { id } = await params;
  try {
    const program = await prisma.program.delete({ where: { id } });
    await prisma.activityLog.create({ data: { action: "delete", entityType: "program", entityId: program.id, summary: `Deleted program ${program.title}`, userId: session.user.id } });
    return NextResponse.json({ program });
  } catch (e: unknown) {
    const code = (e as { code?: string })?.code;
    if (code === "P2025") return NextResponse.json({ error: "Program not found." }, { status: 404 });
    return NextResponse.json({ error: "Failed to delete program." }, { status: 500 });
  }
}