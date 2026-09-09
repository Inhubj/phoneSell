import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { calculateQuote } from "@/lib/pricing";
import { quoteSchema } from "@/lib/validations";
import { prisma } from "@/lib/prisma";
import { rateLimit, clientIp, assertSameOrigin } from "@/lib/security";
import { requireCustomer } from "@/lib/auth";
import { recordVisitorEvent } from "@/lib/analytics";

export async function POST(req: Request) {
  if (!assertSameOrigin(req)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const auth = await requireCustomer();
  if (!auth) return NextResponse.json({ error: "Please log in" }, { status: 401 });
  const limited = rateLimit(`quote:${clientIp(req)}`, 40, 60_000);
  if (!limited.ok) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const body = await req.json().catch(() => null);
  const jar = await cookies();
  if (body?.custom) {
    await recordVisitorEvent({
      visitorId: jar.get("rmt_vid")?.value || auth.customer.id,
      customerId: auth.customer.id,
      eventType: "ORDER_STARTED",
      path: "/sell",
      ip: clientIp(req),
    });
    return NextResponse.json({
      basePrice: 0,
      estimatedPrice: 0,
      pending: true,
      adjustments: [],
    });
  }

  const parsed = quoteSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid quote request" }, { status: 400 });

  const variant = await prisma.deviceVariant.findUnique({
    where: { id: parsed.data.variantId },
    include: { device: true },
  });
  if (!variant) return NextResponse.json({ error: "Unknown variant" }, { status: 404 });

  const quote = await calculateQuote({
    variantId: parsed.data.variantId,
    isIos: variant.device.isIos,
    condition: parsed.data.condition,
    extras: parsed.data.extras,
    battery: parsed.data.battery,
  });
  await recordVisitorEvent({
    visitorId: jar.get("rmt_vid")?.value || auth.customer.id,
    customerId: auth.customer.id,
    eventType: "ORDER_STARTED",
    path: "/sell",
    ip: clientIp(req),
  });
  return NextResponse.json(quote);
}
