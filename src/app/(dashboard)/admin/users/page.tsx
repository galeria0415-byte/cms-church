import Link from "next/link";
import { UserRole } from "@prisma/client";

import { DeleteButton } from "@/components/ui/delete-button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

const ROLE_COLORS: Record<UserRole, string> = {
  ADMIN: "bg-red-100 text-red-700",
  EDITOR: "bg-blue-100 text-blue-700",
  STAFF: "bg-amber-100 text-amber-700",
  VIEWER: "bg-gray-100 text-gray-600",
};

export default async function UsersPage() {
  const session = await requireRole([UserRole.ADMIN]);
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">Admin</p>
          <h1 className="mt-2 text-xl font-semibold text-[var(--ink)]">Users</h1>
        </div>
        <Link href="/admin/users/new" className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white">
          New user
        </Link>
      </div>

      {users.length === 0 ? (
        <EmptyState title="No users" message="Create admin and staff accounts." />
      ) : (
        <Card>
          <div className="space-y-3">
            {users.map((user) => (
              <div key={user.id} className="flex flex-col gap-3 rounded-2xl border border-[var(--line)] p-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-medium text-[var(--ink)]">{user.name ?? <span className="italic text-[var(--muted)]">No name</span>}</p>
                  <p className="mt-0.5 text-sm text-[var(--muted)]">{user.email}</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${ROLE_COLORS[user.role]}`}>
                      {user.role}
                    </span>
                    <span className="text-[10px] text-[var(--muted)]">Joined {formatDate(user.createdAt)}</span>
                    {user.id === session.user.id && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-emerald-700">You</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/admin/users/${user.id}/edit`} className="rounded-full border border-[var(--line)] px-3 py-1.5 text-xs font-medium text-[var(--ink)] hover:bg-[var(--surface-subtle)]">
                    Edit
                  </Link>
                  {user.id !== session.user.id && (
                    <DeleteButton apiPath={`/api/users/${user.id}`} label="user" redirectTo="/admin/users" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
