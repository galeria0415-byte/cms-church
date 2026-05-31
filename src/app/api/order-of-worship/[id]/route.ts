import { NextResponse } from "next/server";

import { requireRole } from "@/lib/auth";
import { parseOrderOfWorshipDocument } from "@/lib/order-of-worship";
import { CONTENT_MANAGER_ROLES, DASHBOARD_ROLES } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { orderOfWorshipSchema } from "@/lib/validators/order-of-worship";

type Params = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: Params) {
  await requireRole(DASHBOARD_ROLES);
  const { id } = await params;

  const order = await prisma.orderOfWorship.findUnique({ where: { id } });

  if (!order) {
    return NextResponse.json({ error: "Order of worship not found." }, { status: 404 });
  }

  return NextResponse.json({
    order: {
      ...order,
      content: parseOrderOfWorshipDocument(order.content),
    },
  });
}

export async function PUT(request: Request, { params }: Params) {
  const session = await requireRole(CONTENT_MANAGER_ROLES);
  const { id } = await params;
  const parsed = orderOfWorshipSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid order of worship data." }, { status: 400 });
  }

  try {
    const order = await prisma.orderOfWorship.update({
      where: { id },
      data: {
        title: parsed.data.title,
        slug: parsed.data.slug,
        worshipDate: parsed.data.worshipDate,
        serviceTime: parsed.data.serviceTime,
        status: parsed.data.status,
        content: JSON.stringify(parsed.data.content),
      },
    });

    await prisma.activityLog.create({
      data: {
        action: "update",
        entityType: "order_of_worship",
        entityId: order.id,
        summary: `Updated order of worship ${order.title}`,
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

    if (code === "P2025") {
      return NextResponse.json({ error: "Order of worship not found." }, { status: 404 });
    }

    if (code === "P2002") {
      return NextResponse.json({ error: "An order of worship with that slug already exists." }, { status: 409 });
    }

    return NextResponse.json({ error: "Failed to update order of worship." }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: Params) {
  const session = await requireRole(CONTENT_MANAGER_ROLES);
  const { id } = await params;

  try {
    const order = await prisma.orderOfWorship.delete({ where: { id } });

    await prisma.activityLog.create({
      data: {
        action: "delete",
        entityType: "order_of_worship",
        entityId: order.id,
        summary: `Deleted order of worship ${order.title}`,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ order });
  } catch (error: unknown) {
    const code = (error as { code?: string }).code;

    if (code === "P2025") {
      return NextResponse.json({ error: "Order of worship not found." }, { status: 404 });
    }

    return NextResponse.json({ error: "Failed to delete order of worship." }, { status: 500 });
  }
}