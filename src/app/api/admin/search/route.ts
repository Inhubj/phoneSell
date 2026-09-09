import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccess } from "@/lib/roles";

export async function GET(req: Request) {
  const auth = await requireAdmin();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canAccess(auth.session.role, "orders") && !canAccess(auth.session.role, "customers")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const q = new URL(req.url).searchParams.get("q")?.trim() || "";
  if (q.length < 3) return NextResponse.json({ orders: [], customers: [] });

  const [orders, customers] = await Promise.all([
    prisma.order.findMany({
      where: {
        OR: [
          { orderNumber: { contains: q } },
          { customer: { mobile: { contains: q } } },
          { customer: { email: { contains: q } } },
          { customerId: { contains: q } },
          { device: { name: { contains: q } } },
          { customDevice: { model: { contains: q } } },
        ],
      },
      include: { customer: true, device: { include: { brand: true } }, customDevice: true },
      take: 12,
    }),
    prisma.customer.findMany({
      where: {
        OR: [{ id: { contains: q } }, { mobile: { contains: q } }, { email: { contains: q } }, { fullName: { contains: q } }],
      },
      take: 8,
    }),
  ]);
  return NextResponse.json({ orders, customers });
}
