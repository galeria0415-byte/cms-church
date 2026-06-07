import { MembershipStatus, MembershipType, RecordStatus, ServiceAttendanceStatus } from "@prisma/client";
import { NextResponse } from "next/server";

import { getNextMemberId } from "@/lib/member-id";
import { hydrateLinkedMemberFields, synchronizeReciprocalFamilyLinks } from "@/lib/member-links";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/site-settings";
import { toProperCase } from "@/lib/utils";
import { memberSchema, type MemberInput } from "@/lib/validators/member";

function normalizePublicMemberFields(data: MemberInput): MemberInput {
  const normalized = { ...data };
  const properCaseKeys = [
    "firstName",
    "middleName",
    "lastName",
    "suffix",
    "address",
    "emergencyContactName",
    "spouseName",
    "fatherName",
    "motherName",
    "guardian",
    "schoolAttended",
    "courseOrDegree",
    "occupation",
    "companyName",
    "workAddress",
    "previousChurch",
    "shepherdingGroup",
  ] as const;

  for (const key of properCaseKeys) {
    if (typeof normalized[key] === "string") {
      (normalized as Record<string, unknown>)[key] = toProperCase(normalized[key]);
    }
  }

  if (typeof normalized.email === "string") {
    normalized.email = normalized.email.trim().toLowerCase();
  }

  return normalized;
}

export async function POST(request: Request) {
  const settings = await getSiteSettings();

  if (!settings.enableMemberRegistration || !settings.memberRegistrationPasscode) {
    return NextResponse.json({ error: "Member registration is not enabled." }, { status: 403 });
  }

  const body = await request.json();

  if (typeof body?.passcode !== "string" || body.passcode !== settings.memberRegistrationPasscode) {
    return NextResponse.json({ error: "Invalid registration passcode." }, { status: 403 });
  }

  if (body?.mode === "verify") {
    return NextResponse.json({ ok: true });
  }

  const parsed = memberSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().formErrors[0] ?? "Invalid member data." }, { status: 400 });
  }

  const memberId = await getNextMemberId(settings.memberIdPrefix);

  try {
    const normalizedInput = normalizePublicMemberFields({ ...parsed.data, memberId });
    const hydratedData = await hydrateLinkedMemberFields({
      ...normalizedInput,
      memberId,
      membershipStatus: MembershipStatus.VISITOR,
      membershipType: parsed.data.membershipType || MembershipType.BAPTISM,
      serviceAttendanceStatus: parsed.data.serviceAttendanceStatus || ServiceAttendanceStatus.OCCASIONAL,
      recordStatus: RecordStatus.ACTIVE,
      notes: parsed.data.notes || "Submitted through the public member registration page.",
      remarks: parsed.data.remarks || "Pending admin review.",
      isArchived: false,
    });

    const member = await prisma.member.create({
      data: {
        ...hydratedData,
        memberId,
        membershipStatus: MembershipStatus.VISITOR,
        membershipType: parsed.data.membershipType || MembershipType.BAPTISM,
        serviceAttendanceStatus: parsed.data.serviceAttendanceStatus || ServiceAttendanceStatus.OCCASIONAL,
        recordStatus: RecordStatus.ACTIVE,
        isArchived: false,
      },
    });

    await synchronizeReciprocalFamilyLinks(member.id);

    await prisma.activityLog.create({
      data: {
        action: "register",
        entityType: "member",
        entityId: member.id,
        summary: `Public member registration submitted for ${member.firstName} ${member.lastName}`,
      },
    });

    return NextResponse.json({ memberId, message: `Registration submitted successfully. Your reference member ID is ${memberId}.` });
  } catch {
    return NextResponse.json({ error: "Unable to submit registration right now." }, { status: 500 });
  }
}