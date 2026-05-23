import { MemberForm } from "@/components/forms/member-form";
import { requireRole } from "@/lib/auth";
import { MEMBER_MANAGER_ROLES } from "@/lib/permissions";

export default async function NewMemberPage() {
  await requireRole(MEMBER_MANAGER_ROLES);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">Membership database</p>
        <h1 className="mt-2 text-xl font-semibold text-[var(--ink)]">Create member</h1>
      </div>
      <MemberForm />
    </div>
  );
}