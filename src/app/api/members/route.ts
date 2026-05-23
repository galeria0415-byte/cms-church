import { NextResponse } from "next/server";

import { requireRole } from "@/lib/auth";
import { MEMBER_MANAGER_ROLES } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { memberSchema } from "@/lib/validators/member";

export async function POST(request: Request) {
  const session = await requireRole(MEMBER_MANAGER_ROLES);
  const body = await request.json();
  const parsed = memberSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().formErrors[0] ?? "Invalid member data." }, { status: 400 });
  }

  try {
    const member = await prisma.member.create({
      data: parsed.data,
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