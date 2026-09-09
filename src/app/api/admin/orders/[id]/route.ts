import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/orders";
import { notifyOrderEvent } from "@/lib/notifications";
import { ORDER_STATUSES } from "@/lib/constants";
import { clientIp } from "@/lib/security";
import { canAccess } from "@/lib/roles";
import { recordStatusChange } from "@/lib/analytics";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth || !canAccess(auth.session.role, "orders")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      customer: true,
      device: { include: { brand: true } },
      variant: true,
      address: true,
      pickupSlot: true,
      photos: true,
      items: true,
      assignment: { include: { executive: true } },
      inspection: true,
      payments: true,
      notifications: { orderBy: { createdAt: "desc" } },
      customDevice: true,
      statusHistory: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ order });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth || !canAccess(auth.session.role, "orders")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  const existing = await prisma.order.findUnique({
    where: { id },
    include: { customer: true, pickupSlot: true, assignment: { include: { executive: true } } },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const data: Record<string, unknown> = {};
  if (body.status && ORDER_STATUSES.includes(body.status)) data.status = body.status;
  if (body.pickupStatus) data.pickupStatus = body.pickupStatus;
  if (body.notes !== undefined) data.notes = body.notes;
  if (body.finalPrice !== undefined) data.finalPrice = Number(body.finalPrice);
  if (body.inspectionAdj !== undefined) data.inspectionAdj = Number(body.inspectionAdj);
  if (body.customerDecision !== undefined) data.customerDecision = body.customerDecision;
  if (body.paymentStatus) data.paymentStatus = body.paymentStatus;
  if (body.status === "PURCHASE_COMPLETED") data.completedAt = new Date();

  const order = await prisma.order.update({
    where: { id },
    data,
    include: { customer: true, pickupSlot: true, assignment: { include: { executive: true } } },
  });

  if (body.executiveId) {
    await prisma.executiveAssignment.upsert({
      where: { orderId: id },
      update: { executiveId: body.executiveId, assignedById: auth.user.id },
      create: { orderId: id, executiveId: body.executiveId, assignedById: auth.user.id },
    });
    await prisma.order.update({ where: { id }, data: { status: "PICKUP_ASSIGNED" } });
    const fresh = await prisma.order.findUnique({
      where: { id },
      include: { customer: true, pickupSlot: true, assignment: { include: { executive: true } } },
    });
    if (fresh) await notifyOrderEvent("EXECUTIVE_ASSIGNED", fresh);
  }

  if (body.status === "EXECUTIVE_ON_THE_WAY") await notifyOrderEvent("EXECUTIVE_ARRIVING", order);
  if (body.status === "DEVICE_COLLECTED") await notifyOrderEvent("DEVICE_COLLECTED", order);
  if (body.status === "PRICE_REVISED") await notifyOrderEvent("PRICE_REVISED", order);
  if (body.status === "PAYMENT_COMPLETED" || body.status === "PURCHASE_COMPLETED") {
    await notifyOrderEvent("PAYMENT_COMPLETED", order);
  }

  if (body.status && body.status !== existing.status) {
    await recordStatusChange({
      orderId: id,
      oldStatus: existing.status,
      newStatus: body.status,
      changedBy: `admin:${auth.user.id}`,
      notes: body.notes,
    });
  }

  await writeAudit({
    userId: auth.user.id,
    action: "ORDER_UPDATED",
    entity: "Order",
    entityId: id,
    meta: body,
    ip: clientIp(req),
  });

  return NextResponse.json({ ok: true });
}
