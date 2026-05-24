import {
  CivilStatus,
  Gender,
  MembershipStatus,
  MembershipType,
  RecordStatus,
  ServiceAttendanceStatus,
} from "@prisma/client";
import { z } from "zod";

const optionalString = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined));

const optionalDate = z.preprocess((value) => {
  if (!value) {
    return undefined;
  }

  return new Date(String(value));
}, z.date().optional());

const optionalNumber = z.preprocess((value) => {
  if (value === "" || value === undefined || value === null) {
    return 0;
  }

  return Number(value);
}, z.number().int().min(0));

const csvText = z.preprocess((value) => {
  if (!value) {
    return undefined;
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter(Boolean)
      .join(", ");
  }

  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}, z.union([z.string(), z.array(z.string())])).transform((value) => {
  if (!value) {
    return undefined;
  }

  if (Array.isArray(value)) {
    return value.join(", ");
  }

  return value;
});

export const memberSchema = z.object({
  memberId: z.string().trim().min(2, "Member ID is required."),
  firstName: z.string().trim().min(2, "First name is required."),
  middleName: optionalString,
  lastName: z.string().trim().min(2, "Last name is required."),
  suffix: optionalString,
  gender: z.nativeEnum(Gender).optional(),
  birthDate: optionalDate,
  civilStatus: z.nativeEnum(CivilStatus).optional(),
  nationality: optionalString,
  contactNumber: optionalString,
  email: z.string().email("Enter a valid email address.").optional().or(z.literal("")),
  address: optionalString,
  profilePhotoUrl: optionalString,
  emergencyContactName: optionalString,
  emergencyContactNumber: optionalString,
  spouseName: optionalString,
  weddingDate: optionalDate,
  fatherName: optionalString,
  fatherMemberId: optionalString,
  fatherDeceasedDate: optionalDate,
  motherName: optionalString,
  motherMemberId: optionalString,
  motherDeceasedDate: optionalDate,
  childrenLinks: optionalString,
  guardian: optionalString,
  deceasedDate: optionalDate,
  highestEducation: optionalString,
  schoolAttended: optionalString,
  courseOrDegree: optionalString,
  occupation: optionalString,
  companyName: optionalString,
  employmentStatus: optionalString,
  workAddress: optionalString,
  dateJoinedChurch: optionalDate,
  membershipStatus: z.nativeEnum(MembershipStatus).default(MembershipStatus.ACTIVE),
  membershipType: z.nativeEnum(MembershipType).default(MembershipType.BAPTISM),
  baptizedDate: optionalDate,
  previousChurch: optionalString,
  churchOrganization: optionalString,
  membershipCategory: optionalString,
  shepherdingGroup: optionalString,
  confirmationDate: optionalDate,
  serviceAttendanceStatus: z
    .nativeEnum(ServiceAttendanceStatus)
    .default(ServiceAttendanceStatus.REGULAR),
  ministryRoles: optionalString,
  volunteerStatus: optionalString,
  trainingCompleted: optionalString,
  notes: optionalString,
  remarks: optionalString,
  recordStatus: z.nativeEnum(RecordStatus).default(RecordStatus.ACTIVE),
  isArchived: z.boolean().optional().default(false),
});

export type MemberInput = z.infer<typeof memberSchema>;