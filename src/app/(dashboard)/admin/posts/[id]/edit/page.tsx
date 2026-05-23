import { notFound } from "next/navigation";

import { PostForm, mapPostToForm } from "@/components/forms/post-form";
import { requireRole } from "@/lib/auth";
import { CONTENT_MANAGER_ROLES } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

type Params = Promise<{ id: string }>;

export default async function EditPostPage({ params }: { params: Params }) {
  await requireRole(CONTENT_MANAGER_ROLES);
  const { id } = await params;
  const post = await prisma.post.findUnique({ where: { id } });

  if (!post) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-[var(--ink)]">Edit post</h1>
      <PostForm post={mapPostToForm(post)} />
    </div>
  );
}