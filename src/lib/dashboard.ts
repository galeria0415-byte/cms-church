import { endOfDay, isSameDay, startOfDay } from "date-fns";

import { prisma } from "@/lib/prisma";
import { fullName } from "@/lib/utils";

export type ObservanceType = "birthday" | "wedding" | "memorial";

export type ObservanceItem = {
  id: string;
  memberName: string;
  date: Date;
  type: ObservanceType;
};

function sameMonthDay(date: Date | null, today: Date) {
  if (!date) {
    return false;
  }

  return date.getMonth() === today.getMonth() && date.getDate() === today.getDate();
}

export async function getTodayObservances() {
  const today = new Date();
  const members = await prisma.member.findMany({
    where: {
      isArchived: false,
      OR: [{ birthDate: { not: null } }, { weddingDate: { not: null } }, { deceasedDate: { not: null } }],
    },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });

  const observances: ObservanceItem[] = [];

  for (const member of members) {
    if (sameMonthDay(member.birthDate, today)) {
      observances.push({
        id: `${member.id}-birthday`,
        memberName: fullName(member),
        date: member.birthDate as Date,
        type: "birthday",
      });
    }

    if (sameMonthDay(member.weddingDate, today)) {
      observances.push({
        id: `${member.id}-wedding`,
        memberName: fullName(member),
        date: member.weddingDate as Date,
        type: "wedding",
      });
    }

    if (sameMonthDay(member.deceasedDate, today)) {
      observances.push({
        id: `${member.id}-memorial`,
        memberName: fullName(member),
        date: member.deceasedDate as Date,
        type: "memorial",
      });
    }
  }

  return observances;
}

export async function getDashboardSummary() {
  const [memberCount, activeMembers, posts, upcomingEvents, programs, observances] = await Promise.all([
    prisma.member.count(),
    prisma.member.count({ where: { isArchived: false } }),
    prisma.post.count(),
    prisma.event.count({ where: { eventDate: { gte: startOfDay(new Date()) } } }),
    prisma.program.count({ where: { isActive: true } }),
    getTodayObservances(),
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

export async function getActivityFeed() {
  return prisma.activityLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 8,
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