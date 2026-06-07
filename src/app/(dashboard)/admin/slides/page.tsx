import Link from "next/link";

import { buttonStyles } from "@/components/ui/button";
import { DeleteButton } from "@/components/ui/delete-button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { requireRole } from "@/lib/auth";
import { CONTENT_MANAGER_ROLES } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export default async function SlidesPage() {
  await requireRole(CONTENT_MANAGER_ROLES);
  const slides = await prisma.slide.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">CMS</p>
          <h1 className="mt-2 text-xl font-semibold text-[var(--ink)]">Homepage Slides</h1>
        </div>
        <Link href="/admin/slides/new" className={buttonStyles({ className: "no-underline" })}>
          New slide
        </Link>
      </div>
      {slides.length === 0 ? (
        <EmptyState title="No slides yet" message="Create slides to display in the homepage hero carousel." />
      ) : (
        <Card>
          <div className="space-y-3">
            {slides.map((slide) => (
              <div key={slide.id} className="flex flex-col gap-3 rounded-2xl border border-[var(--line)] p-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-28 flex-none items-center justify-center overflow-hidden rounded-xl bg-[var(--surface-subtle)]">
                    {slide.mediaType === "video" ? (
                      <span className="text-xs text-[var(--muted)]">▶ Video</span>
                    ) : (
                      <img src={slide.mediaUrl} alt={slide.title ?? ""} className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-[var(--ink)]">{slide.title ?? <span className="italic text-[var(--muted)]">No title</span>}</p>
                    {slide.caption && <p className="mt-0.5 text-xs text-[var(--muted)] line-clamp-1">{slide.caption}</p>}
                    <div className="mt-1 flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${slide.isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                        {slide.isActive ? "Active" : "Hidden"}
                      </span>
                      <span className="text-[10px] text-[var(--muted)]">Order: {slide.sortOrder}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/admin/slides/${slide.id}/edit`} className="rounded-full border border-[var(--line)] px-3 py-1.5 text-xs font-medium text-[var(--ink)] hover:bg-[var(--surface-subtle)]">
                    Edit
                  </Link>
                  <DeleteButton apiPath={`/api/slides/${slide.id}`} label="slide" redirectTo="/admin/slides" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
