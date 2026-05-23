import Link from "next/link";

import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { prisma } from "@/lib/prisma";

export default async function GalleriesPage() {
  const galleries = await prisma.gallery.findMany({ include: { images: true }, orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">CMS</p>
          <h1 className="mt-2 text-xl font-semibold text-[var(--ink)]">Galleries</h1>
        </div>
        <Link href="/admin/galleries/new" className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white">
          New gallery
        </Link>
      </div>
      {galleries.length === 0 ? (
        <EmptyState title="No galleries yet" message="Create a gallery album and upload event photos." />
      ) : (
        <Card>
          <div className="space-y-3">
            {galleries.map((gallery) => (
              <div key={gallery.id} className="flex flex-col gap-2 rounded-2xl border border-[var(--line)] px-4 py-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold text-[var(--ink)]">{gallery.title}</p>
                  <p className="text-sm text-[var(--muted)]">{gallery.images.length} images</p>
                </div>
                <Link href={`/admin/galleries/${gallery.id}/edit`} className="text-sm font-semibold text-[var(--accent)]">Edit</Link>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}