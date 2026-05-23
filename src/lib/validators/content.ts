import { ContentStatus } from "@prisma/client";
import { z } from "zod";

const optionalString = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined));

const optionalDate = z.preprocess((value) => {
  if (!value) {
    return undefined;
  }

  return new Date(String(value));
}, z.date().optional());

const imageList = z.preprocess((value) => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}, z.array(z.string().url().or(z.string().startsWith("/uploads/").refine((s) => !s.includes(".."), { message: "Invalid upload path." }))));

export const postSchema = z.object({
  title: z.string().trim().min(3),
  slug: z.string().trim().min(3),
  excerpt: optionalString,
  content: z.string().trim().min(10),
  featuredImage: optionalString,
  publishDate: optionalDate,
  status: z.nativeEnum(ContentStatus).default(ContentStatus.DRAFT),
  isFeatured: z.boolean().optional().default(false),
});

export const eventSchema = z.object({
  title: z.string().trim().min(3),
  slug: z.string().trim().min(3),
  description: z.string().trim().min(10),
  eventDate: z.preprocess((value) => new Date(String(value)), z.date()),
  time: optionalString,
  location: optionalString,
  bannerImage: optionalString,
  registrationLink: z.string().url().optional().or(z.literal("")),
});

export const programSchema = z.object({
  title: z.string().trim().min(3),
  slug: z.string().trim().min(3),
  scheduleDay: z.string().trim().min(2),
  scheduleTime: z.string().trim().min(2),
  location: optionalString,
  description: optionalString,
  isActive: z.boolean().default(true),
});

export const gallerySchema = z.object({
  title: z.string().trim().min(3),
  slug: z.string().trim().min(3),
  description: optionalString,
  coverImage: optionalString,
  images: imageList,
});