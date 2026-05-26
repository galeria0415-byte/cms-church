import { NextResponse } from "next/server";

import { requireRole } from "@/lib/auth";
import { CONTENT_MANAGER_ROLES } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  try {
    const slide = await prisma.slide.findUnique({ where: { id } });
    if (!slide) return NextResponse.json({ error: "Not found." }, { status: 404 });
    return NextResponse.json({ slide });
  } catch {
    return NextResponse.json({ error: "Failed to fetch slide." }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: Params) {
  await requireRole(CONTENT_MANAGER_ROLES);
  const { id } = await params;

  const body = await request.json() as {
    title?: string;
    caption?: string;
    mediaUrl?: string;
    mediaType?: string;
    linkUrl?: string;
    linkLabel?: string;
    sortOrder?: number;
    isActive?: boolean;
  };

  try {
    const slide = await prisma.slide.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title || null }),
        ...(body.caption !== undefined && { caption: body.caption || null }),
        ...(body.mediaUrl !== undefined && { mediaUrl: body.mediaUrl }),
        ...(body.mediaType !== undefined && { mediaType: body.mediaType }),
        ...(body.linkUrl !== undefined && { linkUrl: body.linkUrl || null }),
        ...(body.linkLabel !== undefined && { linkLabel: body.linkLabel || null }),
        ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
    });
    return NextResponse.json({ slide });
  } catch {
    return NextResponse.json({ error: "Failed to update slide." }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  await requireRole(CONTENT_MANAGER_ROLES);
  const { id } = await params;

  try {
    await prisma.slide.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete slide." }, { status: 500 });
  }
}
