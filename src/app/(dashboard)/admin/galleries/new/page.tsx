import { GalleryForm } from "@/components/forms/gallery-form";
import { requireRole } from "@/lib/auth";
import { CONTENT_MANAGER_ROLES } from "@/lib/permissions";

export default async function NewGalleryPage() {
  await requireRole(CONTENT_MANAGER_ROLES);

  return (
    <div className="space-y-4">
      <h1 className="font-serif text-4xl text-[var(--ink)]">Create gallery</h1>
      <GalleryForm />
    </div>
  );
}