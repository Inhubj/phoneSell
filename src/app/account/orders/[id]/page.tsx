import { notFound } from "next/navigation";
import { customerPage } from "@/lib/guard";
import { prisma } from "@/lib/prisma";
import { STATUS_LABELS, type OrderStatus } from "@/lib/constants";
import { formatInr, orderValue } from "@/lib/money";
import { PRICE_DISCLAIMER } from "@/lib/constants";
import Link from "next/link";
import { DiagnosisReport } from "@/components/diagnosis/DiagnosisReport";
import { OrderTimeline } from "@/components/ui/OrderTimeline";

export default async function AccountOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { customer } = await customerPage();
  const { id } = await params;
  const order = await prisma.order.findFirst({
    where: { id, customerId: customer.id },
    include: {
      device: { include: { brand: true } },
      variant: true,
      customDevice: true,
      address: true,
      pickupSlot: true,
      photos: true,
      statusHistory: { orderBy: { createdAt: "asc" } },
      priceHistory: { orderBy: { createdAt: "asc" } },
      payments: true,
      diagnosis: { include: { events: { orderBy: { createdAt: "asc" } } } },
    },
  });
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 lg:px-6">
      <Link href="/account" className="text-sm font-semibold text-royal">← My orders</Link>
      <h1 className="font-display mt-4 text-4xl">{order.orderNumber}</h1>
      <p className="mt-2 text-muted">{STATUS_LABELS[order.status as OrderStatus] || order.status}</p>
      <div className="glass mt-6 space-y-4 rounded-3xl p-6">
        <p className="font-semibold">
          {order.customDevice
            ? `${order.customDevice.brand} ${order.customDevice.model}`
            : `${order.device?.brand.name} ${order.device?.name}`}
        </p>
        <p>Quoted: {formatInr(order.estimatedPrice)}</p>
        <p>Current order price: {formatInr(orderValue(order))}</p>
        <p>Final: {order.finalPrice ? formatInr(order.finalPrice) : "Pending inspection"}</p>
        <p>Pickup: {order.pickupDate?.toLocaleDateString("en-IN")} · {order.pickupSlot?.label}</p>
        <p>Payment: {order.paymentStatus}</p>
        <p className="text-xs text-muted">{PRICE_DISCLAIMER}</p>
      </div>
      {order.diagnosis && (
        <div className="mt-6 rounded-3xl bg-white p-6">
          <h2 className="font-semibold">Device diagnosis</h2>
          <div className="mt-3">
            <DiagnosisReport
              diagnosis={{ ...order.diagnosis, imei: "" }}
              photos={order.photos}
            />
          </div>
        </div>
      )}
      <h2 className="mt-8 font-semibold">Order progress</h2>
      <div className="mt-3">
        <OrderTimeline status={order.status} />
      </div>
      <h2 className="mt-8 font-semibold">Status history</h2>
      <ol className="mt-3 space-y-2">
        {order.statusHistory.map((h) => (
          <li key={h.id} className="rounded-2xl bg-white px-4 py-3 text-sm">
            {h.oldStatus} → {h.newStatus} · {h.createdAt.toLocaleString("en-IN")}
          </li>
        ))}
        {!order.statusHistory.length && <li className="text-sm text-muted">History will appear as the order progresses.</li>}
      </ol>
      <h2 className="mt-8 font-semibold">Price history</h2>
      <ol className="mt-3 space-y-2">
        {order.priceHistory.map((h) => (
          <li key={h.id} className="rounded-2xl bg-white px-4 py-3 text-sm">
            {formatInr(h.oldPrice)} → {formatInr(h.newPrice)} · {h.changedBy} · {h.createdAt.toLocaleString("en-IN")}
            {h.reason ? ` · ${h.reason}` : ""}
          </li>
        ))}
        {!order.priceHistory.length && <li className="text-sm text-muted">No price revisions on this order.</li>}
      </ol>
    </div>
  );
}
