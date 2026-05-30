import { prisma } from "@/lib/prisma";

export type MemberChildLink = {
  name?: string;
  memberId?: string;
  birthDate?: string;
};

export type MemberMinistryRole = {
  ministry?: string;
  role?: string;
  periodFrom?: string;
  periodTo?: string;
  status?: string;
};

export async function getMemberRecord(id: string) {
  const member = await prisma.member.findUnique({ where: { id } });

  if (!member) {
    return null;
  }

  let childrenLinks: MemberChildLink[] = [];
  try {
    childrenLinks = JSON.parse(member.childrenLinks ?? "[]") as MemberChildLink[];
  } catch {
    childrenLinks = [];
  }

  let ministryRoles: MemberMinistryRole[] = [];
  try {
    ministryRoles = JSON.parse(member.ministryRoles ?? "[]") as MemberMinistryRole[];
  } catch {
    ministryRoles = [];
  }

  const linkedMemberIds = [
    member.fatherMemberId,
    member.motherMemberId,
    member.spouseMemberId,
    ...childrenLinks.map((child) => child.memberId),
  ].filter((memberId): memberId is string => Boolean(memberId));

  const linkedMembers = linkedMemberIds.length
    ? await prisma.member.findMany({
        where: { memberId: { in: linkedMemberIds } },
        select: { id: true, memberId: true },
      })
    : [];

  const adminProfileByMemberId = Object.fromEntries(
    linkedMembers.map((linkedMember) => [linkedMember.memberId, `/admin/members/${linkedMember.id}`]),
  ) as Record<string, string>;

  return {
    member,
    childrenLinks,
    ministryRoles,
    spouseHref: member.spouseMemberId ? adminProfileByMemberId[member.spouseMemberId] : undefined,
    fatherHref: member.fatherMemberId ? adminProfileByMemberId[member.fatherMemberId] : undefined,
    motherHref: member.motherMemberId ? adminProfileByMemberId[member.motherMemberId] : undefined,
    resolvedChildren: childrenLinks.map((child) => ({
      ...child,
      href: child.memberId ? adminProfileByMemberId[child.memberId] : undefined,
    })),
  };
}