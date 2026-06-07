import { notFound } from "next/navigation";

import { OrderOfWorshipPresenter } from "@/components/order-of-worship/order-of-worship-presenter";
import { requireRole } from "@/lib/auth";
import { getOrderOfWorshipRecord } from "@/lib/order-of-worship-record";
import { DASHBOARD_ROLES } from "@/lib/permissions";
import { formatDateInput } from "@/lib/utils";

type Params = Promise<{ id: string }>;

export default async function DedicatedOrderOfWorshipPresentPage({ params }: { params: Params }) {
  await requireRole(DASHBOARD_ROLES);
  const { id } = await params;
  const order = await getOrderOfWorshipRecord(id);

  if (!order) {
    notFound();
  }

  return <OrderOfWorshipPresenter title={order.title} document={order.content} referenceDate={order.worshipDate ? formatDateInput(order.worshipDate) : null} />;
}