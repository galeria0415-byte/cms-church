import Link from "next/link";

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
          className="inline-block rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
