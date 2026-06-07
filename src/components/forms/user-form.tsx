"use client";

import { buttonStyles } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";

const ROLES = ["ADMIN", "EDITOR", "STAFF", "VIEWER"] as const;

type UserFormData = {
  name: string;
  email: string;
  password: string;
  role: string;
};

type UserFormProps = {
  initialData?: { id: string; name?: string | null; email: string; role: string };
};

export function UserForm({ initialData }: UserFormProps) {
  const router = useRouter();
  const isEdit = Boolean(initialData?.id);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<UserFormData>({
    name: initialData?.name ?? "",
    email: initialData?.email ?? "",
    password: "",
    role: initialData?.role ?? "VIEWER",
  });

  function set<K extends keyof UserFormData>(key: K, value: UserFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload: Record<string, string> = {
      name: form.name,
      email: form.email,
      role: form.role,
    };
    if (form.password) payload.password = form.password;

    const url = isEdit ? `/api/users/${initialData!.id}` : "/api/users";
    const method = isEdit ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to save.");
      setSaving(false);
      return;
    }

    router.push("/admin/users");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="rounded-3xl border border-[var(--line)] bg-white p-6 space-y-5">
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">Account details</p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--ink)]">Name <span className="text-[var(--muted)]">(optional)</span></label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Full name"
              className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface-subtle)] px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--ink)]">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="user@church.org"
              className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface-subtle)] px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--ink)]">
              {isEdit ? "New password" : "Password"}
              {isEdit && <span className="text-[var(--muted)]"> (leave blank to keep)</span>}
            </label>
            <input
              type="password"
              required={!isEdit}
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              placeholder={isEdit ? "Leave blank to keep current" : "Min. 8 characters"}
              className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface-subtle)] px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--ink)]">Role</label>
            <select
              value={form.role}
              onChange={(e) => set("role", e.target.value)}
              className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface-subtle)] px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className={buttonStyles()}
        >
          {saving ? "Saving…" : isEdit ? "Save changes" : "Create user"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className={buttonStyles({ variant: "secondary" })}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
