import { notFound } from "next/navigation";

import { OrderOfWorshipDocumentView } from "@/components/order-of-worship/order-of-worship-document";
import { PrintToolbar } from "@/components/print/print-toolbar";
import { requireRole } from "@/lib/auth";
import { getOrderOfWorshipRecord } from "@/lib/order-of-worship-record";
import { DASHBOARD_ROLES } from "@/lib/permissions";

type Params = Promise<{ id: string }>;

export default async function PrintOrderOfWorshipPage({ params }: { params: Params }) {
  await requireRole(DASHBOARD_ROLES);
  const { id } = await params;
  const order = await getOrderOfWorshipRecord(id);

  if (!order) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-[11in] px-4 py-6 print:max-w-none print:px-0 print:py-0">
      <style>{`@page { size: letter landscape; margin: 0.35in; }`}</style>
      <PrintToolbar />
      <OrderOfWorshipDocumentView title={order.title} document={order.content} className="print:w-[10.3in] print:rounded-none print:border-0 print:shadow-none" printCompact />
    </div>
  );
}