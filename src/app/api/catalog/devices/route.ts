import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const brandId = searchParams.get("brandId");
  const deviceType = searchParams.get("deviceType");

  const devices = await prisma.device.findMany({
    where: {
      isActive: true,
      ...(brandId ? { brandId } : {}),
      ...(deviceType ? { deviceType } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q } },
              { slug: { contains: q.toLowerCase() } },
              { brand: { name: { contains: q } } },
            ],
          }
        : {}),
    },
    include: { brand: { select: { id: true, name: true, slug: true } } },
    orderBy: [{ launchYear: "desc" }, { name: "asc" }],
    take: 80,
  });

  return NextResponse.json({ devices });
}
