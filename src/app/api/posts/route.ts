import { NextResponse } from "next/server";

import { requireRole } from "@/lib/auth";
import { CONTENT_MANAGER_ROLES } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { postSchema } from "@/lib/validators/content";

export async function POST(request: Request) {
  const session = await requireRole(CONTENT_MANAGER_ROLES);
  const body = await request.json();
  const parsed = postSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid post data." }, { status: 400 });
  }

  try {
    const post = await prisma.post.create({
      data: {
        ...parsed.data,
        authorId: session.user.id,
      },
    });

    await prisma.activityLog.create({
      data: {
        action: "create",
        entityType: "post",
        entityId: post.id,
        summary: `Created post ${post.title}`,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ post });
  } catch (e: unknown) {
    const code = (e as { code?: string })?.code;
    if (code === "P2002") return NextResponse.json({ error: "A post with that slug already exists." }, { status: 409 });
    return NextResponse.json({ error: "Failed to create post." }, { status: 500 });
  }
}