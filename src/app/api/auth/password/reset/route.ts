import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { indianMobile } from "@/lib/validations";
import { hashPassword } from "@/lib/auth";
import { rateLimit, clientIp, assertSameOrigin } from "@/lib/security";
import { writeAudit } from "@/lib/orders";
import { clearOtpChallenge, getOtpChallenge, normalizeOtpCode, setOtpChallenge } from "@/lib/otp-challenge";

export async function POST(req: Request) {
  if (!assertSameOrigin(req)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const ip = clientIp(req);
  if (!rateLimit(`pw-reset:${ip}`, 8, 10 * 60_000).ok) {
    return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const kind = body?.kind === "admin" || body?.kind === "executive" ? body.kind : "customer";
  const method = body?.method === "mobile" ? "MOBILE" : "EMAIL";
  const password = String(body?.password || "");
  const code = normalizeOtpCode(body?.code);
  if (password.length < 8) return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });

  let identifier = String(body?.identifier || "").trim().toLowerCase();
  if (method === "MOBILE") {
    const mobile = indianMobile.safeParse(String(body?.identifier || "").replace(/\D/g, ""));
    if (!mobile.success) return NextResponse.json({ error: "Invalid mobile" }, { status: 400 });
    identifier = mobile.data;
  }

  const purpose = `PASSWORD_RESET_${kind.toUpperCase()}`;
  const challenge = await getOtpChallenge();
  const row = await prisma.customerOtp.findFirst({
    where: { identifier, channel: method, purpose, verified: false },
    orderBy: { createdAt: "desc" },
  });
  const fromCookie =
    challenge?.identifier === identifier &&
    challenge.channel === method &&
    challenge.purpose === purpose &&
    Boolean(challenge.codeHash);
  const hash = fromCookie
    ? challenge.codeHash
    : row && row.expiresAt >= new Date()
      ? row.codeHash
      : "";
  const attempts = fromCookie ? challenge.attempts : row?.attempts ?? 0;
  if (!hash || attempts >= 5) {
    return NextResponse.json({ error: "OTP expired. Request a new one." }, { status: 400 });
  }
  const ok = await bcrypt.compare(code, hash);
  if (row) {
    await prisma.customerOtp.update({ where: { id: row.id }, data: { attempts: { increment: 1 }, verified: ok } });
  }
  if (!ok) {
    if (fromCookie) await setOtpChallenge({ ...challenge, attempts: attempts + 1 });
    return NextResponse.json({ error: "Incorrect OTP" }, { status: 400 });
  }
  await clearOtpChallenge();

  const passwordHash = await hashPassword(password);
  if (kind === "admin") {
    const user = await prisma.user.findFirst({
      where: method === "MOBILE" ? { phone: identifier } : { email: identifier },
    });
    if (!user) return NextResponse.json({ error: "Account not found" }, { status: 404 });
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, sessionVersion: { increment: 1 } },
    });
    await writeAudit({ userId: user.id, action: "PASSWORD_RESET", entity: "User", entityId: user.id, ip });
  } else if (kind === "executive") {
    const executive = await prisma.pickupExecutive.findFirst({
      where: method === "MOBILE" ? { mobile: identifier } : { email: identifier },
    });
    if (!executive) return NextResponse.json({ error: "Account not found" }, { status: 404 });
    await prisma.pickupExecutive.update({
      where: { id: executive.id },
      data: { passwordHash, sessionVersion: { increment: 1 } },
    });
    await writeAudit({ action: "PASSWORD_RESET", entity: "PickupExecutive", entityId: executive.id, ip });
  } else {
    const customer = await prisma.customer.findFirst({
      where: method === "MOBILE" ? { mobile: identifier } : { email: identifier },
    });
    if (!customer) return NextResponse.json({ error: "Account not found" }, { status: 404 });
    await prisma.customer.update({ where: { id: customer.id }, data: { passwordHash } });
  }

  return NextResponse.json({ ok: true });
}
