import type { ContentStatus } from "@prisma/client";

import type { OrderOfWorshipDocument } from "@/lib/order-of-worship";
import { formatDateInput } from "@/lib/utils";

export type OrderOfWorshipFormValues = {
  id?: string;
  title: string;
  slug: string;
  worshipDate: string;
  serviceTime: string;
  status: ContentStatus;
  content: OrderOfWorshipDocument;
};

export function mapOrderOfWorshipToForm(order: {
  id: string;
  title: string;
  slug: string;
  worshipDate: Date | null;
  serviceTime: string | null;
  status: ContentStatus;
  content: OrderOfWorshipDocument;
}): OrderOfWorshipFormValues {
  return {
    id: order.id,
    title: order.title,
    slug: order.slug,
    worshipDate: formatDateInput(order.worshipDate),
    serviceTime: order.serviceTime ?? "",
    status: order.status,
    content: order.content,
  };
}