"use client";

import { useEffect } from "react";

import { buttonStyles } from "@/components/ui/button";

// Catches errors thrown from the root layout itself
export default function GlobalError({
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
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="max-w-md space-y-4 px-6 text-center">
          <h1 className="text-4xl font-bold text-gray-900">Something went wrong</h1>
          <p className="text-gray-600">
            The application encountered an unexpected error. Please try again.
          </p>
          {error.digest && (
            <p className="font-mono text-xs text-gray-400">Error ID: {error.digest}</p>
          )}
          <button
            onClick={reset}
            className={buttonStyles({ className: "bg-[linear-gradient(180deg,#2563eb,#1d4ed8)]" })}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
