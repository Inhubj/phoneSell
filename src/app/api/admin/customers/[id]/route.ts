import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/orders";
import { assertSameOrigin, clientIp } from "@/lib/security";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!assertSameOrigin(req)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const auth = await requireAdmin();
  if (!auth || auth.session.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Only Super Admin can delete customers" }, { status: 403 });
  }

  const { id } = await params;
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: { orders: { select: { id: true, orderNumber: true } } },
  });
  if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

  const orderNumbers = customer.orders.map((o) => o.orderNumber);

  await prisma.$transaction(async (tx) => {
    await tx.deviceDiagnosis.updateMany({ where: { customerId: id }, data: { orderId: null } });
    await tx.order.deleteMany({ where: { customerId: id } });
    const otpOr: { mobile?: string; identifier?: string }[] = [];
    if (customer.mobile) {
      otpOr.push({ mobile: customer.mobile }, { identifier: customer.mobile });
    }
    if (customer.email) otpOr.push({ identifier: customer.email });
    if (otpOr.length) await tx.customerOtp.deleteMany({ where: { OR: otpOr } });
    await tx.customer.delete({ where: { id } });
  });

  await writeAudit({
    userId: auth.user.id,
    action: "CUSTOMER_DELETED",
    entity: "Customer",
    entityId: id,
    meta: {
      mobile: customer.mobile,
      email: customer.email,
      name: customer.fullName,
      orders: orderNumbers,
    },
    ip: clientIp(req),
  });

  return NextResponse.json({ ok: true });
}
