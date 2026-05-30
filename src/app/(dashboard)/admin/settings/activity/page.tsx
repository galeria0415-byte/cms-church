import { connection } from "next/server";

import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function ActivityLogPage() {
  await connection();

  const activityFeed = await prisma.activityLog
    .findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { user: { select: { name: true, email: true } } },
    })
    .catch(() => []);

  return (
    <Card>
      <div className="space-y-3">
        {activityFeed.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">No activity has been recorded yet.</p>
        ) : (
          activityFeed.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between gap-4 rounded-2xl border border-[var(--line)] px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium text-[var(--ink)]">{entry.summary}</p>
                <p className="text-xs text-[var(--muted)]">
                  {entry.user?.name ?? entry.user?.email ?? "System"}
                </p>
              </div>
              <p className="shrink-0 text-xs text-[var(--muted)]">
                {formatDate(entry.createdAt, "MMM d, h:mm a")}
              </p>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
