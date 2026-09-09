import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const auth = await requireAdmin();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() || "";
  const status = searchParams.get("status") || "";
  const area = searchParams.get("area") || "";
  const executive = searchParams.get("executive") || "";
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const orders = await prisma.order.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(q
        ? {
            OR: [
              { orderNumber: { contains: q } },
              { customer: { fullName: { contains: q } } },
              { customer: { mobile: { contains: q } } },
              { device: { name: { contains: q } } },
              { inspection: { imei1: { contains: q } } },
            ],
          }
        : {}),
      ...(area ? { address: { area: { contains: area } } } : {}),
      ...(executive ? { assignment: { executiveId: executive } } : {}),
      ...(from || to
        ? {
            createdAt: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to) } : {}),
            },
          }
        : {}),
    },
    include: {
      customer: true,
      device: { include: { brand: true } },
      variant: true,
      address: true,
      pickupSlot: true,
      assignment: { include: { executive: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json({ orders });
}
