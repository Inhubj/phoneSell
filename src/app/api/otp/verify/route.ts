import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { prisma } from "@/lib/prisma";
import { indianMobile } from "@/lib/validations";
import { rateLimit, clientIp, assertSameOrigin } from "@/lib/security";

const secret = new TextEncoder().encode(process.env.AUTH_SECRET || "royal-mobile-tech-dev-secret-change-in-production");

export async function POST(req: Request) {
  if (!assertSameOrigin(req)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const limited = rateLimit(`otpv:${clientIp(req)}`, 10, 10 * 60_000);
  if (!limited.ok) return NextResponse.json({ error: "Too many attempts" }, { status: 429 });

  const body = await req.json().catch(() => null);
  const mobile = indianMobile.safeParse(body?.mobile);
  const code = String(body?.code || "");
  if (!mobile.success || code.length < 4) {
    return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
  }

  const row = await prisma.customerOtp.findFirst({
    where: { mobile: mobile.data, verified: false },
    orderBy: { createdAt: "desc" },
  });
  if (!row || row.expiresAt < new Date() || row.attempts >= 5) {
    return NextResponse.json({ error: "OTP expired. Request a new one." }, { status: 400 });
  }

  const ok = await bcrypt.compare(code, row.codeHash);
  await prisma.customerOtp.update({
    where: { id: row.id },
    data: { attempts: { increment: 1 }, verified: ok },
  });
  if (!ok) return NextResponse.json({ error: "Incorrect OTP" }, { status: 400 });

  const token = await new SignJWT({ mobile: mobile.data, purpose: "order" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30m")
    .sign(secret);

  return NextResponse.json({ ok: true, token });
}
