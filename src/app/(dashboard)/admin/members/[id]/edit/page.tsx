import { notFound } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { MEMBER_MANAGER_ROLES } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

import { EditMemberClient } from "./edit-member-client";

type Params = Promise<{ id: string }>;

export default async function EditMemberPage({ params }: { params: Params }) {
  await requireRole(MEMBER_MANAGER_ROLES);
  const { id } = await params;
  const member = await prisma.member.findUnique({ where: { id } });

  if (!member) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">Membership database</p>
        <h1 className="mt-2 text-xl font-semibold text-[var(--ink)]">Edit member</h1>
      </div>
      <EditMemberClient id={member.id} />
    </div>
  );
}