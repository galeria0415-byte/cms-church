import { Suspense } from "react";

import { BibleReader } from "@/components/bible/bible-reader";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Bible",
};

export default async function BiblePage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-12 lg:px-10">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">Holy Bible</p>
          <h1 className="mt-2 font-serif text-4xl text-[var(--ink)]">Read the Bible</h1>
        </div>
        <Suspense
          fallback={
            <div className="flex justify-center gap-2 py-24">
              <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-[var(--accent)] [animation-delay:-0.3s]" />
              <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-[var(--accent)] [animation-delay:-0.15s]" />
              <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-[var(--accent)]" />
            </div>
          }
        >
          <BibleReader />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  );
}
