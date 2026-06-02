import { NextResponse } from "next/server";

import { requireRole } from "@/lib/auth";
import { hydrateLinkedMemberFields, synchronizeReciprocalFamilyLinks } from "@/lib/member-links";
import { canDeleteMember, MEMBER_MANAGER_ROLES } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { memberSchema } from "@/lib/validators/member";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: Params) {
  await requireRole(MEMBER_MANAGER_ROLES);
  const { id } = await params;

  try {
    const member = await prisma.member.findUnique({ where: { id } });

    if (!member) {
      return NextResponse.json({ error: "Member not found." }, { status: 404 });
    }

    return NextResponse.json({ member });
  } catch {
    return NextResponse.json({ error: "Unable to load this member." }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: Params) {
  const session = await requireRole(MEMBER_MANAGER_ROLES);
  const { id } = await params;
  const body = await request.json();
  const parsed = memberSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().formErrors[0] ?? "Invalid member data." }, { status: 400 });
  }

  try {
    const currentMember = await prisma.member.findUnique({ where: { id }, select: { memberId: true } });

    if (!currentMember) {
      return NextResponse.json({ error: "Member not found." }, { status: 404 });
    }

    const hydratedData = await hydrateLinkedMemberFields({
      ...parsed.data,
      memberId: currentMember.memberId,
    });
    const member = await prisma.member.update({
      where: { id },
      data: { ...hydratedData, memberId: currentMember.memberId },
    });

    await synchronizeReciprocalFamilyLinks(member.id);

    await prisma.activityLog.create({
      data: {
        action: "update",
        entityType: "member",
        entityId: member.id,
        summary: `Updated member ${member.firstName} ${member.lastName}`,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ member });
  } catch {
    return NextResponse.json({ error: "Unable to update this member." }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: Params) {
  const session = await requireRole(MEMBER_MANAGER_ROLES);

  if (!canDeleteMember(session.user.role)) {
    return NextResponse.json({ error: "Your role cannot delete members." }, { status: 403 });
  }

  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const hard = searchParams.get("hard") === "true";

  try {
    if (hard) {
      const member = await prisma.member.delete({ where: { id } });

      await prisma.activityLog.create({
        data: {
          action: "delete",
          entityType: "member",
          entityId: member.id,
          summary: `Permanently deleted member ${member.firstName} ${member.lastName}`,
          userId: session.user.id,
        },
      });

      return NextResponse.json({ member });
    }

    const member = await prisma.member.update({
      where: { id },
      data: { isArchived: true, recordStatus: "ARCHIVED" },
    });

    await prisma.activityLog.create({
      data: {
        action: "archive",
        entityType: "member",
        entityId: member.id,
        summary: `Archived member ${member.firstName} ${member.lastName}`,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ member });
  } catch (e: unknown) {
    const code = (e as { code?: string })?.code;
    if (code === "P2025") return NextResponse.json({ error: "Member not found." }, { status: 404 });
    return NextResponse.json({ error: "Failed to delete member." }, { status: 500 });
  }
}