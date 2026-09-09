import { prisma } from "./prisma";

export async function recordVisitorEvent(input: {
  visitorId: string;
  customerId?: string | null;
  eventType: string;
  path?: string;
  ip?: string;
  userAgent?: string;
}) {
  await prisma.visitorEvent.create({
    data: {
      visitorId: input.visitorId,
      customerId: input.customerId || null,
      eventType: input.eventType,
      path: input.path,
      ip: input.ip,
      userAgent: input.userAgent?.slice(0, 240),
    },
  });
}

export async function recordLoginEvent(input: {
  customerId?: string | null;
  loginMethod: string;
  loginStatus: string;
  ip?: string;
  userAgent?: string;
}) {
  await prisma.loginEvent.create({
    data: {
      customerId: input.customerId || null,
      loginMethod: input.loginMethod,
      loginStatus: input.loginStatus,
      ip: input.ip,
      userAgent: input.userAgent?.slice(0, 240),
    },
  });
}

export async function recordStatusChange(input: {
  orderId: string;
  oldStatus: string;
  newStatus: string;
  changedBy: string;
  notes?: string;
}) {
  if (input.oldStatus === input.newStatus) return;
  await prisma.orderStatusHistory.create({
    data: input,
  });
}
