import { SlideForm } from "@/components/forms/slide-form";
import { requireRole } from "@/lib/auth";
import { CONTENT_MANAGER_ROLES } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export default async function EditSlidePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireRole(CONTENT_MANAGER_ROLES);
  const slide = await prisma.slide.findUnique({ where: { id } });
  if (!slide) return <div className="text-red-500">Slide not found.</div>;
  
  // Convert nulls to empty strings for form
  const slideData = {
    ...slide,
    title: slide.title ?? "",
    caption: slide.caption ?? "",
    linkUrl: slide.linkUrl ?? "",
    linkLabel: slide.linkLabel ?? "",
  };
  
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-[var(--ink)]">Edit slide</h1>
      <SlideForm initialData={slideData} />
    </div>
  );
}
