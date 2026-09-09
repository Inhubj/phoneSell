import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createCustomerSession, verifyPassword } from "@/lib/auth";
import { indianMobile } from "@/lib/validations";
import { rateLimit, clientIp, assertSameOrigin } from "@/lib/security";
import { recordLoginEvent } from "@/lib/analytics";

export async function POST(req: Request) {
  if (!assertSameOrigin(req)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const ip = clientIp(req);
  const ua = req.headers.get("user-agent") || "";
  if (!rateLimit(`cust-pw:${ip}`, 8, 15 * 60_000).ok) {
    return NextResponse.json({ error: "Too many login attempts" }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const password = String(body?.password || "");
  const method = body?.method === "email" ? "EMAIL" : "MOBILE";
  let identifier = String(body?.identifier || "").trim().toLowerCase();
  if (method === "MOBILE") {
    const mobile = indianMobile.safeParse(String(body?.identifier || "").replace(/\D/g, ""));
    if (!mobile.success) return NextResponse.json({ error: "Invalid mobile" }, { status: 400 });
    identifier = mobile.data;
  }

  const customer = await prisma.customer.findFirst({
    where: method === "MOBILE" ? { mobile: identifier } : { email: identifier },
  });
  if (!customer?.passwordHash || !(await verifyPassword(password, customer.passwordHash))) {
    await recordLoginEvent({ loginMethod: "PASSWORD", loginStatus: "FAILED", ip, userAgent: ua });
    return NextResponse.json({ error: "Invalid email/username or password" }, { status: 401 });
  }
  if (customer.status !== "ACTIVE") return NextResponse.json({ error: "Account inactive" }, { status: 403 });

  await prisma.customer.update({
    where: { id: customer.id },
    data: { lastLoginAt: new Date(), loginCount: { increment: 1 }, lastIp: ip, userAgent: ua, loginMethod: "PASSWORD" },
  });
  await createCustomerSession({
    id: customer.id,
    name: customer.fullName,
    mobile: customer.mobile,
    email: customer.email,
    kind: "customer",
  });
  await recordLoginEvent({
    customerId: customer.id,
    loginMethod: "PASSWORD",
    loginStatus: "SUCCESS",
    ip,
    userAgent: ua,
  });
  return NextResponse.json({ ok: true });
}
