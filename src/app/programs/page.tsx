import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Card } from "@/components/ui/card";
import { getSafePrograms } from "@/lib/public-content";

export const dynamic = "force-dynamic";

export default async function ProgramsPublicPage() {
  const programs = await getSafePrograms();

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <SiteHeader />
      <main className="mx-auto max-w-6xl space-y-8 px-6 py-16 lg:px-10">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">Programs</p>
          <h1 className="mt-2 font-serif text-5xl text-[var(--ink)]">Weekly services and ministry rhythms.</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {programs.map((program) => (
            <Card key={program.id}>
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">{program.scheduleDay}</p>
              <h2 className="mt-2 font-serif text-3xl text-[var(--ink)]">{program.title}</h2>
              <p className="mt-3 text-sm text-[var(--muted)]">{program.scheduleTime} • {program.location ?? "Main campus"}</p>
              <p className="mt-4 text-sm leading-7 text-[var(--muted)]">{program.description ?? "Regular worship and discipleship gathering."}</p>
            </Card>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}