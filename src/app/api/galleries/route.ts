import { NextResponse } from "next/server";

import { requireRole } from "@/lib/auth";
import { CONTENT_MANAGER_ROLES } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { gallerySchema } from "@/lib/validators/content";

export async function POST(request: Request) {
  const session = await requireRole(CONTENT_MANAGER_ROLES);
  const parsed = gallerySchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid gallery data." }, { status: 400 });
  }

  try {
    const gallery = await prisma.gallery.create({
      data: {
        title: parsed.data.title,
        slug: parsed.data.slug,
        description: parsed.data.description,
        coverImage: parsed.data.coverImage,
        createdById: session.user.id,
        images: {
          create: parsed.data.images.map((imageUrl, index) => ({ imageUrl, sortOrder: index })),
        },
      },
      include: { images: true },
    });

    await prisma.activityLog.create({ data: { action: "create", entityType: "gallery", entityId: gallery.id, summary: `Created gallery ${gallery.title}`, userId: session.user.id } });
    return NextResponse.json({ gallery });
  } catch (e: unknown) {
    const code = (e as { code?: string })?.code;
    if (code === "P2002") return NextResponse.json({ error: "A gallery with that slug already exists." }, { status: 409 });
    return NextResponse.json({ error: "Failed to create gallery." }, { status: 500 });
  }
}