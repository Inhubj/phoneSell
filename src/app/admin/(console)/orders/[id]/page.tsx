import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { OrderDetail } from "@/components/admin/OrderDetail";
import { adminPage } from "@/lib/guard";

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  await adminPage("orders");
  const { id } = await params;
  const [order, executives] = await Promise.all([
    prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        device: { include: { brand: true } },
        variant: true,
        address: true,
        pickupSlot: true,
        photos: true,
        assignment: { include: { executive: true } },
        inspection: true,
        payments: true,
        notifications: { orderBy: { createdAt: "desc" }, take: 20 },
        customDevice: true,
        statusHistory: { orderBy: { createdAt: "desc" } },
        priceHistory: { orderBy: { createdAt: "desc" } },
        diagnosis: { include: { events: { orderBy: { createdAt: "asc" } } } },
      },
    }),
    prisma.pickupExecutive.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ]);
  if (!order) notFound();
  return <OrderDetail order={JSON.parse(JSON.stringify(order))} executives={executives} />;
}
