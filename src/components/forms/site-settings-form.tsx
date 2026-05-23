"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { FileUploadField } from "@/components/forms/file-upload-field";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { SiteConfig } from "@/lib/site";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2 text-sm font-medium text-[var(--ink)]">
      <span>{label}</span>
      {children}
    </label>
  );
}

export function SiteSettingsForm({ initialSettings }: { initialSettings: SiteConfig }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [settings, setSettings] = useState(initialSettings);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const response = await fetch("/api/settings/site", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });

    const data = (await response.json()) as { error?: string; settings?: SiteConfig };

    if (!response.ok || !data.settings) {
      setError(data.error ?? "Unable to save the site settings.");
      return;
    }

    setSettings(data.settings);
    setSuccess("Branding updated.");
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">Website settings</p>
          <h1 className="mt-2 font-serif text-4xl text-[var(--ink)]">Branding</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">
            Update the logo and the public-facing church details used across the website and admin shell.
          </p>
        </div>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save settings"}
        </Button>
      </section>

      {error ? <p className="rounded-2xl bg-[#fff1ec] px-4 py-3 text-sm text-[#a53f2b]">{error}</p> : null}
      {success ? <p className="rounded-2xl bg-[#edf7ee] px-4 py-3 text-sm text-[#256f3a]">{success}</p> : null}

      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <Card className="space-y-5">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">Logo</p>
            <h2 className="mt-2 font-serif text-2xl text-[var(--ink)]">Website mark</h2>
          </div>
          <FileUploadField
            label="Church logo"
            value={settings.logoUrl}
            onUploaded={(value) => setSettings((current) => ({ ...current, logoUrl: value }))}
            previewMode="logo"
            helperText="Use a clean PNG or SVG logo with generous whitespace."
          />
        </Card>

        <Card className="space-y-6">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">Identity</p>
            <h2 className="mt-2 font-serif text-2xl text-[var(--ink)]">Church details</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Church name">
              <Input value={settings.name} onChange={(event) => setSettings((current) => ({ ...current, name: event.target.value }))} />
            </Field>
            <Field label="Tagline">
              <Input value={settings.tagline} onChange={(event) => setSettings((current) => ({ ...current, tagline: event.target.value }))} />
            </Field>
            <Field label="Phone">
              <Input value={settings.phone} onChange={(event) => setSettings((current) => ({ ...current, phone: event.target.value }))} />
            </Field>
            <Field label="Email">
              <Input type="email" value={settings.email} onChange={(event) => setSettings((current) => ({ ...current, email: event.target.value }))} />
            </Field>
          </div>
          <Field label="Description">
            <Textarea value={settings.description} onChange={(event) => setSettings((current) => ({ ...current, description: event.target.value }))} />
          </Field>
          <Field label="Address">
            <Textarea value={settings.address} onChange={(event) => setSettings((current) => ({ ...current, address: event.target.value }))} className="min-h-[88px]" />
          </Field>
        </Card>
      </div>
    </form>
  );
}
