import { notFound } from "next/navigation";

import { OrderOfWorshipPresenter } from "@/components/order-of-worship/order-of-worship-presenter";
import { requireRole } from "@/lib/auth";
import { getOrderOfWorshipRecord } from "@/lib/order-of-worship-record";
import { DASHBOARD_ROLES } from "@/lib/permissions";
import { formatDateInput } from "@/lib/utils";

type Params = Promise<{ id: string }>;

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function buildPresenterServiceDateText(worshipDate: Date | null, serviceTime: string | null): string {
  if (!worshipDate) return "";
  const dateStr = formatDateInput(worshipDate); // Manila-safe "yyyy-MM-dd"
  const [yearStr, monthStr, dayStr] = dateStr.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);
  if (!Number.isFinite(day) || !Number.isFinite(month) || !Number.isFinite(year)) return "";
  const formattedDate = `${day} ${MONTH_NAMES[month - 1] ?? ""} ${year}`.trim();
  return serviceTime?.trim() ? `${formattedDate}, ${serviceTime.trim()}` : formattedDate;
}

export default async function DedicatedOrderOfWorshipPresentPage({ params }: { params: Params }) {
  await requireRole(DASHBOARD_ROLES);
  const { id } = await params;
  const order = await getOrderOfWorshipRecord(id);

  if (!order) {
    notFound();
  }

  const worshipDateStr = order.worshipDate ? formatDateInput(order.worshipDate) : null;
  const serviceDateText = buildPresenterServiceDateText(order.worshipDate, order.serviceTime);

  const document = {
    ...order.content,
    header: {
      ...order.content.header,
      serviceDateText: serviceDateText || order.content.header.serviceDateText,
    },
  };

  return <OrderOfWorshipPresenter title={order.title} document={document} referenceDate={worshipDateStr} />;
}