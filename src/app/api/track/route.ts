import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { trackSchema } from "@/lib/validations";
import { TRACK_STEPS, STATUS_LABELS, type OrderStatus } from "@/lib/constants";
import { rateLimit, clientIp } from "@/lib/security";

export async function POST(req: Request) {
  const limited = rateLimit(`track:${clientIp(req)}`, 20, 10 * 60_000);
  if (!limited.ok) return NextResponse.json({ error: "Too many searches" }, { status: 429 });

  const body = await req.json().catch(() => null);
  const parsed = trackSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid order ID and mobile" }, { status: 400 });

  const order = await prisma.order.findFirst({
    where: {
      orderNumber: parsed.data.orderNumber.trim().toUpperCase(),
      customer: { mobile: parsed.data.mobile },
    },
    include: {
      device: { include: { brand: true } },
      variant: true,
      customDevice: true,
      pickupSlot: true,
      assignment: { include: { executive: true } },
      payments: true,
    },
  });
  if (!order) return NextResponse.json({ error: "No matching order found" }, { status: 404 });

  const status = order.status as OrderStatus;
  const currentIndex = TRACK_STEPS.findIndex((step) => (step.statuses as readonly string[]).includes(status));

  return NextResponse.json({
    orderNumber: order.orderNumber,
    status: STATUS_LABELS[status] || order.status,
    statusKey: order.status,
    phone: order.customDevice
      ? `${order.customDevice.brand} ${order.customDevice.model}`
      : `${order.device?.brand.name || ""} ${order.device?.name || "Device"}`,
    variant: order.variant
      ? `${order.variant.ramGb} GB / ${order.variant.storageGb} GB`
      : order.customDevice
        ? `${order.customDevice.ram} / ${order.customDevice.storage}`
        : "",
    estimatedPrice: order.estimatedPrice,
    finalPrice: order.finalPrice,
    pickupDate: order.pickupDate,
    slot: order.pickupSlot?.label,
    executive: order.assignment
      ? { name: order.assignment.executive.name, mobile: order.assignment.executive.mobile }
      : null,
    paymentStatus: order.paymentStatus,
    steps: TRACK_STEPS.map((step, i) => ({
      label: step.label,
      done: currentIndex >= i && currentIndex !== -1,
      current: currentIndex === i,
    })),
    cancelled: order.status === "CANCELLED" || order.status === "REJECTED",
  });
}
