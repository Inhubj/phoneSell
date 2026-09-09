import { staffPage } from "@/lib/guard";
import { prisma } from "@/lib/prisma";
import { ExecutiveBoard } from "@/components/executive/ExecutiveBoard";

export default async function ExecutiveHome() {
  const auth = await staffPage();
  const orders = await prisma.order.findMany({
    where: { assignment: { executiveId: auth.executive!.id } },
    include: {
      customer: true,
      device: { include: { brand: true } },
      variant: true,
      address: true,
      pickupSlot: true,
      photos: true,
      inspection: true,
      customDevice: true,
      priceHistory: { orderBy: { createdAt: "desc" } },
      diagnosis: { include: { events: { orderBy: { createdAt: "asc" } } } },
    },
    orderBy: { pickupDate: "asc" },
  });
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  const today = orders.filter((o) => o.pickupDate && o.pickupDate >= start && o.pickupDate < end && o.status !== "CANCELLED" && o.status !== "PURCHASE_COMPLETED");
  const upcoming = orders.filter((o) => o.pickupDate && o.pickupDate >= end && !["CANCELLED", "PURCHASE_COMPLETED", "REJECTED"].includes(o.status));
  const completed = orders.filter((o) => ["DEVICE_COLLECTED", "UNDER_INSPECTION", "PAYMENT_COMPLETED", "PURCHASE_COMPLETED"].includes(o.status));
  const cancelled = orders.filter((o) => o.status === "CANCELLED" || o.status === "REJECTED");
  return (
    <ExecutiveBoard
      name={auth.executive!.name}
      today={JSON.parse(JSON.stringify(today))}
      upcoming={JSON.parse(JSON.stringify(upcoming))}
      completed={JSON.parse(JSON.stringify(completed))}
      cancelled={JSON.parse(JSON.stringify(cancelled))}
      all={JSON.parse(JSON.stringify(orders))}
    />
  );
}
