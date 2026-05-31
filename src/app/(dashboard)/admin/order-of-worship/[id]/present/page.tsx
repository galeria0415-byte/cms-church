import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { DASHBOARD_ROLES } from "@/lib/permissions";

type Params = Promise<{ id: string }>;

export default async function OrderOfWorshipPresentPage({ params }: { params: Params }) {
  await requireRole(DASHBOARD_ROLES);
  const { id } = await params;
  redirect(`/present/order-of-worship/${id}`);
}