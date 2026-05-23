import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Card } from "@/components/ui/card";
import { getSiteSettings } from "@/lib/site-settings";

export default async function ContactPage() {
  const settings = await getSiteSettings();

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <SiteHeader />
      <main className="mx-auto max-w-5xl space-y-6 px-6 py-16 lg:px-10">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">Contact</p>
          <h1 className="mt-2 font-serif text-5xl text-[var(--ink)]">Visit, reach out, or request prayer.</h1>
        </div>
        <Card>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">Church office</p>
              <p className="mt-3 text-base text-[var(--ink)]">{settings.address}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">Phone and email</p>
              <p className="mt-3 text-base text-[var(--ink)]">{settings.phone}</p>
              <p className="text-base text-[var(--ink)]">{settings.email}</p>
            </div>
          </div>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
}