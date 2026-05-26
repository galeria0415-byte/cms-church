import { SlideForm } from "@/components/forms/slide-form";
import { requireRole } from "@/lib/auth";
import { CONTENT_MANAGER_ROLES } from "@/lib/permissions";

export default async function NewSlidePage() {
  await requireRole(CONTENT_MANAGER_ROLES);
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-[var(--ink)]">New slide</h1>
      <SlideForm />
    </div>
  );
}
