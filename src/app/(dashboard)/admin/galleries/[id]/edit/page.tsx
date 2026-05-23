import { notFound } from "next/navigation";

import { GalleryForm, mapGalleryToForm } from "@/components/forms/gallery-form";
import { requireRole } from "@/lib/auth";
import { CONTENT_MANAGER_ROLES } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

type Params = Promise<{ id: string }>;

export default async function EditGalleryPage({ params }: { params: Params }) {
  await requireRole(CONTENT_MANAGER_ROLES);
  const { id } = await params;
  const gallery = await prisma.gallery.findUnique({ where: { id }, include: { images: true } });

  if (!gallery) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-[var(--ink)]">Edit gallery</h1>
      <GalleryForm gallery={mapGalleryToForm(gallery)} />
    </div>
  );
}