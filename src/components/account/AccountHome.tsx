"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CustomerDashboardCards, CustomerOrderCard } from "./CustomerDashboard";

export function AccountHome({ customer, orders }: { customer: any; orders: any[] }) {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 lg:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="kicker">Customer dashboard</p>
          <h1 className="font-display mt-2 text-4xl">Hello{customer.fullName ? `, ${customer.fullName}` : ""}</h1>
        </div>
        <button
          className="text-sm font-semibold"
          onClick={async () => {
            await fetch("/api/auth/customer/logout", { method: "POST" });
            router.push("/login");
            router.refresh();
          }}
        >
          Sign out
        </button>
      </div>

      <div className="mt-8">
        <CustomerDashboardCards orders={orders} />
      </div>

      <section className="card-3d mt-8 rounded-2xl bg-white p-6">
        <h2 className="font-display text-2xl">My profile</h2>
        <dl className="mt-4 grid gap-3 text-sm md:grid-cols-2">
          <div>
            <span className="text-muted">Customer ID</span>
            <div className="font-semibold">{customer.id}</div>
          </div>
          <div>
            <span className="text-muted">Mobile</span>
            <div className="font-semibold">{customer.mobile || "—"}</div>
          </div>
          <div>
            <span className="text-muted">Email</span>
            <div className="font-semibold">{customer.email || "—"}</div>
          </div>
          <div>
            <span className="text-muted">Login method</span>
            <div className="font-semibold">{customer.loginMethod || "—"}</div>
          </div>
        </dl>
      </section>

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl">My orders</h2>
          <Link href="/sell" className="font-semibold text-royal">
            Sell another device
          </Link>
        </div>
        <div className="mt-4 grid gap-4">
          {orders.map((o) => (
            <CustomerOrderCard key={o.id} order={o} href={`/account/orders/${o.id}`} />
          ))}
          {!orders.length && (
            <p className="card-3d rounded-2xl bg-white p-8 text-muted">No orders yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
