import { getSiteSettings } from "@/lib/site-settings";

export default async function Loading() {
  const settings = await getSiteSettings();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[var(--background)] px-6">
      {settings.logoUrl ? (
        <img
          src={settings.logoUrl}
          alt={settings.name}
          className="h-16 max-w-[200px] object-contain"
        />
      ) : (
        <p className="font-serif text-3xl text-[var(--ink)]">{settings.name}</p>
      )}
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--accent)] [animation-delay:-0.3s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--accent)] [animation-delay:-0.15s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--accent)]" />
      </div>
      <p className="text-sm text-[var(--muted)]">Loading&hellip;</p>
    </main>
  );
}
