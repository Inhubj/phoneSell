import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const slots = await prisma.pickupSlot.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: { id: true, label: true, startTime: true, endTime: true },
  });
  return NextResponse.json({ slots });
}
