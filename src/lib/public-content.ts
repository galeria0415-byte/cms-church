import { prisma } from "@/lib/prisma";
import { getHomepageData, getUpcomingEventsWindow } from "@/lib/dashboard";

function logPublicDataError(scope: string, error: unknown) {
  console.error(`[public-content] ${scope} failed`, error);
}

export async function getSafeHomepageData() {
  try {
    return await getHomepageData();
  } catch (error) {
    logPublicDataError("homepage", error);

    return {
      latestPosts: [],
      featuredAnnouncements: [],
      events: [],
      programs: [],
      galleries: [],
    };
  }
}

export async function getSafePublishedPosts() {
  try {
    return await prisma.post.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ publishDate: "desc" }, { createdAt: "desc" }],
      take: 12,
    });
  } catch (error) {
    logPublicDataError("updates", error);
    return [];
  }
}

export async function getSafeGalleries() {
  try {
    return await prisma.gallery.findMany({
      include: { images: { orderBy: { sortOrder: "asc" } } },
      orderBy: { createdAt: "desc" },
      take: 12,
    });
  } catch (error) {
    logPublicDataError("gallery", error);
    return [];
  }
}

export async function getSafePrograms() {
  try {
    return await prisma.program.findMany({
      where: { isActive: true },
      orderBy: [{ scheduleDay: "asc" }, { scheduleTime: "asc" }],
    });
  } catch (error) {
    logPublicDataError("programs", error);
    return [];
  }
}

export async function getSafeUpcomingEvents() {
  try {
    return await getUpcomingEventsWindow();
  } catch (error) {
    logPublicDataError("events", error);
    return [];
  }
}