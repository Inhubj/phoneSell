import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { indianMobile } from "@/lib/validations";
import { rateLimit, clientIp, assertSameOrigin } from "@/lib/security";
import { sendNotification } from "@/lib/notifications";

export async function POST(req: Request) {
  if (!assertSameOrigin(req)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const limited = rateLimit(`otp:${clientIp(req)}`, 5, 10 * 60_000);
  if (!limited.ok) return NextResponse.json({ error: "Please wait before requesting another OTP" }, { status: 429 });

  const body = await req.json().catch(() => null);
  const mobile = indianMobile.safeParse(body?.mobile);
  if (!mobile.success) return NextResponse.json({ error: "Enter a valid mobile number" }, { status: 400 });

  const code = String(Math.floor(100000 + Math.random() * 900000));
  const codeHash = await bcrypt.hash(code, 10);
  await prisma.customerOtp.create({
    data: {
      mobile: mobile.data,
      codeHash,
      expiresAt: new Date(Date.now() + 10 * 60_000),
    },
  });

  await sendNotification({
    channel: "SMS",
    eventType: "OTP",
    recipient: mobile.data,
    body: `PhoneSell OTP is ${code}. Valid for 10 minutes.`,
  });

  return NextResponse.json({ ok: true });
}
