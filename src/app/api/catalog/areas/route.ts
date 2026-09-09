import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const areas = await prisma.serviceArea.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, city: true, pickupCharge: true, serviceCharge: true, etaHours: true, slug: true, pincode: true },
  });
  return NextResponse.json({ areas });
}
