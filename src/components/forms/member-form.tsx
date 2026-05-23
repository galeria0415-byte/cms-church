"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  BaptismStatus,
  CivilStatus,
  Gender,
  MembershipStatus,
  MembershipType,
  RecordStatus,
  ServiceAttendanceStatus,
} from "@prisma/client";
import {
  BookOpen,
  Briefcase,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Heart,
  Lock,
  Upload,
  User,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { EDUCATION_LEVELS, EMPLOYMENT_STATUSES, PH_CITIZENSHIPS, PH_REGIONS } from "@/lib/ph-data";
import { cn, formatDateInput, titleize } from "@/lib/utils";

// ── Schema ────────────────────────────────────────────────────────────────────

const memberFormSchema = z.object({
  memberId: z.string().min(2, "Member ID is required."),
  firstName: z.string().min(1, "First name is required."),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Last name is required."),
  suffix: z.string().optional(),
  nickname: z.string().optional(),
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
  childCount: z.coerce.number().min(0).default(0),
  parentsName: z.string().optional(),
  guardian: z.string().optional(),
  householdGroup: z.string().optional(),
  dependents: z.coerce.number().min(0).default(0),
  deceasedDate: z.string().optional(),
  highestEducation: z.string().optional(),
  schoolAttended: z.string().optional(),
  courseOrDegree: z.string().optional(),
  occupation: z.string().optional(),
  companyName: z.string().optional(),
  employmentStatus: z.string().optional(),
  workAddress: z.string().optional(),
  dateJoinedChurch: z.string().optional(),
  membershipStatus: z.string().default(MembershipStatus.ACTIVE),
  membershipType: z.string().default(MembershipType.MEMBER),
  baptismStatus: z.string().default(BaptismStatus.UNKNOWN),
  baptizedDate: z.string().optional(),
  previousChurch: z.string().optional(),
  firstVisitDate: z.string().optional(),
  assignedSmallGroup: z.string().optional(),
  serviceAttendanceStatus: z.string().default(ServiceAttendanceStatus.REGULAR),
  ministriesJoined: z.string().optional(),
  ministryRole: z.string().optional(),
  volunteerStatus: z.string().optional(),
  leaderName: z.string().optional(),
  trainingCompleted: z.string().optional(),
  notes: z.string().optional(),
  remarks: z.string().optional(),
  recordStatus: z.string().default(RecordStatus.ACTIVE),
  isArchived: z.boolean().default(false),
});

type MemberFormValues = z.input<typeof memberFormSchema>;
type ExistingMember = Partial<MemberFormValues> & { id?: string };

// ── Steps ────────────────────────────────────────────────────────────────────

const STEPS = [
  { label: "Personal & Contact", icon: User },
  { label: "Family", icon: Users },
  { label: "Education & Work", icon: Briefcase },
  { label: "Church", icon: BookOpen },
  { label: "Ministry", icon: Heart },
  { label: "Summary", icon: CheckCircle2 },
] as const;

const STEP_REQUIRED_FIELDS: Record<number, (keyof MemberFormValues)[]> = {
  0: ["memberId", "firstName", "lastName"],
  1: [],
  2: [],
  3: [],
  4: [],
  5: [],
};

// ── Small helpers ─────────────────────────────────────────────────────────────

function Field({
  label,
  required,
  error,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-[13px] font-medium text-[var(--ink)]">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-[11px] text-[var(--muted)]">{hint}</p>}
      {error && <p className="text-[12px] text-red-600">{error}</p>}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value?: string | number | boolean | null }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex gap-3 border-b border-[var(--line)] py-2 last:border-0">
      <span className="w-44 shrink-0 text-[12px] text-[var(--muted)]">{label}</span>
      <span className="text-[13px] text-[var(--ink)]">{String(value)}</span>
    </div>
  );
}

function SummarySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">{title}</p>
      <div className="rounded-lg border border-[var(--line)] bg-[var(--surface-subtle)] px-3">{children}</div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function MemberForm({ member }: { member?: ExistingMember }) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [addrRegion, setAddrRegion] = useState("");
  const [addrProvince, setAddrProvince] = useState("");

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
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
      nickname: member?.nickname ?? "",
      gender: member?.gender ?? "",
      birthDate: member?.birthDate ?? "",
      civilStatus: member?.civilStatus ?? "",
      nationality: member?.nationality ?? "Filipino",
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

  const selectedRegion = PH_REGIONS.find((r) => r.code === addrRegion);
  const provinces = selectedRegion ? [...selectedRegion.provinces] : [];

  const updateAddressHint = useCallback(
    (region: string, province: string) => {
      const current = getValues("address");
      const hint = [province, region].filter(Boolean).join(", ");
      if (!current && hint) setValue("address", hint + ", ");
    },
    [getValues, setValue],
  );

  const handleNext = async () => {
    const fields = STEP_REQUIRED_FIELDS[currentStep] ?? [];
    if (fields.length > 0) {
      const valid = await trigger(fields);
      if (!valid) return;
    }
    setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => {
    setCurrentStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    const payload = {
      ...values,
      email: values.email?.trim() || undefined,
      middleName: values.middleName?.trim() || undefined,
      suffix: values.suffix?.trim() || undefined,
      nickname: values.nickname?.trim() || undefined,
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

    const response = await fetch(
      member?.id ? `/api/members/${member.id}` : "/api/members",
      {
        method: member?.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );

    const data = (await response.json()) as { error?: string; member?: { id: string } };

    if (!response.ok || !data.member) {
      setError(data.error ?? "Something went wrong while saving the member.");
      return;
    }

    router.push(`/admin/members/${data.member.id}`);
    router.refresh();
  });

  const values = getValues();
  const totalSteps = STEPS.length;

  return (
    <div className="space-y-4">
      {/* ── Step indicator ──────────────────────────────────────────── */}
      <Card className="overflow-hidden p-0">
        <div className="flex">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            const isActive = i === currentStep;
            const isDone = i < currentStep;
            const isLocked = i > currentStep;
            return (
              <button
                key={i}
                type="button"
                onClick={() => isDone && setCurrentStep(i)}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 border-b-2 px-2 py-3 text-[11px] font-medium transition",
                  isActive
                    ? "border-[#e05a1e] bg-gradient-to-b from-[#fff7f3] to-white text-[#c04a14]"
                    : isDone
                      ? "cursor-pointer border-transparent text-[var(--accent)] hover:bg-[var(--sand)]"
                      : "cursor-default border-transparent text-[var(--muted)]",
                )}
              >
                {isLocked ? (
                  <Lock className="h-4 w-4" />
                ) : isDone ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
                <span className="hidden text-center leading-tight sm:block">{step.label}</span>
              </button>
            );
          })}
        </div>
        <div className="h-1 bg-[var(--line)]">
          <div
            className="h-full bg-[#e05a1e] transition-all duration-300"
            style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          />
        </div>
        <div className="px-4 py-2 text-[12px] text-[var(--muted)]">
          Step {currentStep + 1} of {totalSteps} — <span className="font-medium text-[var(--ink)]">{STEPS[currentStep].label}</span>
        </div>
      </Card>

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <form onSubmit={onSubmit}>
        <Card>
          {/* ── Step 0: Personal & Contact ──────────────────────────── */}
          {currentStep === 0 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-semibold text-[var(--ink)]">Personal Information & Contact</h2>
                <p className="mt-0.5 text-sm text-[var(--muted)]">Tell us about yourself and how to reach you.</p>
              </div>

              {/* Photo */}
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full border border-[var(--line)] bg-[var(--surface-subtle)]">
                  {profilePhotoUrl ? (
                    <img src={profilePhotoUrl} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[var(--muted)]">
                      <User className="h-6 w-6" />
                    </div>
                  )}
                </div>
                <div>
                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[var(--line)] bg-white px-3 py-1.5 text-[13px] font-medium text-[var(--ink)] transition hover:bg-[var(--sand)]">
                    <Upload className="h-3.5 w-3.5" />
                    Upload photo
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const fd = new FormData();
                        fd.append("file", file);
                        const res = await fetch("/api/upload", { method: "POST", body: fd });
                        if (res.ok) {
                          const d = await res.json() as { url?: string };
                          if (d.url) setValue("profilePhotoUrl", d.url);
                        }
                      }}
                    />
                  </label>
                  <p className="mt-1 text-[11px] text-[var(--muted)]">JPG, PNG or WebP. Max 10 MB.</p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Field label="Member ID" required error={errors.memberId?.message}>
                  <Input placeholder="e.g. M-0001" {...register("memberId")} />
                </Field>
                <Field label="First Name" required error={errors.firstName?.message} hint='If multiple: "Maria Clara" is fine.'>
                  <Input placeholder="Enter first name(s)" {...register("firstName")} />
                </Field>
                <Field label="Last Name" required error={errors.lastName?.message} hint="Enter last name or family name only.">
                  <Input placeholder="Family name" {...register("lastName")} />
                </Field>
                <Field label="Middle Name">
                  <Input placeholder="Optional" {...register("middleName")} />
                </Field>
                <Field label="Suffix">
                  <Select {...register("suffix")}>
                    <option value="">None</option>
                    {["Jr.", "Sr.", "II", "III", "IV", "V"].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Nickname">
                  <Input placeholder="Preferred name" {...register("nickname")} />
                </Field>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Field label="Date of Birth" hint="Cannot be a future date.">
                  <Input type="date" {...register("birthDate")} />
                </Field>
                <Field label="Gender">
                  <Select {...register("gender")}>
                    <option value="">Select gender</option>
                    {Object.values(Gender).map((g) => (
                      <option key={g} value={g}>{titleize(g)}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Citizenship">
                  <Select {...register("nationality")}>
                    {PH_CITIZENSHIPS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Civil Status">
                  <Select {...register("civilStatus")}>
                    <option value="">Select civil status</option>
                    {Object.values(CivilStatus).map((s) => (
                      <option key={s} value={s}>{titleize(s)}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Contact Number">
                  <Input type="tel" placeholder="+63 9XX XXX XXXX" {...register("contactNumber")} />
                </Field>
                <Field label="Email Address">
                  <Input type="email" placeholder="example@email.com" {...register("email")} />
                </Field>
              </div>

              <div className="space-y-3 rounded-lg border border-[var(--line)] bg-[var(--surface-subtle)] p-4">
                <p className="text-[13px] font-medium text-[var(--ink)]">Complete Address</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Region">
                    <Select
                      value={addrRegion}
                      onChange={(e) => {
                        setAddrRegion(e.target.value);
                        setAddrProvince("");
                        updateAddressHint(e.target.value, "");
                      }}
                    >
                      <option value="">Select region</option>
                      {PH_REGIONS.map((r) => (
                        <option key={r.code} value={r.code}>{r.name}</option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Province">
                    <Select
                      value={addrProvince}
                      disabled={!addrRegion}
                      onChange={(e) => {
                        setAddrProvince(e.target.value);
                        updateAddressHint(addrRegion, e.target.value);
                      }}
                    >
                      <option value="">Select province</option>
                      {provinces.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </Select>
                  </Field>
                </div>
                <Field label="Street / Barangay / City / Municipality" hint="Include house number, street, barangay, and city.">
                  <Input placeholder="House No., Street, Barangay, City/Municipality" {...register("address")} />
                </Field>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Emergency Contact Name">
                  <Input placeholder="Full name" {...register("emergencyContactName")} />
                </Field>
                <Field label="Emergency Contact Number">
                  <Input type="tel" placeholder="+63 9XX XXX XXXX" {...register("emergencyContactNumber")} />
                </Field>
              </div>
            </div>
          )}

          {/* ── Step 1: Family ─────────────────────────────────────── */}
          {currentStep === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-semibold text-[var(--ink)]">Family Information</h2>
                <p className="mt-0.5 text-sm text-[var(--muted)]">Details about immediate family members.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Spouse Name">
                  <Input placeholder="Full name of spouse" {...register("spouseName")} />
                </Field>
                <Field label="Wedding Date">
                  <Input type="date" {...register("weddingDate")} />
                </Field>
                <Field label="Number of Children">
                  <Input type="number" min="0" placeholder="0" {...register("childCount", { valueAsNumber: true })} />
                </Field>
                <Field label="Number of Dependents">
                  <Input type="number" min="0" placeholder="0" {...register("dependents", { valueAsNumber: true })} />
                </Field>
                <Field label="Parent(s) Name">
                  <Input placeholder="Father and mother's name" {...register("parentsName")} />
                </Field>
                <Field label="Guardian">
                  <Input placeholder="If applicable" {...register("guardian")} />
                </Field>
                <Field label="Household Group">
                  <Input placeholder="e.g. Young Families" {...register("householdGroup")} />
                </Field>
                <Field label="Date of Death">
                  <Input type="date" {...register("deceasedDate")} />
                </Field>
              </div>
              <Field label="Children's Names" hint="Separate multiple names with commas.">
                <Textarea rows={2} placeholder="e.g. John Jr., Mary Grace, Samuel" {...register("childrenNames")} />
              </Field>
            </div>
          )}

          {/* ── Step 2: Education & Work ────────────────────────────── */}
          {currentStep === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-semibold text-[var(--ink)]">Education & Work</h2>
                <p className="mt-0.5 text-sm text-[var(--muted)]">Educational background and employment.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Highest Education">
                  <Select {...register("highestEducation")}>
                    <option value="">Select level</option>
                    {EDUCATION_LEVELS.map((e) => (
                      <option key={e} value={e}>{e}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="School Attended">
                  <Input placeholder="Name of school or university" {...register("schoolAttended")} />
                </Field>
                <Field label="Course / Degree">
                  <Input placeholder="e.g. BS Computer Science" {...register("courseOrDegree")} />
                </Field>
                <Field label="Occupation">
                  <Input placeholder="Job title or role" {...register("occupation")} />
                </Field>
                <Field label="Company / Employer">
                  <Input placeholder="Company or organization name" {...register("companyName")} />
                </Field>
                <Field label="Employment Status">
                  <Select {...register("employmentStatus")}>
                    <option value="">Select status</option>
                    {EMPLOYMENT_STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </Select>
                </Field>
              </div>
              <Field label="Work Address">
                <Input placeholder="Office or workplace address" {...register("workAddress")} />
              </Field>
            </div>
          )}

          {/* ── Step 3: Church ──────────────────────────────────────── */}
          {currentStep === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-semibold text-[var(--ink)]">Church Affiliation</h2>
                <p className="mt-0.5 text-sm text-[var(--muted)]">Membership standing and church history.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Date Joined Church">
                  <Input type="date" {...register("dateJoinedChurch")} />
                </Field>
                <Field label="First Visit Date">
                  <Input type="date" {...register("firstVisitDate")} />
                </Field>
                <Field label="Membership Status">
                  <Select {...register("membershipStatus")}>
                    {Object.values(MembershipStatus).map((s) => (
                      <option key={s} value={s}>{titleize(s)}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Membership Type">
                  <Select {...register("membershipType")}>
                    {Object.values(MembershipType).map((t) => (
                      <option key={t} value={t}>{titleize(t)}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Baptism Status">
                  <Select {...register("baptismStatus")}>
                    {Object.values(BaptismStatus).map((b) => (
                      <option key={b} value={b}>{titleize(b)}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Date Baptized">
                  <Input type="date" {...register("baptizedDate")} />
                </Field>
                <Field label="Previous Church">
                  <Input placeholder="Name of former church" {...register("previousChurch")} />
                </Field>
                <Field label="Assigned Small Group">
                  <Input placeholder="e.g. Young Families, Singles" {...register("assignedSmallGroup")} />
                </Field>
                <Field label="Service Attendance">
                  <Select {...register("serviceAttendanceStatus")}>
                    {Object.values(ServiceAttendanceStatus).map((s) => (
                      <option key={s} value={s}>{titleize(s)}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Record Status">
                  <Select {...register("recordStatus")}>
                    {Object.values(RecordStatus).map((s) => (
                      <option key={s} value={s}>{titleize(s)}</option>
                    ))}
                  </Select>
                </Field>
              </div>
            </div>
          )}

          {/* ── Step 4: Ministry ────────────────────────────────────── */}
          {currentStep === 4 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-semibold text-[var(--ink)]">Ministry Involvement</h2>
                <p className="mt-0.5 text-sm text-[var(--muted)]">Service roles and volunteer activities.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Ministry Role">
                  <Input placeholder="e.g. Worship Leader, Usher" {...register("ministryRole")} />
                </Field>
                <Field label="Volunteer Status">
                  <Select {...register("volunteerStatus")}>
                    <option value="">Select status</option>
                    {["Active", "Inactive", "On Leave", "Training"].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Cell Group Leader">
                  <Input placeholder="Leader's name" {...register("leaderName")} />
                </Field>
              </div>
              <Field label="Ministries Joined" hint="Separate multiple ministries with commas.">
                <Textarea rows={2} placeholder="e.g. Worship, Ushering, Children's Ministry" {...register("ministriesJoined")} />
              </Field>
              <Field label="Training Completed" hint="Separate multiple trainings with commas.">
                <Textarea rows={2} placeholder="e.g. New Members Class, Discipleship 101" {...register("trainingCompleted")} />
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Notes">
                  <Textarea rows={3} placeholder="Internal notes about this member…" {...register("notes")} />
                </Field>
                <Field label="Remarks">
                  <Textarea rows={3} placeholder="Additional remarks or observations…" {...register("remarks")} />
                </Field>
              </div>
            </div>
          )}

          {/* ── Step 5: Summary ─────────────────────────────────────── */}
          {currentStep === 5 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-semibold text-[var(--ink)]">Review & Save</h2>
                <p className="mt-0.5 text-sm text-[var(--muted)]">Please review all information before saving.</p>
              </div>
              <div className="space-y-4">
                <SummarySection title="Personal & Contact">
                  <SummaryRow label="Member ID" value={values.memberId} />
                  <SummaryRow label="Full Name" value={[values.firstName, values.middleName, values.lastName, values.suffix].filter(Boolean).join(" ")} />
                  <SummaryRow label="Nickname" value={values.nickname} />
                  <SummaryRow label="Gender" value={values.gender ? titleize(values.gender) : undefined} />
                  <SummaryRow label="Date of Birth" value={values.birthDate} />
                  <SummaryRow label="Civil Status" value={values.civilStatus ? titleize(values.civilStatus) : undefined} />
                  <SummaryRow label="Citizenship" value={values.nationality} />
                  <SummaryRow label="Contact" value={values.contactNumber} />
                  <SummaryRow label="Email" value={values.email} />
                  <SummaryRow label="Address" value={values.address} />
                  <SummaryRow label="Emergency Contact" value={values.emergencyContactName} />
                  <SummaryRow label="Emergency Number" value={values.emergencyContactNumber} />
                </SummarySection>
                <SummarySection title="Family">
                  <SummaryRow label="Spouse" value={values.spouseName} />
                  <SummaryRow label="Wedding Date" value={values.weddingDate} />
                  <SummaryRow label="Children" value={values.childCount as number} />
                  <SummaryRow label="Children Names" value={values.childrenNames} />
                  <SummaryRow label="Parents" value={values.parentsName} />
                  <SummaryRow label="Guardian" value={values.guardian} />
                  <SummaryRow label="Household Group" value={values.householdGroup} />
                </SummarySection>
                <SummarySection title="Education & Work">
                  <SummaryRow label="Education" value={values.highestEducation} />
                  <SummaryRow label="School" value={values.schoolAttended} />
                  <SummaryRow label="Course" value={values.courseOrDegree} />
                  <SummaryRow label="Occupation" value={values.occupation} />
                  <SummaryRow label="Company" value={values.companyName} />
                  <SummaryRow label="Employment Status" value={values.employmentStatus} />
                </SummarySection>
                <SummarySection title="Church">
                  <SummaryRow label="Date Joined" value={values.dateJoinedChurch} />
                  <SummaryRow label="First Visit" value={values.firstVisitDate} />
                  <SummaryRow label="Membership Status" value={values.membershipStatus ? titleize(values.membershipStatus) : undefined} />
                  <SummaryRow label="Membership Type" value={values.membershipType ? titleize(values.membershipType) : undefined} />
                  <SummaryRow label="Baptism" value={values.baptismStatus ? titleize(values.baptismStatus) : undefined} />
                  <SummaryRow label="Baptized Date" value={values.baptizedDate} />
                  <SummaryRow label="Previous Church" value={values.previousChurch} />
                  <SummaryRow label="Small Group" value={values.assignedSmallGroup} />
                  <SummaryRow label="Attendance" value={values.serviceAttendanceStatus ? titleize(values.serviceAttendanceStatus) : undefined} />
                </SummarySection>
                <SummarySection title="Ministry">
                  <SummaryRow label="Ministries" value={values.ministriesJoined} />
                  <SummaryRow label="Role" value={values.ministryRole} />
                  <SummaryRow label="Volunteer Status" value={values.volunteerStatus} />
                  <SummaryRow label="Leader" value={values.leaderName} />
                  <SummaryRow label="Training" value={values.trainingCompleted} />
                  <SummaryRow label="Notes" value={values.notes} />
                </SummarySection>
              </div>
            </div>
          )}
        </Card>

        {/* Navigation */}
        <div className="mt-4 flex items-center justify-between">
          <Button
            type="button"
            variant="secondary"
            onClick={handleBack}
            className={cn(currentStep === 0 && "invisible")}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
          {currentStep < STEPS.length - 1 ? (
            <Button type="button" onClick={() => void handleNext()}>
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : member?.id ? "Update member" : "Save member"}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

// ── Map existing Prisma member → form values ──────────────────────────────────

export function mapMemberToForm(member: Record<string, unknown> & { id: string }) {
  return {
    id: member.id,
    memberId: String(member.memberId ?? ""),
    firstName: String(member.firstName ?? ""),
    middleName: String(member.middleName ?? ""),
    lastName: String(member.lastName ?? ""),
    suffix: String(member.suffix ?? ""),
    nickname: String((member as { nickname?: unknown }).nickname ?? ""),
    gender: String(member.gender ?? ""),
    birthDate: formatDateInput(member.birthDate as string | Date | null),
    civilStatus: String(member.civilStatus ?? ""),
    nationality: String(member.nationality ?? "Filipino"),
    contactNumber: String(member.contactNumber ?? ""),
    email: String(member.email ?? ""),
    address: String(member.address ?? ""),
    profilePhotoUrl: String(member.profilePhotoUrl ?? ""),
    emergencyContactName: String(member.emergencyContactName ?? ""),
    emergencyContactNumber: String(member.emergencyContactNumber ?? ""),
    spouseName: String(member.spouseName ?? ""),
    weddingDate: formatDateInput(member.weddingDate as string | Date | null),
    childrenNames:
      typeof member.childrenNames === "string"
        ? member.childrenNames
        : Array.isArray(member.childrenNames)
          ? (member.childrenNames as string[]).join(", ")
          : "",
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
    serviceAttendanceStatus: String(
      member.serviceAttendanceStatus ?? ServiceAttendanceStatus.REGULAR,
    ),
    ministriesJoined:
      typeof member.ministriesJoined === "string"
        ? member.ministriesJoined
        : Array.isArray(member.ministriesJoined)
          ? (member.ministriesJoined as string[]).join(", ")
          : "",
    ministryRole: String(member.ministryRole ?? ""),
    volunteerStatus: String(member.volunteerStatus ?? ""),
    leaderName: String(member.leaderName ?? ""),
    trainingCompleted:
      typeof member.trainingCompleted === "string"
        ? member.trainingCompleted
        : Array.isArray(member.trainingCompleted)
          ? (member.trainingCompleted as string[]).join(", ")
          : "",
    notes: String(member.notes ?? ""),
    remarks: String(member.remarks ?? ""),
    recordStatus: String(member.recordStatus ?? RecordStatus.ACTIVE),
    isArchived: Boolean(member.isArchived),
  };
}
