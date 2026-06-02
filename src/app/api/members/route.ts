import { NextResponse } from "next/server";

import { requireRole } from "@/lib/auth";
import { getNextMemberId } from "@/lib/member-id";
import { findMemberByMemberId, hydrateLinkedMemberFields, synchronizeReciprocalFamilyLinks } from "@/lib/member-links";
import { MEMBER_MANAGER_ROLES } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { memberSchema } from "@/lib/validators/member";

export async function GET(request: Request) {
  await requireRole(MEMBER_MANAGER_ROLES);
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();
  const memberId = searchParams.get("memberId")?.trim();
  const excludeMemberId = searchParams.get("excludeMemberId")?.trim();

  if (query) {
    const members = await prisma.member.findMany({
      where: {
        isArchived: false,
        NOT: excludeMemberId ? { memberId: excludeMemberId } : undefined,
        OR: [
          { memberId: { contains: query } },
          { firstName: { contains: query } },
          { middleName: { contains: query } },
          { lastName: { contains: query } },
          { suffix: { contains: query } },
        ],
      },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      take: 8,
      select: {
        id: true,
        memberId: true,
        firstName: true,
        middleName: true,
        lastName: true,
        suffix: true,
        birthDate: true,
        deceasedDate: true,
      },
    });

    return NextResponse.json({
      members: members.map((member) => ({
        ...member,
        displayName: `${member.firstName}${member.middleName ? ` ${member.middleName}` : ""} ${member.lastName}${member.suffix ? ` ${member.suffix}` : ""}`.trim(),
      })),
    });
  }

  if (!memberId) {
    return NextResponse.json({ error: "Member ID is required." }, { status: 400 });
  }

  const member = await findMemberByMemberId(memberId);

  if (!member) {
    return NextResponse.json({ error: "Linked member not found." }, { status: 404 });
  }

  return NextResponse.json({
    member: {
      ...member,
      displayName: `${member.firstName}${member.middleName ? ` ${member.middleName}` : ""} ${member.lastName}${member.suffix ? ` ${member.suffix}` : ""}`.trim(),
    },
  });
}

export async function POST(request: Request) {
  const session = await requireRole(MEMBER_MANAGER_ROLES);
  const body = await request.json();
  const parsed = memberSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().formErrors[0] ?? "Invalid member data." }, { status: 400 });
  }

  try {
    const memberId = await getNextMemberId();
    const hydratedData = await hydrateLinkedMemberFields({
      ...parsed.data,
      memberId,
    });
    const member = await prisma.member.create({
      data: { ...hydratedData, memberId },
    });

    await synchronizeReciprocalFamilyLinks(member.id);

    await prisma.activityLog.create({
      data: {
        action: "create",
        entityType: "member",
        entityId: member.id,
        summary: `Created member ${member.firstName} ${member.lastName}`,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ member });
  } catch {
    return NextResponse.json({ error: "Member ID already exists or data could not be saved." }, { status: 409 });
  }
}