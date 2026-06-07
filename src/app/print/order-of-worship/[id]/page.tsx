import { notFound } from "next/navigation";

import { OrderOfWorshipDocumentView } from "@/components/order-of-worship/order-of-worship-document";
import { PrintToolbar } from "@/components/print/print-toolbar";
import { requireRole } from "@/lib/auth";
import { getOrderOfWorshipRecord } from "@/lib/order-of-worship-record";
import { DASHBOARD_ROLES } from "@/lib/permissions";
import { formatDateInput } from "@/lib/utils";

type Params = Promise<{ id: string }>;

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function buildServiceDateText(worshipDate: Date | null, serviceTime: string | null): string {
  if (!worshipDate) return "";
  const dateStr = formatDateInput(worshipDate);
  const [yearStr, monthStr, dayStr] = dateStr.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);
  if (!Number.isFinite(day) || !Number.isFinite(month) || !Number.isFinite(year)) return "";
  const formattedDate = `${day} ${MONTH_NAMES[month - 1] ?? ""} ${year}`.trim();
  return serviceTime?.trim() ? `${formattedDate}, ${serviceTime.trim()}` : formattedDate;
}

export default async function PrintOrderOfWorshipPage({ params }: { params: Params }) {
  await requireRole(DASHBOARD_ROLES);
  const { id } = await params;
  const order = await getOrderOfWorshipRecord(id);

  if (!order) {
    notFound();
  }

  const serviceDateText = buildServiceDateText(order.worshipDate, order.serviceTime);
  const document = {
    ...order.content,
    header: {
      ...order.content.header,
      serviceDateText: serviceDateText || order.content.header.serviceDateText,
    },
  };

  return (
    <div className="mx-auto max-w-[11in] px-4 py-6 print:max-w-none print:px-0 print:py-0">
      <style>{`@page { size: letter landscape; margin: 0.35in; }`}</style>
      <PrintToolbar />
      <OrderOfWorshipDocumentView title={order.title} document={document} className="print:w-[10.3in] print:rounded-none print:border-0 print:shadow-none" printCompact />
    </div>
  );
}