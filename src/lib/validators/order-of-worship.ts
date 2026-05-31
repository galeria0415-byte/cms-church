import { ContentStatus } from "@prisma/client";
import { z } from "zod";

import { WORSHIP_SECTION_TYPES, WORSHIP_SPEAKERS } from "@/lib/order-of-worship";

const optionalString = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined));

const responsiveLineSchema = z.object({
  id: z.string().min(1),
  speaker: z.enum(WORSHIP_SPEAKERS),
  customSpeaker: optionalString,
  text: z.string().trim().min(1),
});

const hymnPartSchema = z.object({
  id: z.string().min(1),
  label: z.string().trim().min(1),
  text: z.string().trim().min(1),
});

const listItemSchema = z.object({
  id: z.string().min(1),
  title: optionalString,
  text: z.string().trim().min(1),
});

const sectionBaseSchema = z.object({
  id: z.string().min(1),
  type: z.enum(WORSHIP_SECTION_TYPES),
  title: z.string().trim().min(1),
  stand: z.boolean().default(false),
  note: optionalString,
});

const textSectionSchema = sectionBaseSchema.extend({
  type: z.literal("TEXT"),
  body: z.string().trim().min(1),
});

const responsiveSectionSchema = sectionBaseSchema.extend({
  type: z.literal("RESPONSIVE"),
  lines: z.array(responsiveLineSchema).min(1),
});

const hymnSectionSchema = sectionBaseSchema.extend({
  type: z.literal("HYMN"),
  hymnSource: optionalString,
  songTitle: optionalString,
  parts: z.array(hymnPartSchema).min(1),
});

const listSectionSchema = sectionBaseSchema.extend({
  type: z.literal("LIST"),
  items: z.array(listItemSchema).min(1),
});

export const worshipDocumentSchema = z.object({
  header: z.object({
    leftLogoUrl: optionalString,
    rightLogoUrl: optionalString,
    centerLines: z.array(z.string().trim()).min(1),
    monthTheme: optionalString,
    orderTitle: optionalString,
    orderSubtitle: optionalString,
    sundayTheme: optionalString,
    serviceDateText: optionalString,
    participantLines: z.array(z.string().trim()),
  }),
  sections: z.array(z.discriminatedUnion("type", [textSectionSchema, responsiveSectionSchema, hymnSectionSchema, listSectionSchema])).min(1),
});

export const orderOfWorshipSchema = z.object({
  title: z.string().trim().min(3),
  slug: z.string().trim().min(3),
  worshipDate: z.preprocess((value) => {
    if (!value) {
      return undefined;
    }

    return new Date(String(value));
  }, z.date().optional()),
  serviceTime: optionalString,
  status: z.nativeEnum(ContentStatus).default(ContentStatus.DRAFT),
  content: worshipDocumentSchema,
});

export type OrderOfWorshipInput = z.input<typeof orderOfWorshipSchema>;
export type OrderOfWorshipValues = z.output<typeof orderOfWorshipSchema>;