import { format } from "date-fns";

import { prisma } from "@/lib/prisma";
import { fullName } from "@/lib/utils";
import { type MemberInput } from "@/lib/validators/member";

type LinkedMember = {
  id: string;
  memberId: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  suffix: string | null;
  birthDate: Date | null;
  deceasedDate: Date | null;
  gender: string | null;
  profilePhotoUrl: string | null;
};

function formatJsonDate(value: Date | null) {
  return value ? format(value, "yyyy-MM-dd") : undefined;
}

export async function findMemberByMemberId(memberId: string) {
  const normalized = memberId.trim();

  if (!normalized) {
    return null;
  }

  return prisma.member.findUnique({
    where: { memberId: normalized },
    select: {
      id: true,
      memberId: true,
      firstName: true,
      middleName: true,
      lastName: true,
      suffix: true,
      birthDate: true,
      deceasedDate: true,
      gender: true,
      profilePhotoUrl: true,
    },
  });
}

export async function hydrateLinkedMemberFields(input: MemberInput) {
  const parsedChildren = (() => {
    try {
      return JSON.parse(input.childrenLinks ?? "[]") as Array<{ name?: string; memberId?: string; birthDate?: string }>;
    } catch {
      return [];
    }
  })();

  const linkedIds = [
    input.spouseMemberId,
    input.fatherMemberId,
    input.motherMemberId,
    ...parsedChildren.map((child) => child.memberId),
  ].filter((value): value is string => Boolean(value));

  const linkedMembers = linkedIds.length
    ? await prisma.member.findMany({
        where: { memberId: { in: linkedIds } },
        select: {
          id: true,
          memberId: true,
          firstName: true,
          middleName: true,
          lastName: true,
          suffix: true,
          birthDate: true,
          deceasedDate: true,
          gender: true,
          profilePhotoUrl: true,
        },
      })
    : [];

  const linkedByMemberId = new Map(linkedMembers.map((member) => [member.memberId, member as LinkedMember]));
  const spouse = input.spouseMemberId ? linkedByMemberId.get(input.spouseMemberId) : undefined;
  const father = input.fatherMemberId ? linkedByMemberId.get(input.fatherMemberId) : undefined;
  const mother = input.motherMemberId ? linkedByMemberId.get(input.motherMemberId) : undefined;

  const childrenLinks = parsedChildren.map((child) => {
    const linkedChild = child.memberId ? linkedByMemberId.get(child.memberId) : undefined;

    if (!linkedChild) {
      return child;
    }

    return {
      ...child,
      name: fullName(linkedChild),
      birthDate: formatJsonDate(linkedChild.birthDate),
    };
  });

  return {
    ...input,
    spouseName: spouse ? fullName(spouse) : input.spouseName,
    fatherName: father ? fullName(father) : input.fatherName,
    fatherBirthDate: father?.birthDate ?? input.fatherBirthDate,
    fatherDeceasedDate: father?.deceasedDate ?? input.fatherDeceasedDate,
    motherName: mother ? fullName(mother) : input.motherName,
    motherBirthDate: mother?.birthDate ?? input.motherBirthDate,
    motherDeceasedDate: mother?.deceasedDate ?? input.motherDeceasedDate,
    childrenLinks: JSON.stringify(childrenLinks),
  } satisfies MemberInput;
}