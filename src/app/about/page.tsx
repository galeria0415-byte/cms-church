import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Card } from "@/components/ui/card";

export default async function AboutPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <SiteHeader />
      <main className="mx-auto max-w-5xl space-y-6 px-6 py-16 lg:px-10">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">About the church</p>
          <h1 className="mt-2 font-serif text-5xl text-[var(--ink)]">A congregation shaped by worship, care, and service.</h1>
        </div>
        <Card>
          <p className="text-base leading-8 text-[var(--muted)]">Grace Harbor Church exists to form a rooted, prayerful, and outward-facing community. The website and CMS keep ministry information current while helping pastors and staff care for members well.</p>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
}