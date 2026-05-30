"use client";

import { useEffect, useState } from "react";

import { MemberForm, mapMemberToForm } from "@/components/forms/member-form";
import { Button } from "@/components/ui/button";

type MemberResponse = {
  error?: string;
  member?: Record<string, unknown> & { id: string };
};

export function EditMemberClient({ id }: { id: string }) {
  const [member, setMember] = useState<(Record<string, unknown> & { id: string }) | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    const loadMember = async () => {
      try {
        const response = await fetch(`/api/members/${id}`, { cache: "no-store" });
        const data = (await response.json()) as MemberResponse;

        if (!response.ok || !data.member) {
          throw new Error(data.error ?? "Unable to load this member.");
        }

        if (isActive) {
          setMember(data.member);
          setError(null);
        }
      } catch (loadError) {
        if (isActive) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load this member.");
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    void loadMember();

    return () => {
      isActive = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="rounded-[28px] border border-[var(--line)] bg-white px-6 py-10 text-sm text-[var(--muted)]">
        Loading member details...
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="rounded-[28px] border border-red-200 bg-red-50 px-6 py-8 text-sm text-red-700">
        <p>{error ?? "Unable to load this member."}</p>
        <Button type="button" variant="secondary" className="mt-4" onClick={() => window.location.reload()}>
          Try again
        </Button>
      </div>
    );
  }

  return <MemberForm member={mapMemberToForm(member)} />;
}