import { adminPage } from "@/lib/guard";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatInr } from "@/lib/money";
import { DashboardCharts } from "@/components/admin/DashboardCharts";
import { STATUS_LABELS, type OrderStatus } from "@/lib/constants";
import { StatCard } from "@/components/ui/CountUp";

function startOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export default async function AdminHome() {
  await adminPage("dashboard");
  const today = startOfDay();
  const week = new Date(today); week.setDate(week.getDate() - 7);
  const month = new Date(today); month.setDate(month.getDate() - 30);
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);

  const [
    totalCustomers,
    customersToday,
    customersWeek,
    customersMonth,
    totalOrders,
    ordersToday,
    ordersWeek,
    ordersMonth,
    pendingOrders,
    completedOrders,
    cancelledOrders,
    pickupPending,
    paymentPending,
    visitorsToday,
    loginsToday,
    recentOrders,
    recentCustomers,
    recentLogins,
    pendingPickup,
    pendingCustom,
    loginMethods,
    dailyVisitors,
    dailyLogins,
    dailyOrders,
  ] = await Promise.all([
    prisma.customer.count(),
    prisma.customer.count({ where: { createdAt: { gte: today } } }),
    prisma.customer.count({ where: { createdAt: { gte: week } } }),
    prisma.customer.count({ where: { createdAt: { gte: month } } }),
    prisma.order.count(),
    prisma.order.count({ where: { createdAt: { gte: today } } }),
    prisma.order.count({ where: { createdAt: { gte: week } } }),
    prisma.order.count({ where: { createdAt: { gte: month } } }),
    prisma.order.count({ where: { status: { notIn: ["PURCHASE_COMPLETED", "CANCELLED", "REJECTED"] } } }),
    prisma.order.count({ where: { status: { in: ["PAYMENT_COMPLETED", "PURCHASE_COMPLETED"] } } }),
    prisma.order.count({ where: { status: { in: ["CANCELLED", "REJECTED"] } } }),
    prisma.order.count({ where: { status: { in: ["PICKUP_PENDING", "PICKUP_ASSIGNED"] } } }),
    prisma.order.count({ where: { status: "PAYMENT_PENDING" } }),
    prisma.visitorEvent.groupBy({ by: ["visitorId"], where: { createdAt: { gte: today }, eventType: "PAGE_VIEW" } }).then((r) => r.length),
    prisma.loginEvent.count({ where: { createdAt: { gte: today }, loginStatus: "SUCCESS" } }),
    prisma.order.findMany({ include: { customer: true, device: { include: { brand: true } }, customDevice: true }, orderBy: { createdAt: "desc" }, take: 6 }),
    prisma.customer.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
    prisma.loginEvent.findMany({ include: { customer: true }, orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.order.findMany({ where: { status: { in: ["PICKUP_PENDING", "PICKUP_ASSIGNED"] } }, include: { customer: true }, take: 6, orderBy: { pickupDate: "asc" } }),
    prisma.customDevice.findMany({ where: { approvalStatus: "PENDING" }, include: { customer: true, order: true }, take: 6, orderBy: { createdAt: "desc" } }),
    prisma.loginEvent.groupBy({ by: ["loginMethod"], where: { loginStatus: "SUCCESS" }, _count: { _all: true } }),
    prisma.visitorEvent.findMany({ where: { eventType: "PAGE_VIEW", createdAt: { gte: week } }, select: { createdAt: true, visitorId: true } }),
    prisma.loginEvent.findMany({ where: { loginStatus: "SUCCESS", createdAt: { gte: week } }, select: { createdAt: true } }),
    prisma.order.findMany({ where: { createdAt: { gte: week } }, select: { createdAt: true, status: true } }),
  ]);

  function bucket(dates: Date[]) {
    const map = new Map<string, number>();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      map.set(d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }), 0);
    }
    for (const dt of dates) {
      const key = dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
      if (map.has(key)) map.set(key, (map.get(key) || 0) + 1);
    }
    return [...map.entries()].map(([name, count]) => ({ name, count }));
  }

  const uniqueDailyVisitors = (() => {
    const map = new Map<string, Set<string>>();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      map.set(d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }), new Set());
    }
    for (const row of dailyVisitors) {
      const key = row.createdAt.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
      map.get(key)?.add(row.visitorId);
    }
    return [...map.entries()].map(([name, set]) => ({ name, count: set.size }));
  })();

  const cards = [
    ["Total Customers", totalCustomers],
    ["New Customers Today", customersToday],
    ["New This Week", customersWeek],
    ["New This Month", customersMonth],
    ["Today's Visitors", visitorsToday],
    ["Today's Logins", loginsToday],
    ["Total Orders", totalOrders],
    ["Orders Today", ordersToday],
    ["Orders This Week", ordersWeek],
    ["Orders This Month", ordersMonth],
    ["Pending Orders", pendingOrders],
    ["Completed Orders", completedOrders],
    ["Cancelled Orders", cancelledOrders],
    ["Pickup Pending", pickupPending],
    ["Payment Pending", paymentPending],
  ] as const;

  return (
    <div>
      <h1 className="font-display text-3xl">Operations dashboard</h1>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map(([label, value]) => (
          <StatCard key={label} label={label} value={value} />
        ))}
      </div>

      <DashboardCharts
        visitors={uniqueDailyVisitors}
        logins={bucket(dailyLogins.map((x) => x.createdAt))}
        orders={bucket(dailyOrders.map((x) => x.createdAt))}
        methods={loginMethods.map((m) => ({ name: m.loginMethod, count: m._count._all }))}
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Panel title="Recent orders" href="/admin/orders">
          {recentOrders.map((o) => (
            <Link key={o.id} href={`/admin/orders/${o.id}`} className="block border-t py-2 text-sm">
              {o.orderNumber} · {o.customer.fullName || o.customer.mobile} · {STATUS_LABELS[o.status as OrderStatus] || o.status} · {formatInr(o.estimatedPrice)}
            </Link>
          ))}
        </Panel>
        <Panel title="Recent customers" href="/admin/customers">
          {recentCustomers.map((c) => (
            <Link key={c.id} href={`/admin/customers/${c.id}`} className="block border-t py-2 text-sm">
              {c.fullName || c.mobile || c.email} · {c.loginMethod || "—"}
            </Link>
          ))}
        </Panel>
        <Panel title="Recent login activity" href="/admin/logins">
          {recentLogins.map((l) => (
            <div key={l.id} className="border-t py-2 text-sm">
              {l.loginMethod} · {l.loginStatus} · {l.customer?.mobile || l.customer?.email || "Unknown"} · {l.createdAt.toLocaleString("en-IN")}
            </div>
          ))}
        </Panel>
        <Panel title="Pending pickup" href="/admin/orders?status=PICKUP_PENDING">
          {pendingPickup.map((o) => (
            <Link key={o.id} href={`/admin/orders/${o.id}`} className="block border-t py-2 text-sm">
              {o.orderNumber} · {o.customer.fullName || o.customer.mobile}
            </Link>
          ))}
        </Panel>
        <Panel title="Customer-submitted Others devices" href="/admin/others">
          {pendingCustom.map((d) => (
            <Link key={d.id} href={`/admin/others`} className="block border-t py-2 text-sm">
              {d.brand} {d.model} · {d.order.orderNumber}
            </Link>
          ))}
        </Panel>
        <p className="text-xs text-muted lg:col-span-2">
          Visitor counts are anonymous unless a customer logs in. Mobile/email is shown only after OTP verification.
          Yesterday window is available in Login Analytics. Seed date {yesterday.toLocaleDateString("en-IN")}.
        </p>
      </div>
    </div>
  );
}

function Panel({ title, href, children }: { title: string; href: string; children: React.ReactNode }) {
  return (
    <section className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">{title}</h2>
        <Link href={href} className="text-xs font-semibold text-royal">View</Link>
      </div>
      <div className="mt-2">{children}</div>
    </section>
  );
}
