import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { indianMobile } from "@/lib/validations";
import { rateLimit, clientIp, assertSameOrigin } from "@/lib/security";
import { sendNotification } from "@/lib/notifications";

export async function POST(req: Request) {
  if (!assertSameOrigin(req)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const ip = clientIp(req);
  if (!rateLimit(`pw-otp:${ip}`, 6, 10 * 60_000).ok) {
    return NextResponse.json({ error: "Please wait before requesting another OTP" }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const kind = body?.kind === "admin" || body?.kind === "executive" ? body.kind : "customer";
  const method = body?.method === "mobile" ? "MOBILE" : "EMAIL";
  let identifier = String(body?.identifier || "").trim().toLowerCase();
  if (method === "MOBILE") {
    const mobile = indianMobile.safeParse(String(body?.identifier || "").replace(/\D/g, ""));
    if (!mobile.success) return NextResponse.json({ error: "Enter a valid mobile number" }, { status: 400 });
    identifier = mobile.data;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)) {
    return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
  }

  let found = false;
  if (kind === "admin") {
    found = Boolean(
      await prisma.user.findFirst({
        where: method === "MOBILE" ? { phone: identifier, isActive: true } : { email: identifier, isActive: true },
      }),
    );
  } else if (kind === "executive") {
    found = Boolean(
      await prisma.pickupExecutive.findFirst({
        where: method === "MOBILE" ? { mobile: identifier, isActive: true } : { email: identifier, isActive: true },
      }),
    );
  } else {
    found = Boolean(
      await prisma.customer.findFirst({
        where: method === "MOBILE" ? { mobile: identifier } : { email: identifier },
      }),
    );
  }
  if (!found) return NextResponse.json({ error: "No matching account found" }, { status: 404 });

  const code = String(Math.floor(100000 + Math.random() * 900000));
  await prisma.customerOtp.create({
    data: {
      identifier,
      channel: method,
      purpose: `PASSWORD_RESET_${kind.toUpperCase()}`,
      codeHash: await bcrypt.hash(code, 10),
      expiresAt: new Date(Date.now() + 10 * 60_000),
      mobile: method === "MOBILE" ? identifier : "",
    },
  });
  await sendNotification({
    channel: method === "EMAIL" ? "EMAIL" : "SMS",
    eventType: "OTP",
    recipient: identifier,
    subject: "Password reset code",
    body: `PhoneSell password reset OTP is ${code}. Valid for 10 minutes.`,
  });
  return NextResponse.json({ ok: true, ...(process.env.OTP_BYPASS_DEV === "true" ? { devCode: code } : {}) });
}
