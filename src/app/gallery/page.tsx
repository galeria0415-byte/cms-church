import Image from "next/image";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Card } from "@/components/ui/card";
import { getSafeGalleries } from "@/lib/public-content";

export const dynamic = "force-dynamic";

export default async function GalleryPublicPage() {
  const galleries = await getSafeGalleries();

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <SiteHeader />
      <main className="mx-auto max-w-7xl space-y-8 px-6 py-16 lg:px-10">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">Gallery</p>
          <h1 className="mt-2 font-serif text-5xl text-[var(--ink)]">Moments from worship, community life, and celebrations.</h1>
        </div>
        <div className="grid gap-6">
          {galleries.map((gallery) => (
            <Card key={gallery.id}>
              <h2 className="font-serif text-3xl text-[var(--ink)]">{gallery.title}</h2>
              <p className="mt-2 text-sm text-[var(--muted)]">{gallery.description ?? "Church moments and ministry highlights."}</p>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {gallery.images.map((image) => (
                  <div key={image.id} className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-[var(--mist)]">
                    <Image src={image.imageUrl} alt={image.caption ?? gallery.title} fill className="object-cover" />
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}