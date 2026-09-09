import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/orders";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const { inspectionAdj, ...fields } = body;

  const inspection = await prisma.deviceInspection.upsert({
    where: { orderId: id },
    update: fields,
    create: { orderId: id, ...fields },
  });

  const order = await prisma.order.findUnique({ where: { id } });
  const adj = Number(inspectionAdj || 0);
  const finalPrice = Math.max(0, (order?.estimatedPrice || 0) + adj);
  await prisma.order.update({
    where: { id },
    data: {
      inspectionAdj: adj,
      finalPrice,
      status: "UNDER_INSPECTION",
    },
  });

  await writeAudit({
    userId: auth.user.id,
    action: "INSPECTION_SAVED",
    entity: "DeviceInspection",
    entityId: inspection.id,
    meta: { orderId: id },
  });

  return NextResponse.json({ inspection, finalPrice, inspectionAdj: adj });
}
