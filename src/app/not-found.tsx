import Link from "next/link";

import { buttonStyles } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
      <div className="max-w-md space-y-4 px-6 text-center">
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">404</p>
        <h1 className="font-serif text-5xl text-[var(--ink)]">Page not found.</h1>
        <p className="text-sm leading-7 text-[var(--muted)]">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className={buttonStyles({ className: "no-underline" })}
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
