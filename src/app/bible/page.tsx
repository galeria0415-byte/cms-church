import { Suspense } from "react";

import { BibleReader } from "@/components/bible/bible-reader";
import { SiteHeader } from "@/components/layout/site-header";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Bible",
};

export default async function BiblePage() {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <SiteHeader />
      <div className="flex flex-1 overflow-hidden">
        <Suspense
          fallback={
            <div className="flex w-full items-center justify-center gap-2">
              <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-[var(--accent)] [animation-delay:-0.3s]" />
              <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-[var(--accent)] [animation-delay:-0.15s]" />
              <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-[var(--accent)]" />
            </div>
          }
        >
          <BibleReader />
        </Suspense>
      </div>
    </div>
  );
}
