import Link from "next/link";
import { notFound } from "next/navigation";

import { OrderOfWorshipDocumentView } from "@/components/order-of-worship/order-of-worship-document";
import { requireRole } from "@/lib/auth";
import { getOrderOfWorshipRecord } from "@/lib/order-of-worship-record";
import { DASHBOARD_ROLES } from "@/lib/permissions";
import { formatDate } from "@/lib/utils";

type Params = Promise<{ id: string }>;

function ActionLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <Link href={href} className="inline-flex items-center justify-center rounded-full border border-[var(--line)] px-4 py-2 text-sm font-medium text-[var(--ink)] transition hover:bg-[var(--sand)]">{children}</Link>;
}

export default async function OrderOfWorshipPreviewPage({ params }: { params: Params }) {
  await requireRole(DASHBOARD_ROLES);
  const { id } = await params;
  const order = await getOrderOfWorshipRecord(id);

  if (!order) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[32px] bg-[linear-gradient(135deg,_#f2e6d2_0%,_#fbf7ef_60%,_#e3d2ba_100%)] px-6 py-8 shadow-[0_30px_80px_-45px_rgba(80,62,44,0.45)] lg:flex-row lg:items-end lg:justify-between lg:px-8">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">Preview</p>
          <h1 className="mt-3 text-2xl font-semibold text-[var(--ink)]">{order.title}</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">{formatDate(order.worshipDate)} {order.serviceTime ? `• ${order.serviceTime}` : ""}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <ActionLink href={`/admin/order-of-worship/${order.id}/edit`}>Edit</ActionLink>
          <ActionLink href={`/admin/order-of-worship/${order.id}/present`}>Present</ActionLink>
          <ActionLink href={`/print/order-of-worship/${order.id}`}>Print</ActionLink>
        </div>
      </div>

      <OrderOfWorshipDocumentView title={order.title} document={order.content} />
    </div>
  );
}