import { NextResponse } from "next/server";
import { requireCustomer } from "@/lib/auth";

export async function GET() {
  const auth = await requireCustomer();
  if (!auth) return NextResponse.json({ user: null });
  return NextResponse.json({
    user: {
      id: auth.customer.id,
      name: auth.customer.fullName,
      mobile: auth.customer.mobile,
      email: auth.customer.email,
      loginMethod: auth.customer.loginMethod,
      loginCount: auth.customer.loginCount,
      createdAt: auth.customer.createdAt,
    },
  });
}
