import { notFound } from "next/navigation";

import { MembershipStatus } from "@prisma/client";

import { PrintToolbar } from "@/components/print/print-toolbar";
import { requireRole } from "@/lib/auth";
import { DASHBOARD_ROLES } from "@/lib/permissions";
import { getMemberRecord } from "@/lib/member-record";
import { getSiteSettings } from "@/lib/site-settings";
import { formatDate, fullName, parseCsv, titleize } from "@/lib/utils";

type Params = Promise<{ id: string }>;

function PrintRow({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="grid gap-2 border-b border-slate-200 py-2 sm:grid-cols-[210px_minmax(0,1fr)] sm:gap-5">
      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</div>
      <div className="text-sm text-slate-900">{value || "-"}</div>
    </div>
  );
}

function PrintSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export default async function PrintMemberProfilePage({ params }: { params: Params }) {
  await requireRole(DASHBOARD_ROLES);
  const { id } = await params;
  const record = await getMemberRecord(id);

  if (!record) {
    notFound();
  }

  const settings = await getSiteSettings();
  const { member, resolvedChildren, ministryRoles } = record;
  const nickname = String((member as Record<string, unknown>).nickname ?? "");
  const ministryText = ministryRoles
    .map((role) => [role.ministry, role.role].filter(Boolean).join(": "))
    .filter(Boolean)
    .join("; ");

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 text-slate-900 print:max-w-none print:px-0 print:py-0">
      <PrintToolbar />

      <div className="rounded-[28px] border border-slate-200 bg-white p-6 print:border-0 print:shadow-none">
        <div className="flex items-start justify-between gap-6 border-b border-slate-200 pb-6">
          <div className="flex items-center gap-4">
            {settings.logoUrl ? (
              <img src={settings.logoUrl} alt={settings.name} className="h-16 w-16 object-contain" />
            ) : null}
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Membership profile</p>
              <h1 className="mt-2 text-2xl font-semibold">{settings.name}</h1>
              <p className="mt-1 text-sm text-slate-500">{settings.address}</p>
            </div>
          </div>
          <div className="text-right text-sm">
            <p className="font-semibold">{fullName(member)}</p>
            <p>{member.memberId}</p>
            <p>{titleize(member.membershipStatus)}</p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <PrintSection title="Personal & Contact">
            <PrintRow label="First name" value={member.firstName} />
            <PrintRow label="Middle name" value={member.middleName} />
            <PrintRow label="Last name" value={member.lastName} />
            <PrintRow label="Suffix" value={member.suffix} />
            <PrintRow label="Nickname" value={nickname} />
            <PrintRow label="Date of birth" value={formatDate(member.birthDate)} />
            <PrintRow label="Gender" value={member.gender ? titleize(member.gender) : undefined} />
            <PrintRow label="Citizenship" value={member.nationality} />
            <PrintRow label="Civil status" value={member.civilStatus ? titleize(member.civilStatus) : undefined} />
            <PrintRow label="Contact number" value={member.contactNumber} />
            <PrintRow label="Email address" value={member.email} />
            <PrintRow label="Address" value={member.address} />
            <PrintRow label="Emergency contact name" value={member.emergencyContactName} />
            <PrintRow label="Emergency contact number" value={member.emergencyContactNumber} />
          </PrintSection>

          <PrintSection title="Family">
            <PrintRow label="Spouse" value={member.spouseName} />
            <PrintRow label="Spouse member ID" value={member.spouseMemberId} />
            <PrintRow label="Wedding date" value={formatDate(member.weddingDate)} />
            <PrintRow label="Father's name" value={member.fatherName} />
            <PrintRow label="Father's member ID" value={member.fatherMemberId} />
            <PrintRow label="Father's date of birth" value={formatDate(member.fatherBirthDate)} />
            <PrintRow label="Father's date of death" value={formatDate(member.fatherDeceasedDate)} />
            <PrintRow label="Mother's name" value={member.motherName} />
            <PrintRow label="Mother's member ID" value={member.motherMemberId} />
            <PrintRow label="Mother's date of birth" value={formatDate(member.motherBirthDate)} />
            <PrintRow label="Mother's date of death" value={formatDate(member.motherDeceasedDate)} />
            <PrintRow label="Children" value={resolvedChildren.map((child) => child.name || "(unnamed)").join(", ")} />
            <PrintRow label="Guardian" value={member.guardian} />
          </PrintSection>

          <PrintSection title="Education & Work">
            <PrintRow label="Highest education" value={member.highestEducation} />
            <PrintRow label="School attended" value={member.schoolAttended} />
            <PrintRow label="Course / degree" value={member.courseOrDegree} />
            <PrintRow label="Occupation" value={member.occupation} />
            <PrintRow label="Company / employer" value={member.companyName} />
            <PrintRow label="Employment status" value={member.employmentStatus} />
            <PrintRow label="Work address" value={member.workAddress} />
          </PrintSection>

          <PrintSection title="Church Membership">
            <PrintRow label="Date joined church" value={formatDate(member.dateJoinedChurch)} />
            <PrintRow label="Membership status" value={titleize(member.membershipStatus)} />
            {member.membershipStatus === MembershipStatus.DECEASED && (
              <PrintRow label="Date of death" value={formatDate(member.deceasedDate)} />
            )}
            <PrintRow label="Membership type" value={titleize(member.membershipType)} />
            <PrintRow label="Membership category" value={member.membershipCategory} />
            <PrintRow label="Church organization" value={member.churchOrganization} />
            <PrintRow label="Date baptized" value={formatDate(member.baptizedDate)} />
            <PrintRow label="Confirmation date" value={formatDate(member.confirmationDate)} />
            <PrintRow label="Previous church" value={member.previousChurch} />
            <PrintRow label="Shepherding group" value={member.shepherdingGroup} />
            <PrintRow label="Service attendance" value={member.serviceAttendanceStatus ? titleize(member.serviceAttendanceStatus) : undefined} />
            <PrintRow label="Record status" value={titleize(member.recordStatus)} />
          </PrintSection>

          <PrintSection title="Ministry & Notes">
            <PrintRow label="Ministry roles" value={ministryText} />
            <PrintRow label="Training completed" value={parseCsv(member.trainingCompleted).join(", ")} />
            <PrintRow label="Notes" value={member.notes} />
            <PrintRow label="Remarks" value={member.remarks} />
          </PrintSection>
        </div>
      </div>
    </div>
  );
}