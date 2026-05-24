import Link from "next/link";
import { MembershipStatus, RecordStatus } from "@prisma/client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { prisma } from "@/lib/prisma";
import { formatDate, fullName, titleize } from "@/lib/utils";

type SearchParams = Promise<{
  q?: string;
  page?: string;
  status?: MembershipStatus;
  recordStatus?: RecordStatus;
  sort?: "newest" | "oldest" | "name";
}>;

const pageSize = 10;

export default async function MembersPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const page = Number(params.page ?? 1);
  const status = params.status;
  const recordStatus = params.recordStatus;
  const sort = params.sort ?? "name";

  const where = {
    isArchived: false,
    ...(status ? { membershipStatus: status } : {}),
    ...(recordStatus ? { recordStatus } : {}),
    ...(query
      ? {
          OR: [
            { firstName: { contains: query, mode: "insensitive" as const } },
            { lastName: { contains: query, mode: "insensitive" as const } },
            { memberId: { contains: query, mode: "insensitive" as const } },
            { shepherdingGroup: { contains: query, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const orderBy =
    sort === "newest"
      ? [{ createdAt: "desc" as const }]
      : sort === "oldest"
        ? [{ createdAt: "asc" as const }]
        : [{ lastName: "asc" as const }, { firstName: "asc" as const }];

  const [members, total] = await Promise.all([
    prisma.member.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.member.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">Membership database</p>
          <h1 className="mt-2 text-xl font-semibold text-[var(--ink)]">Members</h1>
        </div>
        <Link href="/admin/members/new">
          <Button>Add member</Button>
        </Link>
      </section>

      <Card>
        <form className="grid gap-4 lg:grid-cols-[2fr_1fr_1fr_1fr]">
          <input name="q" defaultValue={query} placeholder="Search by name, member ID, ministry, or group" className="h-11 rounded-2xl border border-[var(--line)] bg-white px-4 text-sm outline-none" />
          <select name="status" defaultValue={status ?? ""} className="h-11 rounded-2xl border border-[var(--line)] bg-white px-4 text-sm outline-none">
            <option value="">All membership statuses</option>
            {Object.values(MembershipStatus).map((option) => <option key={option} value={option}>{titleize(option)}</option>)}
          </select>
          <select name="recordStatus" defaultValue={recordStatus ?? ""} className="h-11 rounded-2xl border border-[var(--line)] bg-white px-4 text-sm outline-none">
            <option value="">All record statuses</option>
            {Object.values(RecordStatus).map((option) => <option key={option} value={option}>{titleize(option)}</option>)}
          </select>
          <select name="sort" defaultValue={sort} className="h-11 rounded-2xl border border-[var(--line)] bg-white px-4 text-sm outline-none">
            <option value="name">Sort by name</option>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
          <Button type="submit" variant="secondary" className="lg:col-span-4 lg:justify-self-start">
            Apply filters
          </Button>
        </form>
      </Card>

      {members.length === 0 ? (
        <EmptyState title="No members found" message="Adjust your filters or add a new member record to get started." />
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[var(--line)] text-left text-sm">
              <thead className="bg-[var(--mist)] text-[var(--muted)]">
                <tr>
                  <th className="px-5 py-4 font-medium">Member</th>
                  <th className="px-5 py-4 font-medium">Status</th>
                  <th className="px-5 py-4 font-medium">Shepherding Group</th>
                  <th className="px-5 py-4 font-medium">Dates</th>
                  <th className="px-5 py-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)] bg-white">
                {members.map((member) => (
                  <tr key={member.id} className="align-top">
                    <td className="px-5 py-5">
                      <div className="flex items-center gap-3">
                        {member.profilePhotoUrl ? (
                          <img src={member.profilePhotoUrl} alt={fullName(member)} className="h-12 w-12 rounded-full border border-[var(--line)] object-cover" />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--surface-subtle)] text-sm font-semibold text-[var(--accent)]">
                            {fullName(member).slice(0, 1).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-[var(--ink)]">{fullName(member)}</p>
                          <p className="text-sm text-[var(--muted)]">{member.memberId}</p>
                          <p className="text-sm text-[var(--muted)]">{member.email ?? member.contactNumber ?? "No contact info"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-5">
                      <Badge>{titleize(member.membershipStatus)}</Badge>
                      <p className="mt-2 text-sm text-[var(--muted)]">{titleize(member.recordStatus)}</p>
                    </td>
                    <td className="px-5 py-5 text-[var(--muted)]">{member.shepherdingGroup ?? "-"}</td>
                    <td className="px-5 py-5 text-[var(--muted)]">
                      <p>Birth: {formatDate(member.birthDate, "MMM d, yyyy")}</p>
                      <p>Joined: {formatDate(member.dateJoinedChurch, "MMM d, yyyy")}</p>
                    </td>
                    <td className="px-5 py-5">
                      <div className="flex flex-wrap gap-2">
                        <Link href={`/admin/members/${member.id}`} className="rounded-full border border-[var(--line)] px-3 py-1.5 font-medium text-[var(--ink)]">
                          View
                        </Link>
                        <Link href={`/admin/members/${member.id}/edit`} className="rounded-full border border-[var(--line)] px-3 py-1.5 font-medium text-[var(--ink)]">
                          Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-[var(--line)] px-5 py-4 text-sm text-[var(--muted)]">
            <p>
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-3">
              <Link href={`?q=${encodeURIComponent(query)}&status=${status ?? ""}&recordStatus=${recordStatus ?? ""}&sort=${sort}&page=${Math.max(1, page - 1)}`} className="rounded-full border border-[var(--line)] px-4 py-2">
                Previous
              </Link>
              <Link href={`?q=${encodeURIComponent(query)}&status=${status ?? ""}&recordStatus=${recordStatus ?? ""}&sort=${sort}&page=${Math.min(totalPages, page + 1)}`} className="rounded-full border border-[var(--line)] px-4 py-2">
                Next
              </Link>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}