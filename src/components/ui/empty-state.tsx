import { Card } from "@/components/ui/card";

export function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <Card className="border-dashed bg-[var(--mist)] text-center">
      <h3 className="text-lg font-semibold text-[var(--ink)]">{title}</h3>
      <p className="mt-2 text-sm text-[var(--muted)]">{message}</p>
    </Card>
  );
}