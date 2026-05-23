import Link from "next/link";

import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { prisma } from "@/lib/prisma";

export default async function ProgramsPage() {
  const programs = await prisma.program.findMany({ orderBy: [{ scheduleDay: "asc" }, { scheduleTime: "asc" }] });

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">CMS</p>
          <h1 className="mt-2 text-xl font-semibold text-[var(--ink)]">Programs and schedules</h1>
        </div>
        <Link href="/admin/programs/new" className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white">
          New program
        </Link>
      </div>
      {programs.length === 0 ? (
        <EmptyState title="No programs yet" message="Create a program to show service or ministry schedules." />
      ) : (
        <Card>
          <div className="space-y-3">
            {programs.map((program) => (
              <div key={program.id} className="flex flex-col gap-2 rounded-2xl border border-[var(--line)] px-4 py-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold text-[var(--ink)]">{program.title}</p>
                  <p className="text-sm text-[var(--muted)]">{program.scheduleDay} • {program.scheduleTime} • {program.location ?? "Location TBD"}</p>
                </div>
                <Link href={`/admin/programs/${program.id}/edit`} className="text-sm font-semibold text-[var(--accent)]">Edit</Link>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}