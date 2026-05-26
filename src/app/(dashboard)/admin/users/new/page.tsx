import { UserRole } from "@prisma/client";

import { UserForm } from "@/components/forms/user-form";
import { requireRole } from "@/lib/auth";

export default async function NewUserPage() {
  await requireRole([UserRole.ADMIN]);
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-[var(--ink)]">New user</h1>
      <UserForm />
    </div>
  );
}
