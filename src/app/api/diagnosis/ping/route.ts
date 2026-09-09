import { NextResponse } from "next/server";
import { requireCustomer } from "@/lib/auth";

export async function GET() {
  const auth = await requireCustomer();
  if (!auth) return NextResponse.json({ error: "Please log in" }, { status: 401 });
  return NextResponse.json({ ok: true, t: Date.now() });
}
