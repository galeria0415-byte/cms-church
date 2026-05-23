"use client";

import { LoaderCircle, Upload } from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function FileUploadField({
  label,
  value,
  onUploaded,
  previewMode = "banner",
  helperText,
}: {
  label: string;
  value?: string;
  onUploaded: (value: string) => void;
  previewMode?: "logo" | "avatar" | "banner";
  helperText?: string;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const previewClassName =
    previewMode === "avatar"
      ? "h-24 w-24 rounded-full object-cover"
      : previewMode === "logo"
        ? "h-14 max-w-[220px] rounded-2xl object-contain"
        : "h-36 w-full rounded-3xl object-cover";

  async function handleFileSelect(file: File) {
    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    setIsUploading(false);

    if (!response.ok) {
      setError("Upload failed. Please try again.");
      return;
    }

    const data = (await response.json()) as { url: string };
    onUploaded(data.url);
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-[var(--ink)]">{label}</p>
      {value ? (
        <div className="rounded-[24px] border border-[var(--line)] bg-[var(--surface-subtle)] p-4">
          <img src={value} alt={label} className={previewClassName} />
        </div>
      ) : null}
      <div className="flex flex-col gap-3">
        <Input value={value ?? ""} onChange={(event) => onUploaded(event.target.value)} placeholder="Upload a file or paste a URL" />
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              void handleFileSelect(file);
            }
          }}
        />
        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="secondary" onClick={() => inputRef.current?.click()} disabled={isUploading}>
            {isUploading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
            {isUploading ? "Uploading" : "Upload"}
          </Button>
          {value ? (
            <Button type="button" variant="ghost" onClick={() => onUploaded("")}>
              Remove
            </Button>
          ) : null}
        </div>
      </div>
      {helperText ? <p className="text-sm text-[var(--muted)]">{helperText}</p> : null}
      {error ? <p className="text-sm text-[#a53f2b]">{error}</p> : null}
    </div>
  );
}