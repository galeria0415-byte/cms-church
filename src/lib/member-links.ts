import { format } from "date-fns";
import { Gender, Prisma } from "@prisma/client";

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

function parseChildrenLinks(value?: string | null) {
  try {
    return JSON.parse(value ?? "[]") as Array<{ name?: string; memberId?: string; birthDate?: string }>;
  } catch {
    return [];
  }
}

function stringifyChildrenLinks(value: Array<{ name?: string; memberId?: string; birthDate?: string }>) {
  return JSON.stringify(value);
}

function upsertChildLink(
  children: Array<{ name?: string; memberId?: string; birthDate?: string }>,
  nextChild: { name?: string; memberId: string; birthDate?: string },
) {
  const existingIndex = children.findIndex((child) => child.memberId === nextChild.memberId);

  if (existingIndex === -1) {
    return [...children, nextChild];
  }

  const updated = [...children];
  updated[existingIndex] = {
    ...updated[existingIndex],
    ...nextChild,
  };
  return updated;
}

function removeChildLink(children: Array<{ name?: string; memberId?: string; birthDate?: string }>, memberId: string) {
  return children.filter((child) => child.memberId !== memberId);
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

export async function synchronizeReciprocalFamilyLinks(memberId: string) {
  await prisma.$transaction(async (tx) => {
    const member = await tx.member.findUnique({
      where: { id: memberId },
      select: {
        id: true,
        memberId: true,
        firstName: true,
        middleName: true,
        lastName: true,
        suffix: true,
        gender: true,
        birthDate: true,
        deceasedDate: true,
        spouseMemberId: true,
        fatherMemberId: true,
        motherMemberId: true,
        childrenLinks: true,
      },
    });

    if (!member) {
      return;
    }

    const currentName = fullName(member);
    const currentBirthDate = formatJsonDate(member.birthDate);
    const desiredChildLinks = parseChildrenLinks(member.childrenLinks).filter((child): child is { name?: string; memberId: string; birthDate?: string } => Boolean(child.memberId));
    const desiredChildMemberIds = desiredChildLinks.map((child) => child.memberId);

    const currentSpouse = member.spouseMemberId
      ? await tx.member.findUnique({
          where: { memberId: member.spouseMemberId },
          select: { id: true, memberId: true, spouseMemberId: true, firstName: true, middleName: true, lastName: true, suffix: true },
        })
      : null;

    const membersPointingToCurrentAsSpouse = await tx.member.findMany({
      where: { spouseMemberId: member.memberId, NOT: { id: member.id } },
      select: { id: true, memberId: true },
    });

    for (const linkedSpouse of membersPointingToCurrentAsSpouse) {
      if (!currentSpouse || linkedSpouse.memberId !== currentSpouse.memberId) {
        await tx.member.update({
          where: { id: linkedSpouse.id },
          data: { spouseMemberId: null, spouseName: null },
        });
      }
    }

    if (currentSpouse) {
      await tx.member.updateMany({
        where: { spouseMemberId: currentSpouse.memberId, NOT: { id: member.id } },
        data: { spouseMemberId: null, spouseName: null },
      });

      await tx.member.update({
        where: { id: currentSpouse.id },
        data: { spouseMemberId: member.memberId, spouseName: currentName },
      });
    }

    const parentsContainingCurrent = await tx.member.findMany({
      where: { childrenLinks: { contains: member.memberId } },
      select: { id: true, memberId: true, childrenLinks: true },
    });

    for (const parent of parentsContainingCurrent) {
      if (parent.memberId !== member.fatherMemberId && parent.memberId !== member.motherMemberId) {
        await tx.member.update({
          where: { id: parent.id },
          data: { childrenLinks: stringifyChildrenLinks(removeChildLink(parseChildrenLinks(parent.childrenLinks), member.memberId)) },
        });
      }
    }

    const desiredParents = [
      { memberId: member.fatherMemberId, nameField: "fatherName" as const },
      { memberId: member.motherMemberId, nameField: "motherName" as const },
    ].filter((parent): parent is { memberId: string; nameField: "fatherName" | "motherName" } => Boolean(parent.memberId));

    for (const parent of desiredParents) {
      const linkedParent = await tx.member.findUnique({
        where: { memberId: parent.memberId },
        select: { id: true, childrenLinks: true },
      });

      if (!linkedParent) {
        continue;
      }

      const updatedChildren = upsertChildLink(parseChildrenLinks(linkedParent.childrenLinks), {
        memberId: member.memberId,
        name: currentName,
        birthDate: currentBirthDate,
      });

      await tx.member.update({
        where: { id: linkedParent.id },
        data: { childrenLinks: stringifyChildrenLinks(updatedChildren) },
      });
    }

    if (member.gender === Gender.MALE || member.gender === Gender.FEMALE) {
      const parentIdField = member.gender === Gender.MALE ? "fatherMemberId" : "motherMemberId";
      const parentNameField = member.gender === Gender.MALE ? "fatherName" : "motherName";

      const currentChildren = await tx.member.findMany({
        where: { [parentIdField]: member.memberId } as Prisma.MemberWhereInput,
        select: { id: true, memberId: true, fatherMemberId: true, motherMemberId: true },
      });

      for (const child of currentChildren) {
        if (!desiredChildMemberIds.includes(child.memberId)) {
          await tx.member.update({
            where: { id: child.id },
            data: member.gender === Gender.MALE
              ? { fatherMemberId: null, fatherName: null }
              : { motherMemberId: null, motherName: null },
          });
        }
      }

      const desiredChildren = desiredChildMemberIds.length
        ? await tx.member.findMany({
            where: { memberId: { in: desiredChildMemberIds } },
            select: {
              id: true,
              memberId: true,
              fatherMemberId: true,
              motherMemberId: true,
            },
          })
        : [];

      for (const child of desiredChildren) {
        const previousParentMemberId = member.gender === Gender.MALE ? child.fatherMemberId : child.motherMemberId;

        if (previousParentMemberId && previousParentMemberId !== member.memberId) {
          const previousParent = await tx.member.findUnique({
            where: { memberId: previousParentMemberId },
            select: { id: true, childrenLinks: true },
          });

          if (previousParent) {
            await tx.member.update({
              where: { id: previousParent.id },
              data: { childrenLinks: stringifyChildrenLinks(removeChildLink(parseChildrenLinks(previousParent.childrenLinks), child.memberId)) },
            });
          }
        }

        await tx.member.update({
          where: { id: child.id },
          data: member.gender === Gender.MALE
            ? { fatherMemberId: member.memberId, fatherName: currentName }
            : { motherMemberId: member.memberId, motherName: currentName },
        });
      }
    }
  });
}