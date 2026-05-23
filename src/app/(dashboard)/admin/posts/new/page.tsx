import { PostForm } from "@/components/forms/post-form";
import { requireRole } from "@/lib/auth";
import { CONTENT_MANAGER_ROLES } from "@/lib/permissions";

export default async function NewPostPage() {
  await requireRole(CONTENT_MANAGER_ROLES);

  return (
    <div className="space-y-4">
      <h1 className="font-serif text-4xl text-[var(--ink)]">Create post</h1>
      <PostForm />
    </div>
  );
}