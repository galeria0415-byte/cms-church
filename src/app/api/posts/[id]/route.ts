import { NextResponse } from "next/server";

import { requireRole } from "@/lib/auth";
import { CONTENT_MANAGER_ROLES } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { postSchema } from "@/lib/validators/content";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  const session = await requireRole(CONTENT_MANAGER_ROLES);
  const { id } = await params;
  const parsed = postSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid post data." }, { status: 400 });
  }

  try {
    const post = await prisma.post.update({ where: { id }, data: parsed.data });

    await prisma.activityLog.create({
      data: {
        action: "update",
        entityType: "post",
        entityId: post.id,
        summary: `Updated post ${post.title}`,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ post });
  } catch (e: unknown) {
    const code = (e as { code?: string })?.code;
    if (code === "P2025") return NextResponse.json({ error: "Post not found." }, { status: 404 });
    if (code === "P2002") return NextResponse.json({ error: "A post with that slug already exists." }, { status: 409 });
    return NextResponse.json({ error: "Failed to update post." }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: Params) {
  const session = await requireRole(CONTENT_MANAGER_ROLES);
  const { id } = await params;
  try {
    const post = await prisma.post.delete({ where: { id } });

    await prisma.activityLog.create({
      data: {
        action: "delete",
        entityType: "post",
        entityId: post.id,
        summary: `Deleted post ${post.title}`,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ post });
  } catch (e: unknown) {
    const code = (e as { code?: string })?.code;
    if (code === "P2025") return NextResponse.json({ error: "Post not found." }, { status: 404 });
    return NextResponse.json({ error: "Failed to delete post." }, { status: 500 });
  }
}