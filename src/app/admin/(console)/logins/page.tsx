import { prisma } from "@/lib/prisma";
import { adminPage } from "@/lib/guard";

function rangeFrom(filter?: string, from?: string, to?: string) {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  if (from || to) {
    return {
      gte: from ? new Date(from) : undefined,
      lte: to ? new Date(to) : undefined,
    };
  }
  if (filter === "yesterday") {
    const y = new Date(start);
    y.setDate(y.getDate() - 1);
    return { gte: y, lt: start };
  }
  if (filter === "7") {
    const d = new Date(start);
    d.setDate(d.getDate() - 7);
    return { gte: d };
  }
  if (filter === "90" || filter === "3m") {
    const d = new Date(start);
    d.setDate(d.getDate() - 90);
    return { gte: d };
  }
  return { gte: start };
}

export default async function LoginsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  await adminPage("analytics");
  const createdAt = rangeFrom(sp.filter, sp.from, sp.to);
  const events = await prisma.loginEvent.findMany({
    where: { createdAt },
    include: { customer: true },
    orderBy: { createdAt: "desc" },
    take: 300,
  });
  const customers = await prisma.customer.findMany({
    where: { lastLoginAt: createdAt },
    orderBy: { lastLoginAt: "desc" },
    take: 200,
  });

  return (
    <div>
      <h1 className="font-display text-3xl">Customer login analytics</h1>
      <form method="get" className="mt-4 flex flex-wrap gap-2 text-sm">
        {[
          ["", "Today"],
          ["yesterday", "Yesterday"],
          ["7", "Last 7 days"],
          ["30", "Last 30 days"],
          ["90", "Last 3 months"],
        ].map(([v, l]) => (
          <a key={l} href={`/admin/logins?filter=${v}`} className="rounded-full bg-white px-3 py-1">{l}</a>
        ))}
        <input type="date" name="from" className="rounded-xl border px-2 py-1" />
        <input type="date" name="to" className="rounded-xl border px-2 py-1" />
        <button className="rounded-xl bg-navy px-3 py-1 text-white">Custom range</button>
      </form>
      <div className="mt-4 overflow-x-auto rounded-2xl bg-white">
        <table className="min-w-[1000px] w-full text-left text-sm">
          <thead className="bg-cream text-xs uppercase text-muted">
            <tr>
              {["Customer", "Mobile", "Email", "Login Method", "First Login", "Last Login", "Total Logins"].map((h) => (
                <th key={h} className="px-3 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="px-3 py-3">{c.fullName || c.id}</td>
                <td className="px-3 py-3">{c.mobile || "—"}</td>
                <td className="px-3 py-3">{c.email || "—"}</td>
                <td className="px-3 py-3">{c.loginMethod === "EMAIL" ? "Email OTP" : "Mobile OTP"}</td>
                <td className="px-3 py-3">{c.firstLoginAt?.toLocaleString("en-IN")}</td>
                <td className="px-3 py-3">{c.lastLoginAt?.toLocaleString("en-IN")}</td>
                <td className="px-3 py-3">{c.loginCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h2 className="mt-8 font-semibold">Login events</h2>
      <ul className="mt-3 space-y-2 text-sm">
        {events.map((e) => (
          <li key={e.id} className="rounded-xl bg-white p-3">
            {e.createdAt.toLocaleString("en-IN")} · {e.loginMethod} · {e.loginStatus} · {e.customer?.mobile || e.customer?.email || "unverified attempt"}
          </li>
        ))}
      </ul>
    </div>
  );
}
