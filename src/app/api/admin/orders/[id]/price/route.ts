import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/orders";
import { canAccess } from "@/lib/roles";
import { clientIp } from "@/lib/security";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth || !canAccess(auth.session.role, "orders", auth.permissions)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const newPrice = Number(body.price);
  const reason = String(body.reason || "").trim();
  if (!Number.isFinite(newPrice) || newPrice < 0) {
    return NextResponse.json({ error: "Enter a valid price" }, { status: 400 });
  }
  if (reason.length < 3) return NextResponse.json({ error: "Add a reason for the price change" }, { status: 400 });

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const oldPrice = order.currentPrice > 0 ? order.currentPrice : order.finalPrice || order.estimatedPrice;
  await prisma.order.update({
    where: { id },
    data: {
      currentPrice: newPrice,
      finalPrice: newPrice,
      estimatedPrice: order.estimatedPrice,
    },
  });
  await prisma.orderPriceHistory.create({
    data: {
      orderId: id,
      oldPrice,
      newPrice,
      changedBy: `${auth.user.role}:${auth.user.name}`,
      reason,
    },
  });
  await writeAudit({
    userId: auth.user.id,
    action: "ORDER_PRICE_UPDATED",
    entity: "Order",
    entityId: id,
    meta: { oldPrice, newPrice, reason, previous: oldPrice, next: newPrice },
    ip: clientIp(req),
  });
  return NextResponse.json({ ok: true, oldPrice, newPrice });
}
