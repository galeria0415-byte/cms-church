"use client";

import { useState } from "react";

import { MemberForm } from "@/components/forms/member-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function MemberRegistrationForm({ nextMemberId, memberIdPrefix }: { nextMemberId: string; memberIdPrefix: string }) {
  const [passcode, setPasscode] = useState("");
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handlePasscodeSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setChecking(true);
    setError(null);

    const response = await fetch("/api/member-registration", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "verify", passcode }),
    });

    const data = (await response.json()) as { error?: string; ok?: boolean };
    setChecking(false);

    if (!response.ok || !data.ok) {
      setError(data.error ?? "Invalid registration passcode.");
      return;
    }

    setVerified(true);
  }

  if (successMessage) {
    return <Card className="mx-auto max-w-3xl rounded-2xl bg-[#edf7ee] px-6 py-5 text-sm text-[#256f3a]">{successMessage}</Card>;
  }

  if (!verified) {
    return (
      <Card className="mx-auto max-w-xl space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">Member registration</p>
          <h1 className="mt-2 font-serif text-3xl text-[var(--ink)]">Enter church passcode</h1>
          <p className="mt-3 text-sm leading-7 text-[var(--muted)]">The registration form stays hidden until the correct passcode is entered.</p>
        </div>

        <form className="space-y-5" onSubmit={handlePasscodeSubmit}>
          <label className="space-y-2 text-sm font-medium text-[var(--ink)]">
            <span>Registration passcode</span>
            <Input type="password" value={passcode} onChange={(event) => setPasscode(event.target.value)} required />
          </label>
          {error ? <p className="rounded-2xl bg-[#fff1ec] px-4 py-3 text-sm text-[#a53f2b]">{error}</p> : null}
          <div className="pt-1">
            <Button type="submit" disabled={checking}>{checking ? "Checking..." : "Continue"}</Button>
          </div>
        </form>
      </Card>
    );
  }

  return (
    <MemberForm
      nextMemberId={nextMemberId}
      memberIdPrefix={memberIdPrefix}
      submitEndpoint="/api/member-registration"
      submitLabel="Submit registration"
      passcode={passcode}
      allowLinkedMemberLookup={false}
      onSubmitted={(data) => {
        setSuccessMessage(data.message ?? `Registration submitted successfully. Your reference member ID is ${data.memberId ?? nextMemberId}.`);
        setVerified(false);
        setPasscode("");
      }}
    />
  );
}