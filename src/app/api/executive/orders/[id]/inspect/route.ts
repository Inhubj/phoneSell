import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/orders";
import { recordStatusChange } from "@/lib/analytics";
import { clientIp } from "@/lib/security";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireStaff();
  if (!auth?.executive) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const assignment = await prisma.executiveAssignment.findFirst({
    where: { orderId: id, executiveId: auth.executive.id },
  });
  if (!assignment) return NextResponse.json({ error: "Not assigned" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const { inspectionAdj, finalPrice, reason, ...fields } = body;
  const inspection = await prisma.deviceInspection.upsert({
    where: { orderId: id },
    update: fields,
    create: { orderId: id, ...fields },
  });

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const adj = Number(inspectionAdj ?? order.inspectionAdj ?? 0);
  const nextPrice =
    typeof finalPrice === "number" && Number.isFinite(finalPrice)
      ? Math.max(0, finalPrice)
      : Math.max(0, (order.currentPrice || order.estimatedPrice) + adj);

  const previous = order.currentPrice || order.finalPrice || order.estimatedPrice;
  await prisma.order.update({
    where: { id },
    data: {
      inspectionAdj: adj,
      finalPrice: nextPrice,
      currentPrice: nextPrice,
      status: "UNDER_INSPECTION",
    },
  });

  if (previous !== nextPrice) {
    await prisma.orderPriceHistory.create({
      data: {
        orderId: id,
        oldPrice: previous,
        newPrice: nextPrice,
        changedBy: `executive:${auth.executive.id}`,
        reason: reason || "Physical inspection",
      },
    });
  }

  await recordStatusChange({
    orderId: id,
    oldStatus: order.status,
    newStatus: "UNDER_INSPECTION",
    changedBy: `executive:${auth.executive.id}`,
    notes: reason || "Physical inspection saved",
  });

  await writeAudit({
    action: "EXECUTIVE_INSPECTION",
    entity: "DeviceInspection",
    entityId: inspection.id,
    ip: clientIp(req),
    meta: { orderId: id, previous, nextPrice, reason },
  });

  return NextResponse.json({ inspection, finalPrice: nextPrice });
}
