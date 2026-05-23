import { ProgramForm } from "@/components/forms/program-form";
import { requireRole } from "@/lib/auth";
import { CONTENT_MANAGER_ROLES } from "@/lib/permissions";

export default async function NewProgramPage() {
  await requireRole(CONTENT_MANAGER_ROLES);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-[var(--ink)]">Create program</h1>
      <ProgramForm />
    </div>
  );
}