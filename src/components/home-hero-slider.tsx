import { HeroSlider } from "@/components/hero-slider";
import { prisma } from "@/lib/prisma";

export default async function HomeHeroSlider() {
  let slides: Awaited<ReturnType<typeof prisma.slide.findMany>> = [];
  try {
    slides = await prisma.slide.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
  } catch {
    return null;
  }
  if (slides.length === 0) return null;
  return <HeroSlider slides={slides} />;
}
