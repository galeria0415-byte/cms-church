import { notFound } from "next/navigation";

import { OrderOfWorshipForm, mapOrderOfWorshipToForm } from "@/components/forms/order-of-worship-form";
import { requireRole } from "@/lib/auth";
import { getOrderOfWorshipRecord } from "@/lib/order-of-worship-record";
import { CONTENT_MANAGER_ROLES } from "@/lib/permissions";

type Params = Promise<{ id: string }>;

export default async function EditOrderOfWorshipPage({ params }: { params: Params }) {
  await requireRole(CONTENT_MANAGER_ROLES);
  const { id } = await params;
  const order = await getOrderOfWorshipRecord(id);

  if (!order) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <OrderOfWorshipForm initialData={mapOrderOfWorshipToForm(order)} />
    </div>
  );
}