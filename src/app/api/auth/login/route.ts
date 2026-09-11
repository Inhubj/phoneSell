import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession, verifyPassword, type SessionUser } from "@/lib/auth";
import { loginSchema } from "@/lib/validations";
import { rateLimit, clientIp, assertSameOrigin } from "@/lib/security";
import { writeAudit } from "@/lib/orders";
import { sendNotification } from "@/lib/notifications";

export async function POST(req: Request) {
  if (!assertSameOrigin(req)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const limited = rateLimit(`login:${clientIp(req)}`, 8, 15 * 60_000);
  if (!limited.ok) return NextResponse.json({ error: "Too many login attempts" }, { status: 429 });

  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });

  const identifier = parsed.data.identifier.trim();
  const admin = await prisma.user.findFirst({
    where: {
      OR: [{ email: identifier }, { username: identifier }],
      isActive: true,
    },
  });

  if (admin && (await verifyPassword(parsed.data.password, admin.passwordHash))) {
    if (admin.twoFactorOn) {
      const otp = parsed.data.otp?.trim();
      if (!otp) {
        const code = String(Math.floor(100000 + Math.random() * 900000));
        await prisma.customerOtp.create({
          data: {
            identifier: admin.email,
            channel: "EMAIL",
            purpose: "ADMIN_2FA",
            codeHash: await bcrypt.hash(code, 10),
            expiresAt: new Date(Date.now() + 10 * 60_000),
          },
        });
        await sendNotification({
          channel: "EMAIL",
          eventType: "ADMIN_2FA",
          recipient: admin.email,
          subject: "PhoneSell admin verification code",
          body: `Your admin login code is ${code}.\n\nIt is valid for 10 minutes.`,
        });
        return NextResponse.json({ requires2fa: true });
      }
      const row = await prisma.customerOtp.findFirst({
        where: { identifier: admin.email, purpose: "ADMIN_2FA", verified: false },
        orderBy: { createdAt: "desc" },
      });
      if (!row || row.expiresAt < new Date() || row.attempts >= 5) {
        return NextResponse.json({ error: "2FA code expired. Sign in again." }, { status: 400 });
      }
      const ok = await bcrypt.compare(otp, row.codeHash);
      await prisma.customerOtp.update({
        where: { id: row.id },
        data: { attempts: { increment: 1 }, verified: ok },
      });
      if (!ok) return NextResponse.json({ error: "Incorrect 2FA code" }, { status: 401 });
    }
    await prisma.user.update({ where: { id: admin.id }, data: { lastLoginAt: new Date() } });
    await createSession({
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role as SessionUser["role"],
      kind: "admin",
      sv: admin.sessionVersion ?? 0,
    });
    await writeAudit({ userId: admin.id, action: "LOGIN", entity: "User", entityId: admin.id, ip: clientIp(req) });
    return NextResponse.json({ ok: true, redirect: "/admin" });
  }

  const executive = await prisma.pickupExecutive.findFirst({
    where: {
      isActive: true,
      OR: [{ email: identifier }, { mobile: identifier }, { employeeId: identifier }],
    },
  });
  if (executive?.passwordHash && (await verifyPassword(parsed.data.password, executive.passwordHash))) {
    await createSession({
      id: executive.id,
      name: executive.name,
      email: executive.email || executive.mobile,
      role: "EXECUTIVE",
      kind: "executive",
      sv: executive.sessionVersion ?? 0,
    });
    return NextResponse.json({ ok: true, redirect: "/executive" });
  }

  return NextResponse.json({ error: "Invalid email/username or password" }, { status: 401 });
}
