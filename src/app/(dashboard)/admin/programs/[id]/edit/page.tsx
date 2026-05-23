import { notFound } from "next/navigation";

import { ProgramForm, mapProgramToForm } from "@/components/forms/program-form";
import { requireRole } from "@/lib/auth";
import { CONTENT_MANAGER_ROLES } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

type Params = Promise<{ id: string }>;

export default async function EditProgramPage({ params }: { params: Params }) {
  await requireRole(CONTENT_MANAGER_ROLES);
  const { id } = await params;
  const program = await prisma.program.findUnique({ where: { id } });

  if (!program) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <h1 className="font-serif text-4xl text-[var(--ink)]">Edit program</h1>
      <ProgramForm program={mapProgramToForm(program)} />
    </div>
  );
}