import { NextResponse } from "next/server";

import { requireRole } from "@/lib/auth";
import { CONTENT_MANAGER_ROLES } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { gallerySchema } from "@/lib/validators/content";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  const session = await requireRole(CONTENT_MANAGER_ROLES);
  const { id } = await params;
  const parsed = gallerySchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid gallery data." }, { status: 400 });
  }

  try {
    const gallery = await prisma.gallery.update({
      where: { id },
      data: {
        title: parsed.data.title,
        slug: parsed.data.slug,
        description: parsed.data.description,
        coverImage: parsed.data.coverImage,
        images: {
          deleteMany: {},
          create: parsed.data.images.map((imageUrl, index) => ({ imageUrl, sortOrder: index })),
        },
      },
      include: { images: true },
    });

    await prisma.activityLog.create({ data: { action: "update", entityType: "gallery", entityId: gallery.id, summary: `Updated gallery ${gallery.title}`, userId: session.user.id } });
    return NextResponse.json({ gallery });
  } catch (e: unknown) {
    const code = (e as { code?: string })?.code;
    if (code === "P2025") return NextResponse.json({ error: "Gallery not found." }, { status: 404 });
    if (code === "P2002") return NextResponse.json({ error: "A gallery with that slug already exists." }, { status: 409 });
    return NextResponse.json({ error: "Failed to update gallery." }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: Params) {
  const session = await requireRole(CONTENT_MANAGER_ROLES);
  const { id } = await params;
  try {
    const gallery = await prisma.gallery.delete({ where: { id } });
    await prisma.activityLog.create({ data: { action: "delete", entityType: "gallery", entityId: gallery.id, summary: `Deleted gallery ${gallery.title}`, userId: session.user.id } });
    return NextResponse.json({ gallery });
  } catch (e: unknown) {
    const code = (e as { code?: string })?.code;
    if (code === "P2025") return NextResponse.json({ error: "Gallery not found." }, { status: 404 });
    return NextResponse.json({ error: "Failed to delete gallery." }, { status: 500 });
  }
}