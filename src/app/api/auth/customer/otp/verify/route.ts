import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { indianMobile } from "@/lib/validations";
import { rateLimit, clientIp, assertSameOrigin } from "@/lib/security";
import { upsertVerifiedCustomer } from "@/lib/customer-auth";
import { recordLoginEvent, recordVisitorEvent } from "@/lib/analytics";

export async function POST(req: Request) {
  if (!assertSameOrigin(req)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const ip = clientIp(req);
  const limited = rateLimit(`cust-otpv:${ip}`, 10, 10 * 60_000);
  if (!limited.ok) return NextResponse.json({ error: "Too many attempts" }, { status: 429 });

  const body = await req.json().catch(() => null);
  const method = body?.method === "email" ? "EMAIL" : "MOBILE";
  const code = String(body?.code || "");
  const ua = req.headers.get("user-agent") || "";
  let identifier = "";

  if (method === "MOBILE") {
    const mobile = indianMobile.safeParse(String(body?.identifier || body?.mobile || "").replace(/\D/g, ""));
    if (!mobile.success || code.length < 4) {
      await recordLoginEvent({ loginMethod: "MOBILE_OTP", loginStatus: "FAILED", ip, userAgent: ua });
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }
    identifier = mobile.data;
  } else {
    identifier = String(body?.identifier || body?.email || "").trim().toLowerCase();
    if (!identifier || code.length < 4) {
      await recordLoginEvent({ loginMethod: "EMAIL_OTP", loginStatus: "FAILED", ip, userAgent: ua });
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }
  }

  const row = await prisma.customerOtp.findFirst({
    where: { identifier, channel: method, purpose: "LOGIN", verified: false },
    orderBy: { createdAt: "desc" },
  });
  if (!row || row.expiresAt < new Date() || row.attempts >= 5) {
    await recordLoginEvent({
      loginMethod: method === "EMAIL" ? "EMAIL_OTP" : "MOBILE_OTP",
      loginStatus: "FAILED",
      ip,
      userAgent: ua,
    });
    return NextResponse.json({ error: "OTP expired. Request a new one." }, { status: 400 });
  }

  const ok = await bcrypt.compare(code, row.codeHash);
  await prisma.customerOtp.update({
    where: { id: row.id },
    data: { attempts: { increment: 1 }, verified: ok },
  });
  if (!ok) {
    await recordLoginEvent({
      loginMethod: method === "EMAIL" ? "EMAIL_OTP" : "MOBILE_OTP",
      loginStatus: "FAILED",
      ip,
      userAgent: ua,
    });
    return NextResponse.json({ error: "Incorrect OTP" }, { status: 400 });
  }

  await prisma.customerOtp.updateMany({
    where: { identifier, channel: method, purpose: "LOGIN", verified: false, id: { not: row.id } },
    data: { verified: true },
  });

  const session = await upsertVerifiedCustomer({
    method,
    mobile: method === "MOBILE" ? identifier : undefined,
    email: method === "EMAIL" ? identifier : undefined,
    ip,
    userAgent: ua,
  });

  await recordLoginEvent({
    customerId: session.id,
    loginMethod: method === "EMAIL" ? "EMAIL_OTP" : "MOBILE_OTP",
    loginStatus: "SUCCESS",
    ip,
    userAgent: ua,
  });
  const jar = await cookies();
  await recordVisitorEvent({
    visitorId: jar.get("rmt_vid")?.value || session.id,
    customerId: session.id,
    eventType: "LOGIN_SUCCESS",
    path: "/login",
    ip,
    userAgent: ua,
  });

  return NextResponse.json({
    ok: true,
    customer: { id: session.id, mobile: session.mobile, email: session.email, name: session.name },
  });
}
