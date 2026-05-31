import { prisma } from "@/lib/prisma";
import type { OrderOfWorshipDocument } from "@/lib/order-of-worship";
import { parseOrderOfWorshipDocument } from "@/lib/order-of-worship";

export type OrderOfWorshipRecord = {
  id: string;
  title: string;
  slug: string;
  worshipDate: Date | null;
  serviceTime: string | null;
  status: "DRAFT" | "PUBLISHED";
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  content: OrderOfWorshipDocument;
};

export async function getOrderOfWorshipRecord(id: string): Promise<OrderOfWorshipRecord | null> {
  const order = await prisma.orderOfWorship.findUnique({ where: { id } });

  if (!order) {
    return null;
  }

  return {
    ...order,
    status: order.status,
    content: parseOrderOfWorshipDocument(order.content),
  };
}