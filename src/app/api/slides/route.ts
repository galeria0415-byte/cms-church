import { NextResponse } from "next/server";

import { requireRole } from "@/lib/auth";
import { CONTENT_MANAGER_ROLES } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const slides = await prisma.slide.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json({ slides });
  } catch {
    return NextResponse.json({ error: "Failed to fetch slides." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  await requireRole(CONTENT_MANAGER_ROLES);

  const body = await request.json() as {
    title?: string;
    caption?: string;
    mediaUrl: string;
    mediaType?: string;
    linkUrl?: string;
    linkLabel?: string;
    sortOrder?: number;
    isActive?: boolean;
  };

  if (!body.mediaUrl) {
    return NextResponse.json({ error: "mediaUrl is required." }, { status: 400 });
  }

  try {
    const slide = await prisma.slide.create({
      data: {
        title: body.title ?? null,
        caption: body.caption ?? null,
        mediaUrl: body.mediaUrl,
        mediaType: body.mediaType ?? "image",
        linkUrl: body.linkUrl ?? null,
        linkLabel: body.linkLabel ?? null,
        sortOrder: body.sortOrder ?? 0,
        isActive: body.isActive ?? true,
      },
    });
    return NextResponse.json({ slide });
  } catch {
    return NextResponse.json({ error: "Failed to create slide." }, { status: 500 });
  }
}
