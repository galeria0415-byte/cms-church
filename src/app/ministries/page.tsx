import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Card } from "@/components/ui/card";
import { ministryHighlights } from "@/lib/site";

export default async function MinistriesPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <SiteHeader />
      <main className="mx-auto max-w-7xl space-y-8 px-6 py-16 lg:px-10">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">Ministries</p>
          <h1 className="mt-2 font-serif text-5xl text-[var(--ink)]">Serving across worship, discipleship, care, and outreach.</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {ministryHighlights.map((ministry) => (
            <Card key={ministry.name} className="h-full bg-white">
              <h2 className="font-serif text-3xl text-[var(--ink)]">{ministry.name}</h2>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{ministry.description}</p>
            </Card>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}