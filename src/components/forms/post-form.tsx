"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ContentStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { ContentDeleteButton } from "@/components/forms/content-delete-button";
import { FileUploadField } from "@/components/forms/file-upload-field";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatDateInput } from "@/lib/utils";

const schema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3),
  excerpt: z.string().optional(),
  content: z.string().min(10),
  featuredImage: z.string().optional(),
  publishDate: z.string().optional(),
  status: z.nativeEnum(ContentStatus),
  isFeatured: z.boolean().default(false),
});

type Values = z.input<typeof schema>;

export function PostForm({ post }: { post?: Partial<Values> & { id?: string } }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, setValue, control, formState: { isSubmitting } } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: post?.title ?? "",
      slug: post?.slug ?? "",
      excerpt: post?.excerpt ?? "",
      content: post?.content ?? "",
      featuredImage: post?.featuredImage ?? "",
      publishDate: post?.publishDate ?? "",
      status: post?.status ?? ContentStatus.DRAFT,
      isFeatured: post?.isFeatured ?? false,
    },
  });

  const featuredImage = useWatch({ control, name: "featuredImage" });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    const response = await fetch(post?.id ? `/api/posts/${post.id}` : "/api/posts", {
      method: post?.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      setError(data.error ?? "Unable to save post.");
      return;
    }

    router.push("/admin/posts");
    router.refresh();
  });

  return (
    <Card>
      <form className="space-y-5" onSubmit={onSubmit}>
        {error ? <p className="rounded-2xl bg-[#fff1ec] px-4 py-3 text-sm text-[#a53f2b]">{error}</p> : null}
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm font-medium text-[var(--ink)]"><span>Title</span><Input {...register("title")} /></label>
          <label className="space-y-2 text-sm font-medium text-[var(--ink)]"><span>Slug</span><Input {...register("slug")} /></label>
          <label className="space-y-2 text-sm font-medium text-[var(--ink)]"><span>Publish date</span><Input type="date" {...register("publishDate")} /></label>
          <label className="space-y-2 text-sm font-medium text-[var(--ink)]"><span>Status</span><Select {...register("status")}>{Object.values(ContentStatus).map((option) => <option key={option} value={option}>{option}</option>)}</Select></label>
        </div>
        <label className="space-y-2 text-sm font-medium text-[var(--ink)]"><span>Excerpt</span><Textarea {...register("excerpt")} /></label>
        <label className="space-y-2 text-sm font-medium text-[var(--ink)]"><span>Content</span><Textarea className="min-h-[220px]" {...register("content")} /></label>
        <FileUploadField label="Featured image" value={featuredImage} onUploaded={(value) => setValue("featuredImage", value)} />
        <label className="flex items-center gap-3 text-sm font-medium text-[var(--ink)]"><input type="checkbox" {...register("isFeatured")} /> Feature as announcement</label>
        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : post?.id ? "Update post" : "Create post"}</Button>
          {post?.id ? <ContentDeleteButton endpoint={`/api/posts/${post.id}`} redirectTo="/admin/posts" /> : null}
        </div>
      </form>
    </Card>
  );
}

export function mapPostToForm(post: { id: string; title: string; slug: string; excerpt: string | null; content: string; featuredImage: string | null; publishDate: Date | null; status: ContentStatus; isFeatured: boolean; }) {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt ?? "",
    content: post.content,
    featuredImage: post.featuredImage ?? "",
    publishDate: formatDateInput(post.publishDate),
    status: post.status,
    isFeatured: post.isFeatured,
  };
}