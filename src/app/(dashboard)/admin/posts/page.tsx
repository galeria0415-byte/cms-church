import Link from "next/link";

import { DeleteButton } from "@/components/ui/delete-button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function PostsPage() {
  const posts = await prisma.post.findMany({ orderBy: [{ publishDate: "desc" }, { createdAt: "desc" }] });

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">CMS</p>
          <h1 className="mt-2 text-xl font-semibold text-[var(--ink)]">Posts and updates</h1>
        </div>
        <Link href="/admin/posts/new" className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white">
          New post
        </Link>
      </div>
      {posts.length === 0 ? (
        <EmptyState title="No posts yet" message="Create a church update or featured announcement." />
      ) : (
        <Card>
          <div className="space-y-3">
            {posts.map((post) => (
              <div key={post.id} className="flex flex-col gap-2 rounded-2xl border border-[var(--line)] px-4 py-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold text-[var(--ink)]">{post.title}</p>
                  <p className="text-sm text-[var(--muted)]">{post.status} • {formatDate(post.publishDate)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/admin/posts/${post.id}/edit`} className="text-sm font-semibold text-[var(--accent)]">Edit</Link>
                  <DeleteButton apiPath={`/api/posts/${post.id}`} label="Delete" confirmMessage={`Delete post "${post.title}"? This cannot be undone.`} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}