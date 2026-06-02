import { addDays, endOfDay, isSameDay, startOfDay } from "date-fns";

import { prisma } from "@/lib/prisma";
import { fullName } from "@/lib/utils";

export type ObservanceType = "birthday" | "wedding" | "memorial";

export type ObservanceItem = {
  id: string;
  memberName: string;
  date: Date;
  type: ObservanceType;
};

const MANILA_TIME_ZONE = "Asia/Manila";

function getManilaMonthDay(date: Date) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: MANILA_TIME_ZONE,
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(date);
  const month = Number(parts.find((part) => part.type === "month")?.value ?? date.getMonth() + 1);
  const day = Number(parts.find((part) => part.type === "day")?.value ?? date.getDate());

  return { month, day };
}

function getNextOccurrence(date: Date, today: Date) {
  const { month, day } = getManilaMonthDay(date);
  const occurrence = new Date(today.getFullYear(), month - 1, day);
  if (occurrence < startOfDay(today)) {
    occurrence.setFullYear(occurrence.getFullYear() + 1);
  }

  return occurrence;
}

export async function getUpcomingBirthdayObservances() {
  const today = new Date();
  const endDate = endOfDay(addDays(today, 13));
  const members = await prisma.member.findMany({
    where: {
      isArchived: false,
      birthDate: { not: null },
    },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });

  const observances: ObservanceItem[] = [];

  for (const member of members) {
    if (member.birthDate) {
      const nextBirthday = getNextOccurrence(member.birthDate, today);

      if (nextBirthday >= startOfDay(today) && nextBirthday <= endDate) {
        observances.push({
          id: `${member.id}-birthday`,
          memberName: fullName(member),
          date: nextBirthday,
          type: "birthday",
        });
      }
    }
  }

  return observances.sort((left, right) => left.date.getTime() - right.date.getTime());
}

export async function getDashboardSummary() {
  const [memberCount, activeMembers, posts, upcomingEvents, programs, observances] = await Promise.all([
    prisma.member.count(),
    prisma.member.count({ where: { isArchived: false } }),
    prisma.post.count(),
    prisma.event.count({ where: { eventDate: { gte: startOfDay(new Date()) } } }),
    prisma.program.count({ where: { isActive: true } }),
    getUpcomingBirthdayObservances(),
  ]);

  return {
    memberCount,
    activeMembers,
    posts,
    upcomingEvents,
    programs,
    observances,
  };
}

export async function getHomepageData() {
  const [latestPosts, featuredAnnouncements, events, programs, galleries] = await Promise.all([
    prisma.post.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ publishDate: "desc" }, { createdAt: "desc" }],
      take: 3,
    }),
    prisma.post.findMany({
      where: { status: "PUBLISHED", isFeatured: true },
      orderBy: [{ publishDate: "desc" }],
      take: 3,
    }),
    prisma.event.findMany({
      where: { eventDate: { gte: startOfDay(new Date()) } },
      orderBy: { eventDate: "asc" },
      take: 4,
    }),
    prisma.program.findMany({ where: { isActive: true }, orderBy: [{ scheduleDay: "asc" }, { scheduleTime: "asc" }] }),
    prisma.gallery.findMany({ orderBy: { createdAt: "desc" }, include: { images: true }, take: 4 }),
  ]);

  return {
    latestPosts,
    featuredAnnouncements,
    events,
    programs,
    galleries,
  };
}

export async function getActivityFeed(limit = 8) {
  return prisma.activityLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { user: { select: { name: true, email: true } } },
  });
}

export async function getUpcomingEventsWindow() {
  return prisma.event.findMany({
    where: {
      eventDate: {
        gte: startOfDay(new Date()),
        lte: endOfDay(new Date(Date.now() + 1000 * 60 * 60 * 24 * 90)),
      },
    },
    orderBy: { eventDate: "asc" },
  });
}

export function hasObservanceOnDate(observances: ObservanceItem[], date: Date) {
  return observances.some((item) => isSameDay(item.date, date));
}