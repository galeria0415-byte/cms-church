import Link from "next/link";

import { ContentStatus } from "@prisma/client";

import { buttonStyles } from "@/components/ui/button";
import { DeleteButton } from "@/components/ui/delete-button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { requireRole } from "@/lib/auth";
import { CONTENT_MANAGER_ROLES } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function OrderOfWorshipPage() {
  await requireRole(CONTENT_MANAGER_ROLES);
  const orders = await prisma.orderOfWorship.findMany({ orderBy: [{ worshipDate: "desc" }, { createdAt: "desc" }] });

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">Liturgy</p>
          <h1 className="mt-2 text-xl font-semibold text-[var(--ink)]">Order of Worship Maker and Presenter</h1>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--muted)]">Create service bulletins with reusable sections, then preview, print, and present them section by section during worship.</p>
        </div>
        <Link href="/admin/order-of-worship/new" className={buttonStyles({ className: "no-underline" })}>
          New order of worship
        </Link>
      </div>

      {orders.length === 0 ? (
        <EmptyState title="No order of worship yet" message="Create your first worship bulletin and presentation flow." />
      ) : (
        <Card>
          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order.id} className="flex flex-col gap-3 rounded-2xl border border-[var(--line)] px-4 py-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-[var(--ink)]">{order.title}</p>
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${order.status === ContentStatus.PUBLISHED ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{order.status}</span>
                  </div>
                  <p className="mt-1 text-sm text-[var(--muted)]">{formatDate(order.worshipDate)} {order.serviceTime ? `• ${order.serviceTime}` : ""}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[var(--muted)]">/{order.slug}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/admin/order-of-worship/${order.id}`} className={buttonStyles({ variant: "secondary", size: "sm", className: "no-underline" })}>Preview</Link>
                  <Link href={`/present/order-of-worship/${order.id}`} className={buttonStyles({ variant: "secondary", size: "sm", className: "no-underline" })}>Present</Link>
                  <Link href={`/print/order-of-worship/${order.id}`} className={buttonStyles({ variant: "secondary", size: "sm", className: "no-underline" })}>Print</Link>
                  <Link href={`/admin/order-of-worship/${order.id}/edit`} className={buttonStyles({ variant: "secondary", size: "sm", className: "no-underline" })}>Edit</Link>
                  <DeleteButton apiPath={`/api/order-of-worship/${order.id}`} label="Delete" confirmMessage={`Delete order of worship \"${order.title}\"? This cannot be undone.`} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}