"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
      <div className="max-w-md space-y-4 px-6 text-center">
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">Something went wrong</p>
        <h1 className="font-serif text-4xl text-[var(--ink)]">This page hit a problem.</h1>
        <p className="text-sm leading-7 text-[var(--muted)]">
          We couldn&apos;t load this page right now. Please try again, or contact your administrator if the issue keeps happening.
        </p>
        {error.digest && (
          <p className="font-mono text-xs text-[var(--muted)]">Error ID: {error.digest}</p>
        )}
        <button
          onClick={reset}
          className="rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
