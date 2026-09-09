import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { indianMobile } from "@/lib/validations";
import { rateLimit, clientIp, assertSameOrigin } from "@/lib/security";
import { sendNotification } from "@/lib/notifications";
import { recordLoginEvent } from "@/lib/analytics";

export async function POST(req: Request) {
  if (!assertSameOrigin(req)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const ip = clientIp(req);
  const limited = rateLimit(`cust-otp:${ip}`, 8, 10 * 60_000);
  if (!limited.ok) return NextResponse.json({ error: "Please wait before requesting another OTP" }, { status: 429 });

  const body = await req.json().catch(() => null);
  const method = body?.method === "email" ? "EMAIL" : "MOBILE";
  let identifier = "";

  if (method === "MOBILE") {
    const mobile = indianMobile.safeParse(String(body?.identifier || body?.mobile || "").replace(/\D/g, ""));
    if (!mobile.success) return NextResponse.json({ error: "Enter a valid 10-digit mobile number" }, { status: 400 });
    identifier = mobile.data;
  } else {
    const email = String(body?.identifier || body?.email || "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
    }
    identifier = email;
  }

  const perId = rateLimit(`cust-otp-id:${identifier}`, 4, 10 * 60_000);
  if (!perId.ok) return NextResponse.json({ error: "Too many OTP requests for this number or email" }, { status: 429 });

  await prisma.customerOtp.updateMany({
    where: { identifier, channel: method, purpose: "LOGIN", verified: false },
    data: { verified: true, attempts: 5 },
  });

  const code = String(Math.floor(100000 + Math.random() * 900000));
  const codeHash = await bcrypt.hash(code, 10);
  await prisma.customerOtp.create({
    data: {
      mobile: method === "MOBILE" ? identifier : "",
      identifier,
      channel: method,
      purpose: "LOGIN",
      codeHash,
      expiresAt: new Date(Date.now() + 10 * 60_000),
    },
  });

  await sendNotification({
    channel: method === "EMAIL" ? "EMAIL" : "SMS",
    eventType: "OTP",
    recipient: identifier,
    subject: "Your PhoneSell login code",
    body: `PhoneSell login OTP is ${code}. Valid for 10 minutes.`,
  });

  await recordLoginEvent({
    loginMethod: method === "EMAIL" ? "EMAIL_OTP" : "MOBILE_OTP",
    loginStatus: "OTP_SENT",
    ip,
    userAgent: req.headers.get("user-agent") || "",
  });

  const dev = process.env.OTP_BYPASS_DEV === "true";
  return NextResponse.json({ ok: true, ...(dev ? { devCode: code } : {}) });
}
