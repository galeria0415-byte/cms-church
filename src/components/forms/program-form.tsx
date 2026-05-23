"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { ContentDeleteButton } from "@/components/forms/content-delete-button";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const schema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3),
  scheduleDay: z.string().min(2),
  scheduleTime: z.string().min(2),
  location: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

type Values = z.input<typeof schema>;

export function ProgramForm({ program }: { program?: Partial<Values> & { id?: string } }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: program?.title ?? "",
      slug: program?.slug ?? "",
      scheduleDay: program?.scheduleDay ?? "",
      scheduleTime: program?.scheduleTime ?? "",
      location: program?.location ?? "",
      description: program?.description ?? "",
      isActive: program?.isActive ?? true,
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    const response = await fetch(program?.id ? `/api/programs/${program.id}` : "/api/programs", {
      method: program?.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      setError(data.error ?? "Unable to save program.");
      return;
    }

    router.push("/admin/programs");
    router.refresh();
  });

  return (
    <Card>
      <form className="space-y-5" onSubmit={onSubmit}>
        {error ? <p className="rounded-2xl bg-[#fff1ec] px-4 py-3 text-sm text-[#a53f2b]">{error}</p> : null}
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm font-medium text-[var(--ink)]"><span>Title</span><Input {...register("title")} /></label>
          <label className="space-y-2 text-sm font-medium text-[var(--ink)]"><span>Slug</span><Input {...register("slug")} /></label>
          <label className="space-y-2 text-sm font-medium text-[var(--ink)]"><span>Schedule day</span><Input {...register("scheduleDay")} /></label>
          <label className="space-y-2 text-sm font-medium text-[var(--ink)]"><span>Schedule time</span><Input {...register("scheduleTime")} /></label>
          <label className="space-y-2 text-sm font-medium text-[var(--ink)] md:col-span-2"><span>Location</span><Input {...register("location")} /></label>
        </div>
        <label className="space-y-2 text-sm font-medium text-[var(--ink)]"><span>Description</span><Textarea {...register("description")} /></label>
        <label className="flex items-center gap-3 text-sm font-medium text-[var(--ink)]"><input type="checkbox" {...register("isActive")} /> Program is active</label>
        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : program?.id ? "Update program" : "Create program"}</Button>
          {program?.id ? <ContentDeleteButton endpoint={`/api/programs/${program.id}`} redirectTo="/admin/programs" /> : null}
        </div>
      </form>
    </Card>
  );
}

export function mapProgramToForm(program: {
  id: string;
  title: string;
  slug: string;
  scheduleDay: string;
  scheduleTime: string;
  location: string | null;
  description: string | null;
  isActive: boolean;
}) {
  return {
    id: program.id,
    title: program.title,
    slug: program.slug,
    scheduleDay: program.scheduleDay,
    scheduleTime: program.scheduleTime,
    location: program.location ?? "",
    description: program.description ?? "",
    isActive: program.isActive,
  };
}