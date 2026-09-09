import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const deviceType = new URL(req.url).searchParams.get("deviceType");
  const brands = await prisma.brand.findMany({
    where: {
      isActive: true,
      ...(deviceType
        ? { devices: { some: { isActive: true, deviceType } } }
        : {}),
    },
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true, slug: true, logoUrl: true },
  });
  return NextResponse.json({ brands });
}
