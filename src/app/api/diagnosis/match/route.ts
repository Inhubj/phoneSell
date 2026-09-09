import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCustomer } from "@/lib/auth";
import { assertSameOrigin, clientIp, rateLimit } from "@/lib/security";
import { matchCatalogDevices, type CatalogDevice } from "@/lib/device-match";
import type { BrowserSignals } from "@/lib/diagnosis";

export async function POST(req: Request) {
  if (!assertSameOrigin(req)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const auth = await requireCustomer();
  if (!auth) return NextResponse.json({ error: "Please log in" }, { status: 401 });
  const limited = rateLimit(`diag-match:${clientIp(req)}`, 30, 60_000);
  if (!limited.ok) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const body = (await req.json().catch(() => null)) as { signals?: BrowserSignals } | null;
  if (!body?.signals?.userAgent) return NextResponse.json({ error: "Missing device signals" }, { status: 400 });

  const chModel = req.headers.get("sec-ch-ua-model")?.replace(/"/g, "") || "";
  const devices = (await prisma.device.findMany({
    where: { isActive: true },
    include: { brand: { select: { id: true, name: true, slug: true } } },
    take: 400,
  })) as CatalogDevice[];

  const result = matchCatalogDevices(devices, body.signals, chModel || undefined);
  return NextResponse.json(result);
}
