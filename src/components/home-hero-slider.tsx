import { HeroSlider } from "@/components/hero-slider";

export default async function HomeHeroSlider() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/api/slides`, { cache: "no-store" });
  const { slides } = await res.json();
  if (!slides || slides.length === 0) return null;
  return <HeroSlider slides={slides} />;
}
