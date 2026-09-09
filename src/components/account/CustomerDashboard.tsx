"use client";

import Link from "next/link";
import { STATUS_LABELS, type OrderStatus } from "@/lib/constants";
import { formatInr, orderValue } from "@/lib/money";
import { orderDeviceLabel, paymentLabel } from "@/lib/order-display";
import { CountUp } from "@/components/ui/CountUp";

export function CustomerDashboardCards({ orders }: { orders: any[] }) {
  const latest = orders[0];
  const value = latest ? orderValue(latest) : 0;
  const pickup = latest ? STATUS_LABELS[latest.status as OrderStatus] || latest.pickupStatus : "—";

  const stats = [
    { label: "My Orders", value: String(orders.length), hint: orders.length === 1 ? "order" : "orders" },
    { label: "Current Order", value: latest?.orderNumber || "None yet", hint: latest ? orderDeviceLabel(latest) : "No active sale" },
    {
      label: "Estimated Value",
      value: latest ? null : "—",
      hint: latest ? "Subject to inspection" : "After you add a phone",
      amount: latest ? value : null,
    },
    { label: "Pickup Status", value: pickup, hint: latest?.pickupStatus && latest.pickupStatus !== pickup ? String(latest.pickupStatus).replace(/_/g, " ") : "Latest order" },
    { label: "Payment Status", value: paymentLabel(latest?.paymentStatus), hint: "Recorded on the order" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {stats.map((card) => (
        <article key={card.label} className="card-3d rounded-2xl bg-white p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gold">{card.label}</p>
          <p className="mt-3 font-display text-2xl leading-snug text-navy">
            {card.amount != null ? <CountUp prefix="₹" value={card.amount} /> : card.value}
          </p>
          <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted">{card.hint}</p>
        </article>
      ))}
    </div>
  );
}

export function CustomerOrderCard({
  order,
  href,
}: {
  order: any;
  href: string;
}) {
  return (
    <Link href={href} className="card-3d block rounded-2xl bg-white p-5 md:p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gold">Order</p>
      <p className="mt-2 font-display text-xl text-navy md:text-2xl">{order.orderNumber}</p>
      <p className="mt-2 text-sm font-medium text-ink">{orderDeviceLabel(order)}</p>
      <p className="mt-3 text-sm text-navy">
        Estimated Value: <span className="font-semibold">{formatInr(orderValue(order))}</span>
      </p>
      <p className="mt-2 text-sm font-semibold text-royal">
        {STATUS_LABELS[order.status as OrderStatus] || order.status}
      </p>
    </Link>
  );
}
