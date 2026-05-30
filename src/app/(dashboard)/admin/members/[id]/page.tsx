import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/ui/delete-button";
import { prisma } from "@/lib/prisma";
import { formatDate, fullName, parseCsv } from "@/lib/utils";

import { ArchiveButton } from "./archive-button";

type Params = Promise<{ id: string }>;

function Field({
  label,
  value,
  span,
}: {
  label: string;
  value?: string | null;
  span?: boolean;
}) {
  return (
    <div className={span ? "col-span-2" : ""}>
      <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">{label}</dt>
      <dd className="mt-1.5 text-sm text-[var(--ink)]">{value || "â€”"}</dd>
    </div>
  );
}

function FieldLink({
  label,
  value,
  href,
  span,
}: {
  label: string;
  value?: string | null;
  href?: string;
  span?: boolean;
}) {
  return (
    <div className={span ? "col-span-2" : ""}>
      <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">{label}</dt>
      {href ? (
        <dd className="mt-1.5">
          <Link href={href} className="text-sm font-medium text-[var(--accent)] hover:underline">
            {value || "â€”"}
          </Link>
        </dd>
      ) : (
        <dd className="mt-1.5 text-sm text-[var(--ink)]">{value || "â€”"}</dd>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[20px] border border-[var(--line)] bg-white p-6">
      <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--muted)]">{title}</h2>
      <dl className="mt-5 grid grid-cols-2 gap-x-8 gap-y-5">{children}</dl>
    </div>
  );
}

export default async function MemberDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const member = await prisma.member.findUnique({ where: { id } });

  if (!member) {
    notFound();
  }

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

  const summaryLine = [
    member.gender,
    member.civilStatus,
    member.nationality,
    member.dateJoinedChurch ? `Joined ${formatDate(member.dateJoinedChurch)}` : null,
  ].filter(Boolean).join(" Â· ");

  const ministryText = (() => {
    try {
      return (JSON.parse(member.ministryRoles ?? "[]") as Array<{ ministry: string; role: string }>)
        .map((r) => `${r.ministry}: ${r.role}`)
        .filter((r) => r !== ": ")
        .join("; ");
    } catch { return ""; }
  })();

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="rounded-[28px] border border-[var(--line)] bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="flex items-center gap-5">
            {member.profilePhotoUrl ? (
              <img
                src={member.profilePhotoUrl}
                alt={fullName(member)}
                className="h-[88px] w-[88px] rounded-2xl border border-[var(--line)] object-cover shadow-sm"
              />
            ) : (
              <div className="flex h-[88px] w-[88px] shrink-0 items-center justify-center rounded-2xl bg-[var(--surface-subtle)] text-2xl font-bold text-[var(--accent)]">
                {fullName(member).slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--muted)]">Member record</p>
              <h1 className="mt-1.5 text-2xl font-bold text-[var(--ink)]">{fullName(member)}</h1>
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <Badge>{member.memberId}</Badge>
                <Badge>{member.membershipStatus}</Badge>
                <Badge>{member.recordStatus}</Badge>
              </div>
              {summaryLine && (
                <p className="mt-2 text-sm text-[var(--muted)]">{summaryLine}</p>
              )}
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Link
              href={`/admin/members/${member.id}/edit`}
              className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)] transition hover:bg-[var(--sand)]"
            >
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
        </div>
      </div>

      {/* Sections */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Section title="Personal information">
          <Field label="Birth date" value={formatDate(member.birthDate)} />
          <Field label="Gender" value={member.gender} />
          <Field label="Civil status" value={member.civilStatus} />
          <Field label="Nationality" value={member.nationality} />
          <Field label="Contact number" value={member.contactNumber} />
          <Field label="Email" value={member.email} />
          <Field label="Address" value={member.address} span />
          <Field
            label="Emergency contact"
            value={[member.emergencyContactName, member.emergencyContactNumber].filter(Boolean).join(" / ")}
            span
          />
        </Section>

        <Section title="Church affiliation">
          <Field label="Joined church" value={formatDate(member.dateJoinedChurch)} />
          <Field label="Membership type" value={member.membershipType} />
          <Field label="Membership category" value={member.membershipCategory} />
          <Field label="Church organization" value={member.churchOrganization} />
          <Field label="Baptized date" value={formatDate(member.baptizedDate)} />
          <Field label="Confirmation date" value={formatDate(member.confirmationDate)} />
          <Field label="Shepherding group" value={member.shepherdingGroup} />
          <Field label="Attendance" value={member.serviceAttendanceStatus} />
          <Field label="Previous church" value={member.previousChurch} span />
        </Section>

        <Section title="Family and relationships">
          <FieldLink
            label="Spouse"
            value={member.spouseName}
            href={member.spouseMemberId ? memberLinkMap.get(member.spouseMemberId) : undefined}
          />
          <Field label="Wedding date" value={formatDate(member.weddingDate)} />
          <FieldLink
            label="Father"
            value={member.fatherName}
            href={member.fatherMemberId ? memberLinkMap.get(member.fatherMemberId) : undefined}
          />
          <FieldLink
            label="Mother"
            value={member.motherName}
            href={member.motherMemberId ? memberLinkMap.get(member.motherMemberId) : undefined}
          />
          {childrenLinks.length > 0 ? (
            <div className="col-span-2">
              <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Children</dt>
              <dd className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
                {childrenLinks.map((c, i) => {
                  const href = c.memberId ? memberLinkMap.get(c.memberId) : undefined;
                  return href ? (
                    <Link key={i} href={href} className="text-sm font-medium text-[var(--accent)] hover:underline">
                      {c.name || "(unnamed)"}
                    </Link>
                  ) : (
                    <span key={i} className="text-sm text-[var(--ink)]">{c.name || "(unnamed)"}</span>
                  );
                })}
              </dd>
            </div>
          ) : (
            <Field label="Children" value={null} />
          )}
          <Field label="Guardian" value={member.guardian} />
        </Section>

        <Section title="Ministry and work">
          <Field label="Ministry roles" value={ministryText} span />
          <Field label="Training completed" value={parseCsv(member.trainingCompleted).join(", ")} span />
          <Field label="Occupation" value={member.occupation} />
          <Field label="Company" value={member.companyName} />
          <Field label="Employment status" value={member.employmentStatus} />
          <Field label="Work address" value={member.workAddress} />
          <Field label="Notes" value={member.notes} span />
          <Field label="Remarks" value={member.remarks} span />
          <Field label="Death anniversary" value={formatDate(member.deceasedDate)} />
        </Section>
      </div>
    </div>
  );
}