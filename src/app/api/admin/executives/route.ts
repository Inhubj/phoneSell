import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccess } from "@/lib/roles";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth || !canAccess(auth.session.role, "pickup", auth.permissions)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const executives = await prisma.pickupExecutive.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, employeeId: true, mobile: true, email: true },
  });
  return NextResponse.json({ executives });
}
