import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const amount = Number(body.amount ?? order.finalPrice ?? order.estimatedPrice);
  await prisma.payment.create({
    data: {
      orderId: id,
      method: body.method || "UPI",
      amount,
      reference: body.reference || null,
      status: body.status || "PAID",
      paidAt: body.status === "PENDING" ? null : new Date(),
    },
  });

  await prisma.order.update({
    where: { id },
    data: {
      paymentStatus: body.status === "PENDING" ? "PENDING" : "PAID",
      status: body.status === "PENDING" ? "PAYMENT_PENDING" : "PAYMENT_COMPLETED",
      customerDecision: "ACCEPT",
      finalPrice: amount,
    },
  });

  return NextResponse.json({ ok: true });
}
