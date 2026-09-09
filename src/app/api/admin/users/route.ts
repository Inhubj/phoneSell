import { NextResponse } from "next/server";
import { hashPassword, requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccess, ALL_ADMIN_SECTIONS } from "@/lib/roles";
import { writeAudit } from "@/lib/orders";
import { assertSameOrigin, clientIp } from "@/lib/security";
import { indianMobile } from "@/lib/validations";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth || !canAccess(auth.session.role, "users", auth.permissions)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      phone: true,
      role: true,
      isActive: true,
      permissionsJson: true,
      lastLoginAt: true,
    },
  });
  return NextResponse.json({ users, sections: ALL_ADMIN_SECTIONS });
}

export async function POST(req: Request) {
  if (!assertSameOrigin(req)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const auth = await requireAdmin();
  if (!auth || auth.session.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Only Super Admin can manage admin users" }, { status: 403 });
  }
  const body = await req.json().catch(() => ({}));
  const email = String(body.email || "").trim().toLowerCase();
  const phone = indianMobile.safeParse(String(body.phone || "").replace(/\D/g, ""));
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Valid email is mandatory" }, { status: 400 });
  if (!phone.success) return NextResponse.json({ error: "Valid mobile is mandatory" }, { status: 400 });

  if (body.id) {
    const data: Record<string, unknown> = {
      name: body.name,
      email,
      phone: phone.data,
      role: body.role || "ADMIN",
      isActive: body.isActive ?? true,
      permissionsJson: JSON.stringify(body.permissions || []),
    };
    if (body.password) data.passwordHash = await hashPassword(body.password);
    if (body.isActive === false) data.sessionVersion = { increment: 1 };
    await prisma.user.update({ where: { id: body.id }, data });
    await writeAudit({
      userId: auth.user.id,
      action: body.isActive === false ? "ADMIN_DEACTIVATED" : "ADMIN_UPDATED",
      entity: "User",
      entityId: body.id,
      meta: { role: body.role, permissions: body.permissions },
      ip: clientIp(req),
    });
    return NextResponse.json({ ok: true });
  }

  const user = await prisma.user.create({
    data: {
      name: body.name || "Admin",
      email,
      username: body.username || email.split("@")[0],
      phone: phone.data,
      role: body.role || "ADMIN",
      passwordHash: await hashPassword(body.password || "RoyalAdmin@2026"),
      permissionsJson: JSON.stringify(body.permissions || []),
    },
  });
  await writeAudit({
    userId: auth.user.id,
    action: "ADMIN_CREATED",
    entity: "User",
    entityId: user.id,
    ip: clientIp(req),
  });
  return NextResponse.json({ ok: true, id: user.id });
}
