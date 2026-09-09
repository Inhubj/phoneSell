import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyOrderEvent } from "@/lib/notifications";
import { ORDER_STATUSES } from "@/lib/constants";
import { recordStatusChange } from "@/lib/analytics";

export async function GET() {
  const auth = await requireStaff();
  if (!auth?.executive) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const orders = await prisma.order.findMany({
    where: {
      assignment: { executiveId: auth.executive.id },
    },
    include: {
      customer: true,
      device: { include: { brand: true } },
      variant: true,
      address: true,
      pickupSlot: true,
    },
    orderBy: { pickupDate: "asc" },
  });
  return NextResponse.json({ orders, today: start.toISOString() });
}

export async function PATCH(req: Request) {
  const auth = await requireStaff();
  if (!auth?.executive) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const assignment = await prisma.executiveAssignment.findFirst({
    where: { orderId: body.orderId, executiveId: auth.executive.id },
  });
  if (!assignment) return NextResponse.json({ error: "Not assigned" }, { status: 403 });
  const existing = await prisma.order.findUnique({ where: { id: body.orderId } });
  if (body.status && ORDER_STATUSES.includes(body.status)) {
    const order = await prisma.order.update({
      where: { id: body.orderId },
      data: {
        status: body.status,
        ...(body.pickupStatus ? { pickupStatus: body.pickupStatus } : {}),
      },
      include: { customer: true, pickupSlot: true, assignment: { include: { executive: true } } },
    });
    await recordStatusChange({
      orderId: body.orderId,
      oldStatus: existing?.status || "",
      newStatus: body.status,
      changedBy: `executive:${auth.executive.id}`,
      notes: body.pickupStatus,
    });
    if (body.status === "EXECUTIVE_ON_THE_WAY") await notifyOrderEvent("EXECUTIVE_ARRIVING", order);
    if (body.status === "DEVICE_COLLECTED") await notifyOrderEvent("DEVICE_COLLECTED", order);
  }
  return NextResponse.json({ ok: true });
}
