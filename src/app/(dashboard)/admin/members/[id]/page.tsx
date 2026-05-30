import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DeleteButton } from "@/components/ui/delete-button";
import { prisma } from "@/lib/prisma";
import { formatDate, fullName, parseCsv } from "@/lib/utils";

import { ArchiveButton } from "./archive-button";

type Params = Promise<{ id: string }>;

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3">
      <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">{label}</p>
      <p className="mt-2 text-sm text-[var(--ink)]">{value || "-"}</p>
    </div>
  );
}

function DetailLinkRow({ label, value, href }: { label: string; value?: string | null; href?: string }) {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3">
      <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">{label}</p>
      {href ? (
        <Link href={href} className="mt-2 block text-sm font-medium text-[var(--accent)] hover:underline">
          {value || "-"}
        </Link>
      ) : (
        <p className="mt-2 text-sm text-[var(--ink)]">{value || "-"}</p>
      )}
    </div>
  );
}

export default async function MemberDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const member = await prisma.member.findUnique({ where: { id } });

  if (!member) {
    notFound();
  }

  // Collect all linked memberIds for batch lookup
  let childrenLinks: Array<{ name?: string; memberId?: string }> = [];
  try { childrenLinks = JSON.parse(member.childrenLinks ?? "[]"); } catch { /* empty */ }

  const linkedMemberIds = [
    member.fatherMemberId,
    member.motherMemberId,
    member.spouseMemberId,
    ...childrenLinks.map((c) => c.memberId),
  ].filter((mid): mid is string => !!mid);

  const linkedMembers = linkedMemberIds.length > 0
    ? await prisma.member.findMany({
        where: { memberId: { in: linkedMemberIds } },
        select: { id: true, memberId: true, firstName: true, lastName: true },
      })
    : [];

  const memberLinkMap = new Map(linkedMembers.map((m) => [m.memberId, `/admin/members/${m.id}`]));

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-center gap-4">
          {member.profilePhotoUrl ? (
            <img src={member.profilePhotoUrl} alt={fullName(member)} className="h-20 w-20 rounded-full border border-[var(--line)] object-cover shadow-sm" />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--surface-subtle)] text-2xl font-semibold text-[var(--accent)]">
              {fullName(member).slice(0, 1).toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">Member profile</p>
            <h1 className="mt-2 text-xl font-semibold text-[var(--ink)]">{fullName(member)}</h1>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge>{member.memberId}</Badge>
              <Badge>{member.membershipStatus}</Badge>
              <Badge>{member.recordStatus}</Badge>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href={`/admin/members/${member.id}/edit`} className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)]">
            Edit member
          </Link>
          <ArchiveButton id={member.id} />
          <DeleteButton
            apiPath={`/api/members/${member.id}?hard=true`}
            label="Delete permanently"
            confirmMessage={`Permanently delete ${fullName(member)}? This will remove all their data and cannot be undone.`}
            redirectTo="/admin/members"
          />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-base font-semibold text-[var(--ink)]">Personal information</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <DetailRow label="Birth date" value={formatDate(member.birthDate)} />
            <DetailRow label="Gender" value={member.gender} />
            <DetailRow label="Nationality" value={member.nationality} />
            <DetailRow label="Civil status" value={member.civilStatus} />
            <DetailRow label="Contact number" value={member.contactNumber} />
            <DetailRow label="Email" value={member.email} />
            <DetailRow label="Address" value={member.address} />
            <DetailRow label="Emergency contact" value={[member.emergencyContactName, member.emergencyContactNumber].filter(Boolean).join(" / ")} />
          </div>
        </Card>
        <Card>
          <h2 className="text-base font-semibold text-[var(--ink)]">Family and work</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <DetailLinkRow label="Spouse" value={member.spouseName} href={member.spouseMemberId ? memberLinkMap.get(member.spouseMemberId) : undefined} />
            <DetailRow label="Wedding date" value={formatDate(member.weddingDate)} />
            <DetailLinkRow label="Father" value={member.fatherName} href={member.fatherMemberId ? memberLinkMap.get(member.fatherMemberId) : undefined} />
            <DetailLinkRow label="Mother" value={member.motherName} href={member.motherMemberId ? memberLinkMap.get(member.motherMemberId) : undefined} />
            <div className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Children</p>
              {childrenLinks.length === 0 ? (
                <p className="mt-2 text-sm text-[var(--ink)]">-</p>
              ) : (
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                  {childrenLinks.map((c, i) => {
                    const href = c.memberId ? memberLinkMap.get(c.memberId) : undefined;
                    return href ? (
                      <Link key={i} href={href} className="text-sm font-medium text-[var(--accent)] hover:underline">{c.name || "(unnamed)"}</Link>
                    ) : (
                      <span key={i} className="text-sm text-[var(--ink)]">{c.name || "(unnamed)"}</span>
                    );
                  })}
                </div>
              )}
            </div>
            <DetailRow label="Occupation" value={member.occupation} />
            <DetailRow label="Company" value={member.companyName} />
            <DetailRow label="Employment status" value={member.employmentStatus} />
            <DetailRow label="Work address" value={member.workAddress} />
          </div>
        </Card>
        <Card>
          <h2 className="text-base font-semibold text-[var(--ink)]">Church affiliation</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <DetailRow label="Joined church" value={formatDate(member.dateJoinedChurch)} />
            <DetailRow label="Membership type" value={member.membershipType} />
            <DetailRow label="Membership category" value={member.membershipCategory} />
            <DetailRow label="Church organization" value={member.churchOrganization} />
            <DetailRow label="Baptized date" value={formatDate(member.baptizedDate)} />
            <DetailRow label="Confirmation date" value={formatDate(member.confirmationDate)} />
            <DetailRow label="Shepherding group" value={member.shepherdingGroup} />
            <DetailRow label="Attendance" value={member.serviceAttendanceStatus} />
            <DetailRow label="Previous church" value={member.previousChurch} />
          </div>
        </Card>
        <Card>
          <h2 className="text-base font-semibold text-[var(--ink)]">Ministry information</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <DetailRow label="Ministry roles" value={(() => { try { return (JSON.parse(member.ministryRoles ?? "[]") as Array<{ ministry: string; role: string }>).map((r) => `${r.ministry}: ${r.role}`).filter((r) => r !== ": ").join("; "); } catch { return ""; } })()} />
            <DetailRow label="Training completed" value={parseCsv(member.trainingCompleted).join(", ")} />
            <DetailRow label="Notes" value={member.notes} />
            <DetailRow label="Remarks" value={member.remarks} />
            <DetailRow label="Death anniversary" value={formatDate(member.deceasedDate)} />
          </div>
        </Card>
      </section>
    </div>
  );
}