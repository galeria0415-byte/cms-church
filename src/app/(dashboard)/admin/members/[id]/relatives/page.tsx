import Link from "next/link";
import { notFound } from "next/navigation";

import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getMemberRecord } from "@/lib/member-record";
import { fullName } from "@/lib/utils";

type Params = Promise<{ id: string }>;

function RelativeCard({
  title,
  name,
  memberId,
  href,
}: {
  title: string;
  name?: string | null;
  memberId?: string | null;
  href?: string;
}) {
  const content = (
    <div className="rounded-2xl border border-[var(--line)] bg-white p-4 shadow-sm transition hover:bg-[var(--sand)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">{title}</p>
      <p className="mt-2 text-base font-semibold text-[var(--ink)]">{name || "-"}</p>
      {memberId ? <p className="mt-1 text-xs text-[var(--muted)]">{memberId}</p> : null}
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

export default async function MemberRelativesPage({ params }: { params: Params }) {
  const { id } = await params;
  const record = await getMemberRecord(id);

  if (!record) {
    notFound();
  }

  const { member, father, fatherHref, mother, motherHref, spouse, spouseHref, resolvedChildren } = record;
  const siblingOr: Prisma.MemberWhereInput[] = [];

  if (member.fatherMemberId) {
    siblingOr.push({ fatherMemberId: member.fatherMemberId });
  }

  if (member.motherMemberId) {
    siblingOr.push({ motherMemberId: member.motherMemberId });
  }

  const siblings = siblingOr.length
    ? await prisma.member.findMany({
        where: { OR: siblingOr, NOT: { id: member.id } },
        select: { id: true, memberId: true, firstName: true, middleName: true, lastName: true, suffix: true },
        orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      })
    : [];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">Family records</p>
        <h1 className="mt-2 text-2xl font-semibold text-[var(--ink)]">Relatives of {fullName(member)}</h1>
      </div>

      <section className="rounded-[28px] border border-[var(--line)] bg-[var(--surface-subtle)] p-6">
        <div className="grid gap-5 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Parents</p>
            <div className="grid gap-4 md:grid-cols-2">
              <RelativeCard
                title="Father"
                name={father ? fullName(father) : member.fatherName}
                memberId={member.fatherMemberId}
                href={fatherHref}
              />
              <RelativeCard
                title="Mother"
                name={mother ? fullName(mother) : member.motherName}
                memberId={member.motherMemberId}
                href={motherHref}
              />
            </div>
          </div>

          <div>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Spouse</p>
            <RelativeCard
              title="Spouse"
              name={spouse ? fullName(spouse) : member.spouseName}
              memberId={member.spouseMemberId}
              href={spouseHref}
            />
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-[var(--line)] bg-white p-6 shadow-sm">
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Siblings</p>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {siblings.length ? siblings.map((sibling) => (
            <RelativeCard
              key={sibling.id}
              title="Sibling"
              name={fullName(sibling)}
              memberId={sibling.memberId}
              href={`/admin/members/${sibling.id}`}
            />
          )) : <RelativeCard title="Siblings" name="No linked siblings" />}
        </div>
      </section>

      <section className="rounded-[28px] border border-[var(--line)] bg-white p-6 shadow-sm">
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Children</p>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {resolvedChildren.length ? resolvedChildren.map((child, index) => (
            <RelativeCard
              key={`${child.memberId ?? child.name}-${index}`}
              title={`Child ${index + 1}`}
              name={child.linkedMember ? fullName(child.linkedMember) : child.name}
              memberId={child.memberId}
              href={child.href}
            />
          )) : <RelativeCard title="Children" name="No linked children" />}
        </div>
      </section>
    </div>
  );
}