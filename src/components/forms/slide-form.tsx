"use client";

import { FileUploadField } from "@/components/forms/file-upload-field";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useState } from "react";

type SlideFormData = {
  title: string;
  caption: string;
  mediaUrl: string;
  mediaType: string;
  linkUrl: string;
  linkLabel: string;
  sortOrder: number;
  isActive: boolean;
};

type SlideFormProps = {
  initialData?: Partial<SlideFormData> & { id?: string };
};

function looksLikeVideoUrl(value: string) {
  const normalized = value.trim().toLowerCase();
  return normalized.includes("youtube.com/watch")
    || normalized.includes("youtu.be/")
    || /\.(mp4|webm|ogg|mov)(\?|#|$)/.test(normalized);
}

function looksLikeImageUrl(value: string) {
  return /\.(jpg|jpeg|png|gif|webp|avif|svg)(\?|#|$)/i.test(value.trim());
}

export function SlideForm({ initialData }: SlideFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<SlideFormData>({
    title: initialData?.title ?? "",
    caption: initialData?.caption ?? "",
    mediaUrl: initialData?.mediaUrl ?? "",
    mediaType: initialData?.mediaType ?? "image",
    linkUrl: initialData?.linkUrl ?? "",
    linkLabel: initialData?.linkLabel ?? "",
    sortOrder: initialData?.sortOrder ?? 0,
    isActive: initialData?.isActive ?? true,
  });

  function set<K extends keyof SlideFormData>(key: K, value: SlideFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function setMediaUrl(value: string) {
    setForm((current) => ({
      ...current,
      mediaUrl: value,
      mediaType: looksLikeVideoUrl(value) ? "video" : looksLikeImageUrl(value) ? "image" : current.mediaType,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.mediaUrl.trim()) {
      setError("Please upload or enter a media URL.");
      return;
    }
    setSaving(true);
    setError(null);

    const url = initialData?.id ? `/api/slides/${initialData.id}` : "/api/slides";
    const method = initialData?.id ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const data = await res.json() as { error?: string };
      setError(data.error ?? "Failed to save slide.");
      setSaving(false);
      return;
    }

    router.push("/admin/slides");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="space-y-5">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">Media</p>
          <h2 className="mt-1 font-serif text-xl text-[var(--ink)]">Slide content</h2>
        </div>

        {/* Media type selector */}
        <div>
          <p className="mb-2 text-[13px] font-medium text-[var(--ink)]">Media type</p>
          <div className="flex gap-3">
            {(["image", "video"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => set("mediaType", t)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                  form.mediaType === t
                    ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                    : "border-[var(--line)] text-[var(--ink)] hover:border-[var(--accent)]"
                }`}
              >
                {t === "image" ? "🖼 Image" : "🎬 Video"}
              </button>
            ))}
          </div>
        </div>

        {/* Upload */}
        <FileUploadField
          label={form.mediaType === "video" ? "Video file" : "Image"}
          value={form.mediaUrl}
          onUploaded={(url) => setMediaUrl(url)}
          helperText={form.mediaType === "video" ? "Paste a YouTube link or upload an MP4/WebM/MOV file." : "JPG, PNG, or WebP recommended."}
          accept={form.mediaType === "video" ? "video/mp4,video/webm,video/ogg,video/quicktime" : "image/*"}
          renderAs={form.mediaType === "video" ? "video" : "image"}
        />

        {/* Or enter URL manually */}
        <div>
          <label className="block text-[13px] font-medium text-[var(--ink)]">Or paste URL directly</label>
          <input
            type="text"
            value={form.mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
            placeholder={form.mediaType === "video" ? "https://youtube.com/watch?v=... or /api/uploads/..." : "https://... or /api/uploads/..."}
            className="mt-1 w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          />
        </div>

        {/* Title */}
        <div>
          <label className="block text-[13px] font-medium text-[var(--ink)]">Title <span className="text-[var(--muted)]">(optional)</span></label>
          <Input
            className="mt-1"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="Welcome to our church"
          />
        </div>

        {/* Caption */}
        <div>
          <label className="block text-[13px] font-medium text-[var(--ink)]">Caption <span className="text-[var(--muted)]">(optional)</span></label>
          <textarea
            rows={2}
            value={form.caption}
            onChange={(e) => set("caption", e.target.value)}
            placeholder="A short description shown below the title..."
            className="mt-1 w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] resize-none"
          />
        </div>

        {/* Link */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-[13px] font-medium text-[var(--ink)]">Link URL <span className="text-[var(--muted)]">(optional)</span></label>
            <Input
              className="mt-1"
              type="url"
              value={form.linkUrl}
              onChange={(e) => set("linkUrl", e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[var(--ink)]">Link label</label>
            <Input
              className="mt-1"
              value={form.linkLabel}
              onChange={(e) => set("linkLabel", e.target.value)}
              placeholder="Learn more"
            />
          </div>
        </div>
      </Card>

      <Card className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">Options</p>
          <h2 className="mt-1 font-serif text-xl text-[var(--ink)]">Display settings</h2>
        </div>
        <div className="flex items-center gap-3">
          <input
            id="isActive"
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => set("isActive", e.target.checked)}
            className="h-4 w-4 rounded border-[var(--line)] accent-[var(--accent)]"
          />
          <label htmlFor="isActive" className="text-sm font-medium text-[var(--ink)]">Active (visible on homepage)</label>
        </div>
        <div>
          <label className="block text-[13px] font-medium text-[var(--ink)]">Sort order <span className="text-[var(--muted)]">(lower = first)</span></label>
          <Input
            className="mt-1 w-24"
            type="number"
            min={0}
            value={String(form.sortOrder)}
            onChange={(e) => set("sortOrder", Number(e.target.value))}
          />
        </div>
      </Card>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className={buttonStyles()}
        >
          {saving ? "Saving…" : initialData?.id ? "Save changes" : "Create slide"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/slides")}
          className={buttonStyles({ variant: "secondary" })}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
