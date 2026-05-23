import { Card } from "@/components/ui/card";

export function StatCard({ label, value, hint }: { label: string; value: string | number; hint: string }) {
  return (
    <Card className="bg-white">
      <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">{label}</p>
      <p className="mt-3 font-serif text-4xl text-[var(--ink)]">{value}</p>
      <p className="mt-3 text-sm text-[var(--muted)]">{hint}</p>
    </Card>
  );
}