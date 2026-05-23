export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] px-6">
      <div className="rounded-[28px] border border-[var(--line)] bg-white px-8 py-6 text-center shadow-[0_20px_80px_-40px_rgba(80,62,44,0.35)]">
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">Loading</p>
        <h1 className="mt-3 font-serif text-3xl text-[var(--ink)]">Preparing church data...</h1>
      </div>
    </main>
  );
}