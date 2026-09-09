import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { adminPage } from "@/lib/guard";
import { CustomerDashboardCards, CustomerOrderCard } from "@/components/account/CustomerDashboard";
import { DeleteCustomerButton } from "@/components/admin/DeleteCustomerButton";

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { session } = await adminPage("customers");
  const isSuperAdmin = session.role === "SUPER_ADMIN";
  const { id } = await params;
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      orders: {
        include: { device: { include: { brand: true } }, variant: true, customDevice: true },
        orderBy: { createdAt: "desc" },
      },
      loginEvents: { orderBy: { createdAt: "desc" }, take: 30 },
      customDevices: true,
    },
  });
  if (!customer) notFound();

  const orders = JSON.parse(JSON.stringify(customer.orders));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="kicker">Customer dashboard</p>
          <h1 className="font-display mt-2 text-3xl">{customer.fullName || customer.mobile || "Customer"}</h1>
          <p className="mt-1 text-sm text-muted">{customer.mobile || customer.email || customer.id}</p>
        </div>
        {isSuperAdmin && (
          <DeleteCustomerButton
            id={customer.id}
            label={customer.fullName || customer.mobile || customer.email || customer.id}
            orderCount={customer.orders.length}
          />
        )}
      </div>

      <CustomerDashboardCards orders={orders} />

      <section>
        <h2 className="font-display text-2xl">Orders</h2>
        <div className="mt-4 grid gap-4">
          {orders.map((o: { id: string }) => (
            <CustomerOrderCard key={o.id} order={o} href={`/admin/orders/${o.id}`} />
          ))}
          {!orders.length && <p className="card-3d rounded-2xl bg-white p-6 text-muted">No orders yet.</p>}
        </div>
      </section>

      <section className="card-3d rounded-2xl bg-white p-5 text-sm">
        <h2 className="font-semibold">Profile</h2>
        <p className="mt-3">ID: {customer.id}</p>
        <p>Mobile: {customer.mobile || "—"}</p>
        <p>Email: {customer.email || "—"}</p>
        <p>Method: {customer.loginMethod}</p>
        <p>Logins: {customer.loginCount}</p>
        <p>Created: {customer.createdAt.toLocaleString("en-IN")}</p>
        <p>Last activity: {customer.lastLoginAt?.toLocaleString("en-IN") || "—"}</p>
        <p>IP: {customer.lastIp || "—"}</p>
        <p>Device/browser: {customer.userAgent || "—"}</p>
      </section>

      <section className="card-3d rounded-2xl bg-white p-5">
        <h2 className="font-semibold">Login history</h2>
        {customer.loginEvents.map((e) => (
          <p key={e.id} className="mt-1 text-sm">
            {e.createdAt.toLocaleString("en-IN")} · {e.loginMethod} · {e.loginStatus}
          </p>
        ))}
        {!customer.loginEvents.length && <p className="mt-2 text-sm text-muted">No login events.</p>}
      </section>

      <Link href="/admin/customers" className="inline-block text-sm font-semibold text-royal">
        ← All customers
      </Link>
    </div>
  );
}
