import { CivilStatus, Gender, MembershipStatus, MembershipType, RecordStatus, ServiceAttendanceStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getNextMemberId } from "@/lib/member-id";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/site-settings";
import { toProperCase } from "@/lib/utils";

const registrationSchema = z.object({
  passcode: z.string().trim().min(1),
  firstName: z.string().trim().min(2),
  middleName: z.string().trim().optional(),
  lastName: z.string().trim().min(2),
  suffix: z.string().trim().optional(),
  gender: z.nativeEnum(Gender).optional().or(z.literal("")),
  birthDate: z.string().trim().min(1),
  civilStatus: z.nativeEnum(CivilStatus).optional().or(z.literal("")),
  contactNumber: z.string().trim().min(7),
  email: z.string().trim().email(),
  address: z.string().trim().min(6),
  emergencyContactName: z.string().trim().optional(),
  emergencyContactNumber: z.string().trim().optional(),
});

export async function POST(request: Request) {
  const settings = await getSiteSettings();

  if (!settings.enableMemberRegistration || !settings.memberRegistrationPasscode) {
    return NextResponse.json({ error: "Member registration is not enabled." }, { status: 403 });
  }

  const body = await request.json();
  const parsed = registrationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().formErrors[0] ?? "Invalid registration data." }, { status: 400 });
  }

  if (parsed.data.passcode !== settings.memberRegistrationPasscode) {
    return NextResponse.json({ error: "Invalid registration passcode." }, { status: 403 });
  }

  const memberId = await getNextMemberId(settings.memberIdPrefix);

  try {
    const member = await prisma.member.create({
      data: {
        memberId,
        firstName: toProperCase(parsed.data.firstName),
        middleName: toProperCase(parsed.data.middleName) || undefined,
        lastName: toProperCase(parsed.data.lastName),
        suffix: toProperCase(parsed.data.suffix) || undefined,
        gender: parsed.data.gender || undefined,
        birthDate: new Date(parsed.data.birthDate),
        civilStatus: parsed.data.civilStatus || undefined,
        nationality: "Filipino",
        contactNumber: parsed.data.contactNumber,
        email: parsed.data.email.toLowerCase(),
        address: toProperCase(parsed.data.address),
        emergencyContactName: toProperCase(parsed.data.emergencyContactName) || undefined,
        emergencyContactNumber: parsed.data.emergencyContactNumber || undefined,
        membershipStatus: MembershipStatus.VISITOR,
        membershipType: MembershipType.BAPTISM,
        serviceAttendanceStatus: ServiceAttendanceStatus.OCCASIONAL,
        recordStatus: RecordStatus.ACTIVE,
        notes: "Submitted through the public member registration page.",
        remarks: "Pending admin review.",
      },
    });

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