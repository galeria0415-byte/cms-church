import { OrderOfWorshipForm } from "@/components/forms/order-of-worship-form";
import { requireRole } from "@/lib/auth";
import { CONTENT_MANAGER_ROLES } from "@/lib/permissions";

export default async function NewOrderOfWorshipPage() {
  await requireRole(CONTENT_MANAGER_ROLES);

  return (
    <div className="space-y-4">
      <OrderOfWorshipForm />
    </div>
  );
}