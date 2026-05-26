import { UserRole } from "@prisma/client";
import { notFound } from "next/navigation";

import { UserForm } from "@/components/forms/user-form";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireRole([UserRole.ADMIN]);

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true },
  });

  if (!user) notFound();

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-[var(--ink)]">Edit user</h1>
      <UserForm initialData={{ ...user, role: user.role as string }} />
    </div>
  );
}
