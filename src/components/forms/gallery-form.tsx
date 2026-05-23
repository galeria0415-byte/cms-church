"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { ContentDeleteButton } from "@/components/forms/content-delete-button";
import { FileUploadField } from "@/components/forms/file-upload-field";
import { MultiUploadField } from "@/components/forms/multi-upload-field";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const schema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3),
  description: z.string().optional(),
  coverImage: z.string().optional(),
  images: z.string().optional(),
});

type Values = z.input<typeof schema>;

export function GalleryForm({ gallery }: { gallery?: Partial<Values> & { id?: string } }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, setValue, control, formState: { isSubmitting } } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: gallery?.title ?? "",
      slug: gallery?.slug ?? "",
      description: gallery?.description ?? "",
      coverImage: gallery?.coverImage ?? "",
      images: gallery?.images ?? "",
    },
  });

  const coverImage = useWatch({ control, name: "coverImage" });
  const images = useWatch({ control, name: "images" }) ?? "";

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    const response = await fetch(gallery?.id ? `/api/galleries/${gallery.id}` : "/api/galleries", {
      method: gallery?.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      setError(data.error ?? "Unable to save gallery.");
      return;
    }

    router.push("/admin/galleries");
    router.refresh();
  });

  return (
    <Card>
      <form className="space-y-5" onSubmit={onSubmit}>
        {error ? <p className="rounded-2xl bg-[#fff1ec] px-4 py-3 text-sm text-[#a53f2b]">{error}</p> : null}
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm font-medium text-[var(--ink)]"><span>Album title</span><Input {...register("title")} /></label>
          <label className="space-y-2 text-sm font-medium text-[var(--ink)]"><span>Slug</span><Input {...register("slug")} /></label>
        </div>
        <label className="space-y-2 text-sm font-medium text-[var(--ink)]"><span>Description</span><Textarea {...register("description")} /></label>
        <FileUploadField label="Cover image" value={coverImage} onUploaded={(value) => setValue("coverImage", value)} />
        <MultiUploadField label="Gallery images" value={images} onUploaded={(value) => setValue("images", value)} />
        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : gallery?.id ? "Update gallery" : "Create gallery"}</Button>
          {gallery?.id ? <ContentDeleteButton endpoint={`/api/galleries/${gallery.id}`} redirectTo="/admin/galleries" /> : null}
        </div>
      </form>
    </Card>
  );
}

export function mapGalleryToForm(gallery: { id: string; title: string; slug: string; description: string | null; coverImage: string | null; images: Array<{ imageUrl: string }>; }) {
  return {
    id: gallery.id,
    title: gallery.title,
    slug: gallery.slug,
    description: gallery.description ?? "",
    coverImage: gallery.coverImage ?? "",
    images: gallery.images.map((image) => image.imageUrl).join(", "),
  };
}