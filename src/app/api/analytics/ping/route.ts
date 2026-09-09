import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCustomerSession } from "@/lib/auth";
import { recordVisitorEvent } from "@/lib/analytics";
import { clientIp } from "@/lib/security";

export async function POST(req: Request) {
  const jar = await cookies();
  const visitorId = jar.get("rmt_vid")?.value || crypto.randomUUID();
  if (!jar.get("rmt_vid")?.value) {
    jar.set("rmt_vid", visitorId, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 365 });
  }
  const body = await req.json().catch(() => ({}));
  const session = await getCustomerSession();
  await recordVisitorEvent({
    visitorId,
    customerId: session?.id,
    eventType: body.eventType || "PAGE_VIEW",
    path: String(body.path || "").slice(0, 180),
    ip: clientIp(req),
    userAgent: req.headers.get("user-agent") || "",
  });
  return NextResponse.json({ ok: true });
}
