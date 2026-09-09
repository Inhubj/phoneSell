import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assertSameOrigin } from "@/lib/security";

export async function POST(req: Request) {
  if (!assertSameOrigin(req)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const auth = await requireStaff();
  if (!auth?.executive) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const permission = body.permission === "GRANTED" ? "GRANTED" : body.permission === "DENIED" ? "DENIED" : "UNKNOWN";
  const lat = permission === "GRANTED" ? Number(body.lat) : null;
  const lng = permission === "GRANTED" ? Number(body.lng) : null;
  await prisma.pickupExecutive.update({
    where: { id: auth.executive.id },
    data: {
      locationPermission: permission,
      lat: Number.isFinite(lat) ? lat : null,
      lng: Number.isFinite(lng) ? lng : null,
      locationUpdatedAt: permission === "GRANTED" ? new Date() : auth.executive.locationUpdatedAt,
      lastSeenAt: new Date(),
    },
  });
  return NextResponse.json({ ok: true, permission });
}
