import { prisma } from "./prisma";
import { createCustomerSession, type CustomerSession } from "./auth";

export async function upsertVerifiedCustomer(input: {
  method: "MOBILE" | "EMAIL";
  mobile?: string;
  email?: string;
  ip?: string;
  userAgent?: string;
}): Promise<CustomerSession> {
  const mobile = input.mobile?.trim() || "";
  const email = input.email?.trim().toLowerCase() || "";

  let customer =
    (mobile
      ? await prisma.customer.findFirst({ where: { mobile } })
      : null) ||
    (email
      ? await prisma.customer.findFirst({ where: { email } })
      : null);

  const now = new Date();
  if (!customer) {
    customer = await prisma.customer.create({
      data: {
        mobile,
        email,
        loginMethod: input.method,
        firstLoginAt: now,
        lastLoginAt: now,
        loginCount: 1,
        lastIp: input.ip,
        userAgent: input.userAgent,
        status: "ACTIVE",
      },
    });
  } else {
    customer = await prisma.customer.update({
      where: { id: customer.id },
      data: {
        mobile: customer.mobile || mobile,
        email: customer.email || email,
        loginMethod: input.method,
        firstLoginAt: customer.firstLoginAt || now,
        lastLoginAt: now,
        loginCount: { increment: 1 },
        lastIp: input.ip,
        userAgent: input.userAgent,
        status: "ACTIVE",
      },
    });
  }

  const session: CustomerSession = {
    id: customer.id,
    name: customer.fullName,
    mobile: customer.mobile,
    email: customer.email,
    kind: "customer",
  };
  await createCustomerSession(session);
  return session;
}
