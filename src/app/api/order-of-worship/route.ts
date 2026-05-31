import { NextResponse } from "next/server";

import { requireRole } from "@/lib/auth";
import { parseOrderOfWorshipDocument } from "@/lib/order-of-worship";
import { CONTENT_MANAGER_ROLES } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { orderOfWorshipSchema } from "@/lib/validators/order-of-worship";

export async function POST(request: Request) {
  const session = await requireRole(CONTENT_MANAGER_ROLES);
  const parsed = orderOfWorshipSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid order of worship data." }, { status: 400 });
  }

  try {
    const order = await prisma.orderOfWorship.create({
      data: {
        title: parsed.data.title,
        slug: parsed.data.slug,
        worshipDate: parsed.data.worshipDate,
        serviceTime: parsed.data.serviceTime,
        status: parsed.data.status,
        content: JSON.stringify(parsed.data.content),
        createdById: session.user.id,
      },
    });

    await prisma.activityLog.create({
      data: {
        action: "create",
        entityType: "order_of_worship",
        entityId: order.id,
        summary: `Created order of worship ${order.title}`,
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      order: {
        ...order,
        content: parseOrderOfWorshipDocument(order.content),
      },
    });
  } catch (error: unknown) {
    const code = (error as { code?: string }).code;

    if (code === "P2002") {
      return NextResponse.json({ error: "An order of worship with that slug already exists." }, { status: 409 });
    }

    return NextResponse.json({ error: "Failed to create order of worship." }, { status: 500 });
  }
}