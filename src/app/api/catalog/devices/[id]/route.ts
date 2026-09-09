import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const device = await prisma.device.findUnique({
    where: { id },
    include: {
      brand: true,
      variants: {
        where: { isActive: true },
        include: { pricing: true, bands: { where: { isActive: true } } },
        orderBy: [{ ramGb: "asc" }, { storageGb: "asc" }],
      },
    },
  });
  if (!device) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ device, variants: device.variants });
}
