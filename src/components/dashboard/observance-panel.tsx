import { Cake, HeartHandshake, Landmark } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import type { ObservanceItem } from "@/lib/dashboard";
import { formatDate } from "@/lib/utils";

const iconMap = {
  birthday: Cake,
  wedding: HeartHandshake,
  memorial: Landmark,
};

const labelMap = {
  birthday: "Upcoming birthday",
  wedding: "Wedding Anniversary",
  memorial: "Death Anniversary",
};

export function ObservancePanel({ observances, title = "Today at a glance" }: { observances: ObservanceItem[]; title?: string }) {
  if (observances.length === 0) {
    return <EmptyState title={title} message="No upcoming birthdays were found in the next two weeks." />;
  }

  return (
    <Card>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">Reminders</p>
          <h3 className="mt-2 font-serif text-2xl text-[var(--ink)]">{title}</h3>
        </div>
        <Badge>{observances.length} items</Badge>
      </div>
      <div className="mt-6 space-y-3">
        {observances.map((item) => {
          const Icon = iconMap[item.type];

          return (
            <div key={item.id} className="flex items-center gap-4 rounded-3xl border border-[var(--line)] bg-[var(--mist)] px-4 py-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[var(--accent)]">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-[var(--ink)]">{item.memberName}</p>
                <p className="text-sm text-[var(--muted)]">{labelMap[item.type]}</p>
              </div>
              <p className="text-sm font-medium text-[var(--accent-strong)]">{formatDate(item.date, "MMM d")}</p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}