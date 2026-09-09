import { prisma } from "./prisma";

export async function nextOrderNumber() {
  const year = new Date().getFullYear();
  const seq = await prisma.orderSequence.upsert({
    where: { year },
    create: { year, last: 1 },
    update: { last: { increment: 1 } },
  });
  return `RMT-${year}-${String(seq.last).padStart(6, "0")}`;
}

export async function writeAudit(input: {
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  meta?: unknown;
  ip?: string;
}) {
  await prisma.auditLog.create({
    data: {
      userId: input.userId,
      action: input.action,
      entity: input.entity,
      entityId: input.entityId,
      metaJson: input.meta ? JSON.stringify(input.meta) : null,
      ip: input.ip,
    },
  });
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
