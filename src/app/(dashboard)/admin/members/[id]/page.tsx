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
    <div className={span ? "sm:col-span-2" : ""}>
      <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">{label}</dt>
      <dd className="mt-1.5 text-sm leading-6 text-[var(--ink)]">{value || "-"}</dd>
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
    <div className={span ? "sm:col-span-2" : ""}>
      <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">{label}</dt>
      {href ? (
        <dd className="mt-1.5">
          <Link href={href} className="text-sm font-medium text-[var(--accent)] hover:underline">
            {value || "-"}
          </Link>
        </dd>
      ) : (
        <dd className="mt-1.5 text-sm leading-6 text-[var(--ink)]">{value || "-"}</dd>
      )}
    </div>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-[var(--line)] bg-white p-6 shadow-sm">
      <div className="border-b border-[var(--line)] pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{title}</p>
        {description ? <p className="mt-2 text-sm text-[var(--muted)]">{description}</p> : null}
      </div>
      <dl className="mt-5 grid gap-x-8 gap-y-5 sm:grid-cols-2">{children}</dl>
    </section>
  );
}

function Stat({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-2xl bg-[var(--surface-subtle)] px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">{label}</p>
      <p className="mt-2 text-sm font-medium text-[var(--ink)]">{value || "-"}</p>
    </div>
  );
}

function ActionLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex h-10 items-center justify-center rounded-lg bg-[var(--accent)] px-4 text-sm font-medium text-white transition hover:bg-[var(--accent-strong)]"
    >
      {children}
    </Link>
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
  ].filter(Boolean).join(" / ");

  const ministryText = (() => {
    try {
      return (JSON.parse(member.ministryRoles ?? "[]") as Array<{ ministry: string; role: string }>)
        .map((r) => `${r.ministry}: ${r.role}`)
        .filter((r) => r !== ": ")
        .join("; ");
    } catch { return ""; }
  })();

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-[var(--line)] bg-white p-6 shadow-sm lg:p-8">
        <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)_220px]">
          <div className="mx-auto w-full max-w-[220px]">
            {member.profilePhotoUrl ? (
              <img
                src={member.profilePhotoUrl}
                alt={fullName(member)}
                className="aspect-[4/5] w-full rounded-[28px] border border-[var(--line)] object-cover"
              />
            ) : (
              <div className="flex aspect-[4/5] w-full items-center justify-center rounded-[28px] border border-[var(--line)] bg-[var(--surface-subtle)] text-4xl font-semibold text-[var(--accent)]">
                {fullName(member).slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>

          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">Member record</p>
            <h1 className="mt-3 text-3xl font-semibold leading-tight text-[var(--ink)]">{fullName(member)}</h1>
            {summaryLine ? <p className="mt-3 text-sm text-[var(--muted)]">{summaryLine}</p> : null}

            <div className="mt-4 flex flex-wrap gap-2">
              <Badge>{member.memberId}</Badge>
              <Badge>{member.membershipStatus}</Badge>
              <Badge>{member.recordStatus}</Badge>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <Stat label="Church organization" value={member.churchOrganization} />
              <Stat label="Membership type" value={member.membershipType} />
              <Stat label="Attendance" value={member.serviceAttendanceStatus} />
              <Stat label="Shepherding group" value={member.shepherdingGroup} />
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:items-stretch">
            <ActionLink href={`/admin/members/${member.id}/edit`}>Edit member</ActionLink>
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

      <div className="grid gap-5 lg:grid-cols-2">
        <Section title="Personal information" description="Identity, contact details, and emergency information.">
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

        <Section title="Church affiliation" description="Membership standing, sacramental dates, and church placement.">
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

        <Section title="Family and relationships" description="Immediate family references and linked member profiles.">
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
            <div className="sm:col-span-2">
              <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Children</dt>
              <dd className="mt-2 flex flex-wrap gap-2">
                {childrenLinks.map((c, i) => {
                  const href = c.memberId ? memberLinkMap.get(c.memberId) : undefined;
                  return href ? (
                    <Link
                      key={i}
                      href={href}
                      className="rounded-full bg-[var(--surface-subtle)] px-3 py-1.5 text-sm font-medium text-[var(--accent)] transition hover:bg-[var(--sand)]"
                    >
                      {c.name || "(unnamed)"}
                    </Link>
                  ) : (
                    <span key={i} className="rounded-full bg-[var(--surface-subtle)] px-3 py-1.5 text-sm text-[var(--ink)]">
                      {c.name || "(unnamed)"}
                    </span>
                  );
                })}
              </dd>
            </div>
          ) : (
            <Field label="Children" value={null} />
          )}
          <Field label="Guardian" value={member.guardian} />
        </Section>

        <Section title="Ministry and work" description="Service history, training, and employment background.">
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