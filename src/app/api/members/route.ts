import { NextResponse } from "next/server";

import { requireRole } from "@/lib/auth";
import { findMemberByMemberId, hydrateLinkedMemberFields } from "@/lib/member-links";
import { MEMBER_MANAGER_ROLES } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { memberSchema } from "@/lib/validators/member";

export async function GET(request: Request) {
  await requireRole(MEMBER_MANAGER_ROLES);
  const { searchParams } = new URL(request.url);
  const memberId = searchParams.get("memberId")?.trim();

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
    const hydratedData = await hydrateLinkedMemberFields(parsed.data);
    const member = await prisma.member.create({
      data: hydratedData,
    });

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