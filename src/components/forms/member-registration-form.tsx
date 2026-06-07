"use client";

import { CivilStatus, Gender } from "@prisma/client";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toProperCase, titleize } from "@/lib/utils";

type RegistrationFormState = {
  passcode: string;
  firstName: string;
  middleName: string;
  lastName: string;
  suffix: string;
  gender: string;
  birthDate: string;
  civilStatus: string;
  contactNumber: string;
  email: string;
  address: string;
  emergencyContactName: string;
  emergencyContactNumber: string;
};

const properCaseFields = new Set<keyof RegistrationFormState>([
  "firstName",
  "middleName",
  "lastName",
  "suffix",
  "address",
  "emergencyContactName",
]);

export function MemberRegistrationForm() {
  const [form, setForm] = useState<RegistrationFormState>({
    passcode: "",
    firstName: "",
    middleName: "",
    lastName: "",
    suffix: "",
    gender: "",
    birthDate: "",
    civilStatus: "",
    contactNumber: "",
    email: "",
    address: "",
    emergencyContactName: "",
    emergencyContactNumber: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function set<K extends keyof RegistrationFormState>(key: K, value: RegistrationFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function applyProperCase<K extends keyof RegistrationFormState>(key: K) {
    if (!properCaseFields.has(key)) {
      return;
    }

    set(key, toProperCase(form[key]) as RegistrationFormState[K]);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);

    const payload = Object.fromEntries(
      Object.entries(form).map(([key, value]) => [key, properCaseFields.has(key as keyof RegistrationFormState) ? toProperCase(value) : value]),
    );

    const response = await fetch("/api/member-registration", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = (await response.json()) as { error?: string; memberId?: string; message?: string };
    setSaving(false);

    if (!response.ok) {
      setError(data.error ?? "Unable to submit registration.");
      return;
    }

    setSuccess(data.message ?? `Registration submitted. Your member ID is ${data.memberId}.`);
    setForm({
      passcode: "",
      firstName: "",
      middleName: "",
      lastName: "",
      suffix: "",
      gender: "",
      birthDate: "",
      civilStatus: "",
      contactNumber: "",
      email: "",
      address: "",
      emergencyContactName: "",
      emergencyContactNumber: "",
    });
  }

  return (
    <Card className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">Member registration</p>
        <h1 className="mt-2 font-serif text-3xl text-[var(--ink)]">Register your member profile</h1>
        <p className="mt-3 text-sm leading-7 text-[var(--muted)]">Use the church passcode, then enter your details. Names and key text fields will be normalized to proper case automatically.</p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm font-medium text-[var(--ink)] md:col-span-2">
            <span>Registration passcode</span>
            <Input type="password" value={form.passcode} onChange={(event) => set("passcode", event.target.value)} required />
          </label>
          <label className="space-y-2 text-sm font-medium text-[var(--ink)]">
            <span>First name</span>
            <Input value={form.firstName} onChange={(event) => set("firstName", event.target.value)} onBlur={() => applyProperCase("firstName")} required />
          </label>
          <label className="space-y-2 text-sm font-medium text-[var(--ink)]">
            <span>Middle name</span>
            <Input value={form.middleName} onChange={(event) => set("middleName", event.target.value)} onBlur={() => applyProperCase("middleName")} />
          </label>
          <label className="space-y-2 text-sm font-medium text-[var(--ink)]">
            <span>Last name</span>
            <Input value={form.lastName} onChange={(event) => set("lastName", event.target.value)} onBlur={() => applyProperCase("lastName")} required />
          </label>
          <label className="space-y-2 text-sm font-medium text-[var(--ink)]">
            <span>Suffix</span>
            <Input value={form.suffix} onChange={(event) => set("suffix", event.target.value)} onBlur={() => applyProperCase("suffix")} placeholder="Jr., Sr., III" />
          </label>
          <label className="space-y-2 text-sm font-medium text-[var(--ink)]">
            <span>Date of birth</span>
            <Input type="date" value={form.birthDate} onChange={(event) => set("birthDate", event.target.value)} required />
          </label>
          <label className="space-y-2 text-sm font-medium text-[var(--ink)]">
            <span>Gender</span>
            <select value={form.gender} onChange={(event) => set("gender", event.target.value)} className="h-9 w-full rounded-lg border border-[var(--line)] bg-white px-3 text-sm text-[var(--ink)] outline-none">
              <option value="">Select gender</option>
              {Object.values(Gender).map((option) => <option key={option} value={option}>{titleize(option)}</option>)}
            </select>
          </label>
          <label className="space-y-2 text-sm font-medium text-[var(--ink)]">
            <span>Civil status</span>
            <select value={form.civilStatus} onChange={(event) => set("civilStatus", event.target.value)} className="h-9 w-full rounded-lg border border-[var(--line)] bg-white px-3 text-sm text-[var(--ink)] outline-none">
              <option value="">Select civil status</option>
              {Object.values(CivilStatus).map((option) => <option key={option} value={option}>{titleize(option)}</option>)}
            </select>
          </label>
          <label className="space-y-2 text-sm font-medium text-[var(--ink)]">
            <span>Contact number</span>
            <Input value={form.contactNumber} onChange={(event) => set("contactNumber", event.target.value)} required />
          </label>
          <label className="space-y-2 text-sm font-medium text-[var(--ink)]">
            <span>Email</span>
            <Input type="email" value={form.email} onChange={(event) => set("email", event.target.value)} required />
          </label>
          <label className="space-y-2 text-sm font-medium text-[var(--ink)] md:col-span-2">
            <span>Address</span>
            <Textarea value={form.address} onChange={(event) => set("address", event.target.value)} onBlur={() => applyProperCase("address")} className="min-h-[90px]" required />
          </label>
          <label className="space-y-2 text-sm font-medium text-[var(--ink)]">
            <span>Emergency contact name</span>
            <Input value={form.emergencyContactName} onChange={(event) => set("emergencyContactName", event.target.value)} onBlur={() => applyProperCase("emergencyContactName")} />
          </label>
          <label className="space-y-2 text-sm font-medium text-[var(--ink)]">
            <span>Emergency contact number</span>
            <Input value={form.emergencyContactNumber} onChange={(event) => set("emergencyContactNumber", event.target.value)} />
          </label>
        </div>

        {error ? <p className="rounded-2xl bg-[#fff1ec] px-4 py-3 text-sm text-[#a53f2b]">{error}</p> : null}
        {success ? <p className="rounded-2xl bg-[#edf7ee] px-4 py-3 text-sm text-[#256f3a]">{success}</p> : null}

        <Button type="submit" disabled={saving}>{saving ? "Submitting..." : "Submit registration"}</Button>
      </form>
    </Card>
  );
}