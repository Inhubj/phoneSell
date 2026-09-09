import { prisma } from "@/lib/prisma";
import { AnalyticsCharts } from "@/components/admin/AnalyticsCharts";
import { formatInr } from "@/lib/money";
import { adminPage } from "@/lib/guard";

export default async function AnalyticsPage() {
  await adminPage("analytics");
  const now = new Date();
  const day = new Date(now); day.setHours(0, 0, 0, 0);
  const week = new Date(day); week.setDate(week.getDate() - 7);
  const month = new Date(day); month.setDate(month.getDate() - 30);

  const [daily, weekly, monthly, completed, cancelled, total, brands, models, execs, areas, avg, sum, uniqueVisitors, loggedIn, newRegs, returning, loginAttempts, loginSuccess, ordersStarted, deviceCats] = await Promise.all([
    prisma.order.count({ where: { createdAt: { gte: day } } }),
    prisma.order.count({ where: { createdAt: { gte: week } } }),
    prisma.order.count({ where: { createdAt: { gte: month } } }),
    prisma.order.count({ where: { status: { in: ["PAYMENT_COMPLETED", "PURCHASE_COMPLETED"] } } }),
    prisma.order.count({ where: { status: { in: ["CANCELLED", "REJECTED"] } } }),
    prisma.order.count(),
    prisma.order.groupBy({ by: ["brandId"], _count: { _all: true }, orderBy: { _count: { brandId: "desc" } }, take: 8 }),
    prisma.order.groupBy({ by: ["deviceId"], _count: { _all: true }, orderBy: { _count: { deviceId: "desc" } }, take: 8 }),
    prisma.executiveAssignment.groupBy({ by: ["executiveId"], _count: { _all: true }, orderBy: { _count: { executiveId: "desc" } }, take: 8 }),
    prisma.pickupAddress.groupBy({ by: ["area"], _count: { _all: true }, orderBy: { _count: { area: "desc" } }, take: 10 }),
    prisma.order.aggregate({ _avg: { estimatedPrice: true, finalPrice: true } }),
    prisma.order.aggregate({
      _sum: { finalPrice: true },
      where: { status: { in: ["PAYMENT_COMPLETED", "PURCHASE_COMPLETED"] } },
    }),
    prisma.visitorEvent.groupBy({ by: ["visitorId"], where: { eventType: "PAGE_VIEW", createdAt: { gte: week } } }).then((r) => r.length),
    prisma.customer.count({ where: { lastLoginAt: { gte: week } } }),
    prisma.customer.count({ where: { createdAt: { gte: week } } }),
    prisma.customer.count({ where: { loginCount: { gt: 1 } } }),
    prisma.loginEvent.count({ where: { createdAt: { gte: week } } }),
    prisma.loginEvent.count({ where: { createdAt: { gte: week }, loginStatus: "SUCCESS" } }),
    prisma.visitorEvent.count({ where: { eventType: "ORDER_STARTED", createdAt: { gte: week } } }),
    prisma.order.groupBy({ by: ["deviceType"], _count: { _all: true } }),
  ]);

  const brandRows = await prisma.brand.findMany({ where: { id: { in: brands.map((b) => b.brandId).filter(Boolean) as string[] } } });
  const deviceRows = await prisma.device.findMany({
    where: { id: { in: models.map((m) => m.deviceId).filter((id): id is string => Boolean(id)) } },
  });
  const execRows = await prisma.pickupExecutive.findMany({ where: { id: { in: execs.map((e) => e.executiveId) } } });

  const conversion = total ? Math.round((completed / total) * 100) : 0;

  return (
    <div>
      <h1 className="font-display text-3xl">Analytics</h1>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Daily leads", daily],
          ["Weekly leads", weekly],
          ["Monthly leads", monthly],
          ["Conversion rate", `${conversion}%`],
          ["Unique visitors (7d)", uniqueVisitors],
          ["Logged-in customers (7d)", loggedIn],
          ["New registrations (7d)", newRegs],
          ["Returning customers", returning],
          ["Login attempts (7d)", loginAttempts],
          ["Successful logins (7d)", loginSuccess],
          ["Orders started (7d)", ordersStarted],
          ["Orders completed", completed],
          ["Cancelled pickups", cancelled],
          ["Average estimate", formatInr(Math.round(avg._avg.estimatedPrice || 0))],
          ["Total purchase amount", formatInr(sum._sum.finalPrice || 0)],
        ].map(([l, v]) => (
          <div key={l} className="rounded-2xl bg-white p-4">
            <div className="text-xs uppercase text-muted">{l}</div>
            <div className="mt-1 text-2xl font-semibold">{v}</div>
          </div>
        ))}
      </div>
      <AnalyticsCharts
        brands={brands.map((b) => ({ name: brandRows.find((x) => x.id === b.brandId)?.name || "Unknown", count: b._count._all }))}
        models={models.map((m) => ({ name: deviceRows.find((x) => x.id === m.deviceId)?.name || "Unknown", count: m._count._all }))}
        execs={execs.map((e) => ({ name: execRows.find((x) => x.id === e.executiveId)?.name || "Unknown", count: e._count._all }))}
        areas={areas.map((a) => ({ name: a.area, count: a._count._all }))}
      />
      <section className="mt-8 rounded-2xl bg-white p-5">
        <h2 className="font-semibold">Device categories</h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4 text-sm">
          {deviceCats.map((d) => (
            <li key={d.deviceType}>{d.deviceType}: {d._count._all}</li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-muted">Anonymous visitors are counted without mobile or email until they verify OTP.</p>
      </section>
    </div>
  );
}
