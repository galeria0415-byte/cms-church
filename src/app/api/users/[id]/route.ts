import { UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ADMIN_ONLY = [UserRole.ADMIN];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireRole(ADMIN_ONLY);
  const { id } = await params;
  const body = await request.json();
  const { name, email, password, role } = body as {
    name?: string;
    email?: string;
    password?: string;
    role?: string;
  };

  if (!email || !role) {
    return NextResponse.json({ error: "Email and role are required." }, { status: 400 });
  }

  if (!Object.values(UserRole).includes(role as UserRole)) {
    return NextResponse.json({ error: "Invalid role." }, { status: 400 });
  }

  // Prevent admin from demoting themselves
  if (id === session.user.id && role !== UserRole.ADMIN) {
    return NextResponse.json({ error: "You cannot change your own role." }, { status: 403 });
  }

  const duplicate = await prisma.user.findFirst({ where: { email, NOT: { id } } });
  if (duplicate) {
    return NextResponse.json({ error: "A user with this email already exists." }, { status: 409 });
  }

  const data: Record<string, unknown> = { name: name ?? null, email, role };

  if (password) {
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }
    data.passwordHash = await bcrypt.hash(password, 12);
  }

  const user = await prisma.user.update({
    where: { id },
    data,
    select: { id: true, name: true, email: true, role: true },
  });

  return NextResponse.json({ user });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireRole(ADMIN_ONLY);
  const { id } = await params;

  if (id === session.user.id) {
    return NextResponse.json({ error: "You cannot delete your own account." }, { status: 403 });
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
