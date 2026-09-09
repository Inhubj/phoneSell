import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { STATUS_LABELS, type OrderStatus } from "@/lib/constants";
import { formatInr } from "@/lib/money";
import { OrdersFilter } from "@/components/admin/OrdersFilter";
import { adminPage } from "@/lib/guard";

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  await adminPage("orders");
  const q = sp.q?.trim() || "";
  const status = sp.status || "";

  const orders = await prisma.order.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(q
        ? {
            OR: [
              { orderNumber: { contains: q } },
              { customer: { fullName: { contains: q } } },
              { customer: { mobile: { contains: q } } },
              { customer: { email: { contains: q } } },
              { customerId: { contains: q } },
              { device: { name: { contains: q } } },
              { device: { brand: { name: { contains: q } } } },
              { inspection: { imei1: { contains: q } } },
            ],
          }
        : {}),
    },
    include: {
      customer: true,
      device: { include: { brand: true } },
      variant: true,
      address: true,
      customDevice: true,
      pickupSlot: true,
      assignment: { include: { executive: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl">Orders</h1>
        <div className="flex gap-3 text-sm font-semibold">
          <Link href="/admin/orders/new" className="rounded-full bg-navy px-4 py-2 text-white">+ Add manual order</Link>
          <a href="/api/admin/export?format=csv">CSV</a>
          <a href="/api/admin/export?format=xlsx">Excel</a>
        </div>
      </div>
      <OrdersFilter />
      <div className="mt-4 overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="min-w-[1100px] w-full text-left text-sm">
          <thead className="bg-cream text-xs uppercase tracking-wide text-muted">
            <tr>
              {["Order ID","Date","Customer","Mobile","Brand","Model","RAM","Storage","Condition","Est.","Final","Area","Pickup","Slot","Executive","Status","Payment"].map((h) => (
                <th key={h} className="px-3 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t">
                <td className="px-3 py-3 font-semibold">
                  <Link href={`/admin/orders/${o.id}`} className="text-royal">{o.orderNumber}</Link>
                </td>
                <td className="px-3 py-3">{o.createdAt.toLocaleDateString("en-IN")}</td>
                <td className="px-3 py-3">{o.customer.fullName}</td>
                <td className="px-3 py-3">{o.customer.mobile}</td>
                <td className="px-3 py-3">{o.device?.brand.name || o.customDevice?.brand || "—"}</td>
                <td className="px-3 py-3">{o.device?.name || o.customDevice?.model || "Custom"}</td>
                <td className="px-3 py-3">{o.variant?.ramGb ?? o.customDevice?.ram ?? "—"}</td>
                <td className="px-3 py-3">{o.variant?.storageGb ?? o.customDevice?.storage ?? "—"}</td>
                <td className="px-3 py-3 max-w-[160px] truncate">{o.conditionSummary}</td>
                <td className="px-3 py-3">{formatInr(o.estimatedPrice)}</td>
                <td className="px-3 py-3">{o.finalPrice ? formatInr(o.finalPrice) : "—"}</td>
                <td className="px-3 py-3">{o.address?.area}</td>
                <td className="px-3 py-3">{o.pickupDate?.toLocaleDateString("en-IN")}</td>
                <td className="px-3 py-3">{o.pickupSlot?.label}</td>
                <td className="px-3 py-3">{o.assignment?.executive.name || "—"}</td>
                <td className="px-3 py-3">{STATUS_LABELS[o.status as OrderStatus] || o.status}</td>
                <td className="px-3 py-3">{o.paymentStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
