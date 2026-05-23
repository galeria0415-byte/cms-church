"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { ContentDeleteButton } from "@/components/forms/content-delete-button";
import { FileUploadField } from "@/components/forms/file-upload-field";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatDateInput } from "@/lib/utils";

const schema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3),
  description: z.string().min(10),
  eventDate: z.string().min(1),
  time: z.string().optional(),
  location: z.string().optional(),
  bannerImage: z.string().optional(),
  registrationLink: z.string().optional(),
});

type Values = z.input<typeof schema>;

export function EventForm({ event }: { event?: Partial<Values> & { id?: string } }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, setValue, control, formState: { isSubmitting } } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: event?.title ?? "",
      slug: event?.slug ?? "",
      description: event?.description ?? "",
      eventDate: event?.eventDate ?? "",
      time: event?.time ?? "",
      location: event?.location ?? "",
      bannerImage: event?.bannerImage ?? "",
      registrationLink: event?.registrationLink ?? "",
    },
  });

  const bannerImage = useWatch({ control, name: "bannerImage" });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    const response = await fetch(event?.id ? `/api/events/${event.id}` : "/api/events", {
      method: event?.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      setError(data.error ?? "Unable to save event.");
      return;
    }

    router.push("/admin/events");
    router.refresh();
  });

  return (
    <Card>
      <form className="space-y-5" onSubmit={onSubmit}>
        {error ? <p className="rounded-2xl bg-[#fff1ec] px-4 py-3 text-sm text-[#a53f2b]">{error}</p> : null}
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm font-medium text-[var(--ink)]"><span>Title</span><Input {...register("title")} /></label>
          <label className="space-y-2 text-sm font-medium text-[var(--ink)]"><span>Slug</span><Input {...register("slug")} /></label>
          <label className="space-y-2 text-sm font-medium text-[var(--ink)]"><span>Event date</span><Input type="date" {...register("eventDate")} /></label>
          <label className="space-y-2 text-sm font-medium text-[var(--ink)]"><span>Time</span><Input {...register("time")} /></label>
          <label className="space-y-2 text-sm font-medium text-[var(--ink)] md:col-span-2"><span>Location</span><Input {...register("location")} /></label>
          <label className="space-y-2 text-sm font-medium text-[var(--ink)] md:col-span-2"><span>Registration link</span><Input {...register("registrationLink")} /></label>
        </div>
        <label className="space-y-2 text-sm font-medium text-[var(--ink)]"><span>Description</span><Textarea className="min-h-[220px]" {...register("description")} /></label>
        <FileUploadField label="Banner image" value={bannerImage} onUploaded={(value) => setValue("bannerImage", value)} />
        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : event?.id ? "Update event" : "Create event"}</Button>
          {event?.id ? <ContentDeleteButton endpoint={`/api/events/${event.id}`} redirectTo="/admin/events" /> : null}
        </div>
      </form>
    </Card>
  );
}

export function mapEventToForm(event: { id: string; title: string; slug: string; description: string; eventDate: Date; time: string | null; location: string | null; bannerImage: string | null; registrationLink: string | null; }) {
  return {
    id: event.id,
    title: event.title,
    slug: event.slug,
    description: event.description,
    eventDate: formatDateInput(event.eventDate),
    time: event.time ?? "",
    location: event.location ?? "",
    bannerImage: event.bannerImage ?? "",
    registrationLink: event.registrationLink ?? "",
  };
}