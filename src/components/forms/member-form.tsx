"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { BaptismStatus, CivilStatus, Gender, MembershipStatus, MembershipType, RecordStatus, ServiceAttendanceStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { FileUploadField } from "@/components/forms/file-upload-field";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatDateInput, titleize } from "@/lib/utils";

const memberFormSchema = z.object({
  memberId: z.string().min(2),
  firstName: z.string().min(2),
  middleName: z.string().optional(),
  lastName: z.string().min(2),
  suffix: z.string().optional(),
  gender: z.string().optional(),
  birthDate: z.string().optional(),
  civilStatus: z.string().optional(),
  nationality: z.string().optional(),
  contactNumber: z.string().optional(),
  email: z.string().optional(),
  address: z.string().optional(),
  profilePhotoUrl: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactNumber: z.string().optional(),
  spouseName: z.string().optional(),
  weddingDate: z.string().optional(),
  childrenNames: z.string().optional(),
  childCount: z.coerce.number().min(0),
  parentsName: z.string().optional(),
  guardian: z.string().optional(),
  householdGroup: z.string().optional(),
  dependents: z.coerce.number().min(0),
  deceasedDate: z.string().optional(),
  highestEducation: z.string().optional(),
  schoolAttended: z.string().optional(),
  courseOrDegree: z.string().optional(),
  occupation: z.string().optional(),
  companyName: z.string().optional(),
  employmentStatus: z.string().optional(),
  workAddress: z.string().optional(),
  dateJoinedChurch: z.string().optional(),
  membershipStatus: z.string(),
  membershipType: z.string(),
  baptismStatus: z.string(),
  baptizedDate: z.string().optional(),
  previousChurch: z.string().optional(),
  firstVisitDate: z.string().optional(),
  assignedSmallGroup: z.string().optional(),
  serviceAttendanceStatus: z.string(),
  ministriesJoined: z.string().optional(),
  ministryRole: z.string().optional(),
  volunteerStatus: z.string().optional(),
  leaderName: z.string().optional(),
  trainingCompleted: z.string().optional(),
  notes: z.string().optional(),
  remarks: z.string().optional(),
  recordStatus: z.string(),
  isArchived: z.boolean().default(false),
});

type MemberFormValues = z.input<typeof memberFormSchema>;

type ExistingMember = Partial<MemberFormValues> & {
  id?: string;
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2 text-sm font-medium text-[var(--ink)]">
      <span>{label}</span>
      {children}
    </label>
  );
}

export function MemberForm({ member }: { member?: ExistingMember }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<MemberFormValues>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: {
      memberId: member?.memberId ?? "",
      firstName: member?.firstName ?? "",
      middleName: member?.middleName ?? "",
      lastName: member?.lastName ?? "",
      suffix: member?.suffix ?? "",
      gender: member?.gender ?? "",
      birthDate: member?.birthDate ?? "",
      civilStatus: member?.civilStatus ?? "",
      nationality: member?.nationality ?? "",
      contactNumber: member?.contactNumber ?? "",
      email: member?.email ?? "",
      address: member?.address ?? "",
      profilePhotoUrl: member?.profilePhotoUrl ?? "",
      emergencyContactName: member?.emergencyContactName ?? "",
      emergencyContactNumber: member?.emergencyContactNumber ?? "",
      spouseName: member?.spouseName ?? "",
      weddingDate: member?.weddingDate ?? "",
      childrenNames: member?.childrenNames ?? "",
      childCount: member?.childCount ?? 0,
      parentsName: member?.parentsName ?? "",
      guardian: member?.guardian ?? "",
      householdGroup: member?.householdGroup ?? "",
      dependents: member?.dependents ?? 0,
      deceasedDate: member?.deceasedDate ?? "",
      highestEducation: member?.highestEducation ?? "",
      schoolAttended: member?.schoolAttended ?? "",
      courseOrDegree: member?.courseOrDegree ?? "",
      occupation: member?.occupation ?? "",
      companyName: member?.companyName ?? "",
      employmentStatus: member?.employmentStatus ?? "",
      workAddress: member?.workAddress ?? "",
      dateJoinedChurch: member?.dateJoinedChurch ?? "",
      membershipStatus: member?.membershipStatus ?? MembershipStatus.ACTIVE,
      membershipType: member?.membershipType ?? MembershipType.MEMBER,
      baptismStatus: member?.baptismStatus ?? BaptismStatus.UNKNOWN,
      baptizedDate: member?.baptizedDate ?? "",
      previousChurch: member?.previousChurch ?? "",
      firstVisitDate: member?.firstVisitDate ?? "",
      assignedSmallGroup: member?.assignedSmallGroup ?? "",
      serviceAttendanceStatus: member?.serviceAttendanceStatus ?? ServiceAttendanceStatus.REGULAR,
      ministriesJoined: member?.ministriesJoined ?? "",
      ministryRole: member?.ministryRole ?? "",
      volunteerStatus: member?.volunteerStatus ?? "",
      leaderName: member?.leaderName ?? "",
      trainingCompleted: member?.trainingCompleted ?? "",
      notes: member?.notes ?? "",
      remarks: member?.remarks ?? "",
      recordStatus: member?.recordStatus ?? RecordStatus.ACTIVE,
      isArchived: member?.isArchived ?? false,
    },
  });

  const profilePhotoUrl = useWatch({ control, name: "profilePhotoUrl" });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    setSuccess(null);

    const payload = {
      ...values,
      email: values.email?.trim() || undefined,
      middleName: values.middleName?.trim() || undefined,
      suffix: values.suffix?.trim() || undefined,
      gender: values.gender || undefined,
      civilStatus: values.civilStatus || undefined,
      birthDate: values.birthDate || undefined,
      weddingDate: values.weddingDate || undefined,
      baptizedDate: values.baptizedDate || undefined,
      deceasedDate: values.deceasedDate || undefined,
      dateJoinedChurch: values.dateJoinedChurch || undefined,
      firstVisitDate: values.firstVisitDate || undefined,
      childrenNames: values.childrenNames || "",
      ministriesJoined: values.ministriesJoined || "",
      trainingCompleted: values.trainingCompleted || "",
    };

    const response = await fetch(member?.id ? `/api/members/${member.id}` : "/api/members", {
      method: member?.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = (await response.json()) as { error?: string; member?: { id: string } };

    if (!response.ok || !data.member) {
      setError(data.error ?? "Something went wrong while saving the member.");
      return;
    }

    setSuccess("Member record saved.");
    router.push(`/admin/members/${data.member.id}`);
    router.refresh();
  });

  return (
    <form className="space-y-8" onSubmit={onSubmit}>
      <Card>
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">Membership record</p>
            <h2 className="mt-2 font-serif text-2xl text-[var(--ink)]">{member?.id ? "Edit member" : "Add member"}</h2>
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : member?.id ? "Update member" : "Create member"}
          </Button>
        </div>
        {error ? <p className="mb-4 rounded-2xl bg-[#fff1ec] px-4 py-3 text-sm text-[#a53f2b]">{error}</p> : null}
        {success ? <p className="mb-4 rounded-2xl bg-[#edf7ee] px-4 py-3 text-sm text-[#256f3a]">{success}</p> : null}
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-5">
            <h3 className="text-lg font-semibold text-[var(--ink)]">Personal information</h3>
            <div className="rounded-[24px] border border-[var(--line)] bg-[var(--surface-subtle)] p-4">
              <FileUploadField
                label="Profile photo"
                value={profilePhotoUrl}
                onUploaded={(value) => setValue("profilePhotoUrl", value)}
                previewMode="avatar"
                helperText="Upload a clear headshot so member records are easier to scan and verify."
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Member ID"><Input {...register("memberId")} /></Field>
              <Field label="First name"><Input {...register("firstName")} /></Field>
              <Field label="Middle name"><Input {...register("middleName")} /></Field>
              <Field label="Last name"><Input {...register("lastName")} /></Field>
              <Field label="Suffix"><Input {...register("suffix")} /></Field>
              <Field label="Gender"><Select {...register("gender")}><option value="">Select</option>{Object.values(Gender).map((option) => <option key={option} value={option}>{titleize(option)}</option>)}</Select></Field>
              <Field label="Birth date"><Input type="date" {...register("birthDate")} /></Field>
              <Field label="Civil status"><Select {...register("civilStatus")}><option value="">Select</option>{Object.values(CivilStatus).map((option) => <option key={option} value={option}>{titleize(option)}</option>)}</Select></Field>
              <Field label="Nationality"><Input {...register("nationality")} /></Field>
              <Field label="Contact number"><Input {...register("contactNumber")} /></Field>
              <Field label="Email"><Input type="email" {...register("email")} /></Field>
              <Field label="Address"><Input {...register("address")} /></Field>
              <Field label="Emergency contact name"><Input {...register("emergencyContactName")} /></Field>
              <Field label="Emergency contact number"><Input {...register("emergencyContactNumber")} /></Field>
            </div>
          </div>
          <div className="space-y-5">
            <h3 className="text-lg font-semibold text-[var(--ink)]">Family information</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Spouse name"><Input {...register("spouseName")} /></Field>
              <Field label="Wedding date"><Input type="date" {...register("weddingDate")} /></Field>
              <Field label="Child count"><Input type="number" min="0" {...register("childCount", { valueAsNumber: true })} /></Field>
              <Field label="Dependents"><Input type="number" min="0" {...register("dependents", { valueAsNumber: true })} /></Field>
              <Field label="Parents name"><Input {...register("parentsName")} /></Field>
              <Field label="Guardian"><Input {...register("guardian")} /></Field>
              <Field label="Household group"><Input {...register("householdGroup")} /></Field>
              <Field label="Deceased date"><Input type="date" {...register("deceasedDate")} /></Field>
            </div>
            <Field label="Children names (comma separated)"><Textarea {...register("childrenNames")} /></Field>
          </div>
          <div className="space-y-5">
            <h3 className="text-lg font-semibold text-[var(--ink)]">Education and work</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Highest education"><Input {...register("highestEducation")} /></Field>
              <Field label="School attended"><Input {...register("schoolAttended")} /></Field>
              <Field label="Course or degree"><Input {...register("courseOrDegree")} /></Field>
              <Field label="Occupation"><Input {...register("occupation")} /></Field>
              <Field label="Company name"><Input {...register("companyName")} /></Field>
              <Field label="Employment status"><Input {...register("employmentStatus")} /></Field>
            </div>
            <Field label="Work address"><Input {...register("workAddress")} /></Field>
          </div>
          <div className="space-y-5">
            <h3 className="text-lg font-semibold text-[var(--ink)]">Church affiliation</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Date joined church"><Input type="date" {...register("dateJoinedChurch")} /></Field>
              <Field label="Membership status"><Select {...register("membershipStatus")}>{Object.values(MembershipStatus).map((option) => <option key={option} value={option}>{titleize(option)}</option>)}</Select></Field>
              <Field label="Membership type"><Select {...register("membershipType")}>{Object.values(MembershipType).map((option) => <option key={option} value={option}>{titleize(option)}</option>)}</Select></Field>
              <Field label="Baptism status"><Select {...register("baptismStatus")}>{Object.values(BaptismStatus).map((option) => <option key={option} value={option}>{titleize(option)}</option>)}</Select></Field>
              <Field label="Baptized date"><Input type="date" {...register("baptizedDate")} /></Field>
              <Field label="Previous church"><Input {...register("previousChurch")} /></Field>
              <Field label="First visit date"><Input type="date" {...register("firstVisitDate")} /></Field>
              <Field label="Assigned small group"><Input {...register("assignedSmallGroup")} /></Field>
              <Field label="Attendance status"><Select {...register("serviceAttendanceStatus")}>{Object.values(ServiceAttendanceStatus).map((option) => <option key={option} value={option}>{titleize(option)}</option>)}</Select></Field>
              <Field label="Record status"><Select {...register("recordStatus")}>{Object.values(RecordStatus).map((option) => <option key={option} value={option}>{titleize(option)}</option>)}</Select></Field>
            </div>
          </div>
          <div className="space-y-5 lg:col-span-2">
            <h3 className="text-lg font-semibold text-[var(--ink)]">Ministry information</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Ministries joined (comma separated)"><Textarea {...register("ministriesJoined")} /></Field>
              <Field label="Training completed (comma separated)"><Textarea {...register("trainingCompleted")} /></Field>
              <Field label="Ministry role"><Input {...register("ministryRole")} /></Field>
              <Field label="Volunteer status"><Input {...register("volunteerStatus")} /></Field>
              <Field label="Leader name"><Input {...register("leaderName")} /></Field>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Notes"><Textarea {...register("notes")} /></Field>
              <Field label="Remarks"><Textarea {...register("remarks")} /></Field>
            </div>
          </div>
        </div>
        {Object.keys(errors).length > 0 ? <p className="mt-4 text-sm text-[#a53f2b]">Please review the highlighted fields and try again.</p> : null}
      </Card>
    </form>
  );
}

export function mapMemberToForm(member: Record<string, unknown> & { id: string }) {
  return {
    id: member.id,
    memberId: String(member.memberId ?? ""),
    firstName: String(member.firstName ?? ""),
    middleName: String(member.middleName ?? ""),
    lastName: String(member.lastName ?? ""),
    suffix: String(member.suffix ?? ""),
    gender: String(member.gender ?? ""),
    birthDate: formatDateInput(member.birthDate as string | Date | null),
    civilStatus: String(member.civilStatus ?? ""),
    nationality: String(member.nationality ?? ""),
    contactNumber: String(member.contactNumber ?? ""),
    email: String(member.email ?? ""),
    address: String(member.address ?? ""),
    profilePhotoUrl: String(member.profilePhotoUrl ?? ""),
    emergencyContactName: String(member.emergencyContactName ?? ""),
    emergencyContactNumber: String(member.emergencyContactNumber ?? ""),
    spouseName: String(member.spouseName ?? ""),
    weddingDate: formatDateInput(member.weddingDate as string | Date | null),
    childrenNames: typeof member.childrenNames === "string" ? member.childrenNames : Array.isArray(member.childrenNames) ? member.childrenNames.join(", ") : "",
    childCount: Number(member.childCount ?? 0),
    parentsName: String(member.parentsName ?? ""),
    guardian: String(member.guardian ?? ""),
    householdGroup: String(member.householdGroup ?? ""),
    dependents: Number(member.dependents ?? 0),
    deceasedDate: formatDateInput(member.deceasedDate as string | Date | null),
    highestEducation: String(member.highestEducation ?? ""),
    schoolAttended: String(member.schoolAttended ?? ""),
    courseOrDegree: String(member.courseOrDegree ?? ""),
    occupation: String(member.occupation ?? ""),
    companyName: String(member.companyName ?? ""),
    employmentStatus: String(member.employmentStatus ?? ""),
    workAddress: String(member.workAddress ?? ""),
    dateJoinedChurch: formatDateInput(member.dateJoinedChurch as string | Date | null),
    membershipStatus: String(member.membershipStatus ?? MembershipStatus.ACTIVE),
    membershipType: String(member.membershipType ?? MembershipType.MEMBER),
    baptismStatus: String(member.baptismStatus ?? BaptismStatus.UNKNOWN),
    baptizedDate: formatDateInput(member.baptizedDate as string | Date | null),
    previousChurch: String(member.previousChurch ?? ""),
    firstVisitDate: formatDateInput(member.firstVisitDate as string | Date | null),
    assignedSmallGroup: String(member.assignedSmallGroup ?? ""),
    serviceAttendanceStatus: String(member.serviceAttendanceStatus ?? ServiceAttendanceStatus.REGULAR),
    ministriesJoined: typeof member.ministriesJoined === "string" ? member.ministriesJoined : Array.isArray(member.ministriesJoined) ? member.ministriesJoined.join(", ") : "",
    ministryRole: String(member.ministryRole ?? ""),
    volunteerStatus: String(member.volunteerStatus ?? ""),
    leaderName: String(member.leaderName ?? ""),
    trainingCompleted: typeof member.trainingCompleted === "string" ? member.trainingCompleted : Array.isArray(member.trainingCompleted) ? member.trainingCompleted.join(", ") : "",
    notes: String(member.notes ?? ""),
    remarks: String(member.remarks ?? ""),
    recordStatus: String(member.recordStatus ?? RecordStatus.ACTIVE),
    isArchived: Boolean(member.isArchived),
  };
}