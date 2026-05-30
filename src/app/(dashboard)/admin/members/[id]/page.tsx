import Link from "next/link";
import { notFound } from "next/navigation";

import { MembershipStatus } from "@prisma/client";

import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/ui/delete-button";
import { getMemberRecord } from "@/lib/member-record";
import { formatDate, fullName, parseCsv, titleize } from "@/lib/utils";

import { ArchiveButton } from "./archive-button";

type Params = Promise<{ id: string }>;

function ActionLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex h-10 items-center justify-center rounded-lg border border-[var(--line)] bg-white px-4 text-sm font-medium text-[var(--ink)] transition hover:bg-[var(--sand)]"
    >
      {children}
    </Link>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[28px] border border-[var(--line)] bg-white p-6 shadow-sm">
      <div className="border-b border-[var(--line)] pb-4">
        <h2 className="text-lg font-semibold text-[var(--ink)]">{title}</h2>
      </div>
      <div className="mt-2 divide-y divide-[var(--line)]">{children}</div>
    </section>
  );
}

function Row({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="grid gap-2 py-3 sm:grid-cols-[220px_minmax(0,1fr)] sm:gap-6">
      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">{label}</div>
      <div className="min-w-0 text-sm leading-6 text-[var(--ink)]">{value || "-"}</div>
    </div>
  );
}

export default async function MemberDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const record = await getMemberRecord(id);

  if (!record) {
    notFound();
  }

  const {
    member,
    spouseHref,
    fatherHref,
    motherHref,
    resolvedChildren,
    ministryRoles,
  } = record;

  const summaryLine = [
    member.gender ? titleize(member.gender) : null,
    member.civilStatus ? titleize(member.civilStatus) : null,
    member.nationality,
    member.dateJoinedChurch ? `Joined ${formatDate(member.dateJoinedChurch)}` : null,
  ].filter(Boolean).join(" / ");
  const nickname = String((member as Record<string, unknown>).nickname ?? "");

  const ministryText = ministryRoles
    .map((role) => [role.ministry, role.role].filter(Boolean).join(": "))
    .filter(Boolean)
    .join("; ");

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-[var(--line)] bg-white p-6 shadow-sm lg:p-8">
        <div className="grid gap-6 lg:grid-cols-[180px_minmax(0,1fr)_240px]">
          <div className="mx-auto w-full max-w-[180px]">
            {member.profilePhotoUrl ? (
              <img
                src={member.profilePhotoUrl}
                alt={fullName(member)}
                className="aspect-[4/5] w-full rounded-[24px] border border-[var(--line)] object-cover"
              />
            ) : (
              <div className="flex aspect-[4/5] w-full items-center justify-center rounded-[24px] border border-[var(--line)] bg-[var(--surface-subtle)] text-4xl font-semibold text-[var(--accent)]">
                {fullName(member).slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>

          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">Member profile</p>
            <h1 className="mt-3 text-3xl font-semibold leading-tight text-[var(--ink)]">{fullName(member)}</h1>
            {summaryLine ? <p className="mt-3 text-sm text-[var(--muted)]">{summaryLine}</p> : null}

            <div className="mt-4 flex flex-wrap gap-2">
              <Badge>{member.memberId}</Badge>
              <Badge>{titleize(member.membershipStatus)}</Badge>
              <Badge>{titleize(member.recordStatus)}</Badge>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <ActionLink href={`/admin/members/${member.id}/edit`}>Edit member</ActionLink>
            <ActionLink href={`/print/members/${member.id}`}>
              Print profile
            </ActionLink>
            <ActionLink href={`/print/members/${member.id}/certificate/baptism`}>
              Baptism certificate
            </ActionLink>
            <ActionLink href={`/print/members/${member.id}/certificate/confirmation`}>
              Confirmation certificate
            </ActionLink>
            <ArchiveButton id={member.id} />
            <DeleteButton
              apiPath={`/api/members/${member.id}?hard=true`}
              label="Delete permanently"
              confirmMessage={`Permanently delete ${fullName(member)}? This will remove all their data and cannot be undone.`}
              redirectTo="/admin/members"
            />
          </div>
        </div>
      </section>

      <Section title="Personal & Contact">
        <Row label="Member ID" value={member.memberId} />
        <Row label="First name" value={member.firstName} />
        <Row label="Middle name" value={member.middleName} />
        <Row label="Last name" value={member.lastName} />
        <Row label="Suffix" value={member.suffix} />
        <Row label="Nickname" value={nickname} />
        <Row label="Date of birth" value={formatDate(member.birthDate)} />
        <Row label="Gender" value={member.gender ? titleize(member.gender) : undefined} />
        <Row label="Citizenship" value={member.nationality} />
        <Row label="Civil status" value={member.civilStatus ? titleize(member.civilStatus) : undefined} />
        <Row label="Contact number" value={member.contactNumber} />
        <Row label="Email address" value={member.email} />
        <Row label="Address" value={member.address} />
        <Row label="Emergency contact name" value={member.emergencyContactName} />
        <Row label="Emergency contact number" value={member.emergencyContactNumber} />
      </Section>

      <Section title="Family">
        <Row
          label="Spouse"
          value={spouseHref ? <Link href={spouseHref} className="font-medium text-[var(--accent)] hover:underline">{member.spouseName || "-"}</Link> : member.spouseName}
        />
        <Row label="Spouse member ID" value={member.spouseMemberId} />
        <Row label="Wedding date" value={formatDate(member.weddingDate)} />
        <Row
          label="Father's name"
          value={fatherHref ? <Link href={fatherHref} className="font-medium text-[var(--accent)] hover:underline">{member.fatherName || "-"}</Link> : member.fatherName}
        />
        <Row label="Father's member ID" value={member.fatherMemberId} />
        <Row label="Father's date of birth" value={formatDate(member.fatherBirthDate)} />
        <Row label="Father's date of death" value={formatDate(member.fatherDeceasedDate)} />
        <Row
          label="Mother's name"
          value={motherHref ? <Link href={motherHref} className="font-medium text-[var(--accent)] hover:underline">{member.motherName || "-"}</Link> : member.motherName}
        />
        <Row label="Mother's member ID" value={member.motherMemberId} />
        <Row label="Mother's date of birth" value={formatDate(member.motherBirthDate)} />
        <Row label="Mother's date of death" value={formatDate(member.motherDeceasedDate)} />
        <Row
          label="Children"
          value={resolvedChildren.length ? (
            <div className="flex flex-wrap gap-2">
              {resolvedChildren.map((child, index) =>
                child.href ? (
                  <Link key={`${child.memberId}-${index}`} href={child.href} className="rounded-full bg-[var(--surface-subtle)] px-3 py-1 text-sm font-medium text-[var(--accent)] hover:bg-[var(--sand)]">
                    {child.name || "(unnamed)"}
                  </Link>
                ) : (
                  <span key={`${child.name}-${index}`} className="rounded-full bg-[var(--surface-subtle)] px-3 py-1 text-sm text-[var(--ink)]">
                    {child.name || "(unnamed)"}
                  </span>
                ),
              )}
            </div>
          ) : undefined}
        />
        <Row label="Guardian" value={member.guardian} />
      </Section>

      <Section title="Education & Work">
        <Row label="Highest education" value={member.highestEducation} />
        <Row label="School attended" value={member.schoolAttended} />
        <Row label="Course / degree" value={member.courseOrDegree} />
        <Row label="Occupation" value={member.occupation} />
        <Row label="Company / employer" value={member.companyName} />
        <Row label="Employment status" value={member.employmentStatus} />
        <Row label="Work address" value={member.workAddress} />
      </Section>

      <Section title="Church Membership">
        <Row label="Date joined church" value={formatDate(member.dateJoinedChurch)} />
        <Row label="Membership status" value={titleize(member.membershipStatus)} />
        {member.membershipStatus === MembershipStatus.DECEASED && (
          <Row label="Date of death" value={formatDate(member.deceasedDate)} />
        )}
        <Row label="Membership type" value={titleize(member.membershipType)} />
        <Row label="Membership category" value={member.membershipCategory} />
        <Row label="Church organization" value={member.churchOrganization} />
        <Row label="Date baptized" value={formatDate(member.baptizedDate)} />
        <Row label="Confirmation date" value={formatDate(member.confirmationDate)} />
        <Row label="Previous church" value={member.previousChurch} />
        <Row label="Shepherding group" value={member.shepherdingGroup} />
        <Row label="Service attendance" value={member.serviceAttendanceStatus ? titleize(member.serviceAttendanceStatus) : undefined} />
        <Row label="Record status" value={titleize(member.recordStatus)} />
      </Section>

      <Section title="Ministry & Notes">
        <Row label="Ministry roles" value={ministryText} />
        <Row label="Training completed" value={parseCsv(member.trainingCompleted).join(", ")} />
        <Row label="Notes" value={member.notes} />
        <Row label="Remarks" value={member.remarks} />
      </Section>
    </div>
  );
}