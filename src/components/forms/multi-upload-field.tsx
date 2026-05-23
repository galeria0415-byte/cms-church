"use client";

import { LoaderCircle, Upload } from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function MultiUploadField({
  label,
  value,
  onUploaded,
}: {
  label: string;
  value: string;
  onUploaded: (value: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList) {
    setIsUploading(true);
    setError(null);

    try {
      const uploadedUrls: string[] = [];

      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Upload failed.");
        }

        const data = (await response.json()) as { url: string };
        uploadedUrls.push(data.url);
      }

      const current = value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      onUploaded([...current, ...uploadedUrls].join(", "));
    } catch {
      setError("One or more uploads failed.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-[var(--ink)]">{label}</p>
      <Textarea value={value} onChange={(event) => onUploaded(event.target.value)} placeholder="Comma-separated image URLs" />
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(event) => {
          if (event.target.files?.length) {
            void handleFiles(event.target.files);
          }
        }}
      />
      <Button type="button" variant="secondary" onClick={() => inputRef.current?.click()} disabled={isUploading}>
        {isUploading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
        {isUploading ? "Uploading images" : "Upload gallery images"}
      </Button>
      {error ? <p className="text-sm text-[#a53f2b]">{error}</p> : null}
    </div>
  );
}