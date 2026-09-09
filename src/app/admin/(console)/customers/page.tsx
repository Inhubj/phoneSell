import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { adminPage } from "@/lib/guard";
import { DeleteCustomerButton } from "@/components/admin/DeleteCustomerButton";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const { session } = await adminPage("customers");
  const isSuperAdmin = session.role === "SUPER_ADMIN";
  const q = sp.q?.trim() || "";
  const customers = await prisma.customer.findMany({
    where: q
      ? {
          OR: [
            { id: { contains: q } },
            { mobile: { contains: q } },
            { email: { contains: q } },
            { fullName: { contains: q } },
            { orders: { some: { orderNumber: { contains: q } } } },
          ],
        }
      : {},
    include: { _count: { select: { orders: true } } },
    orderBy: { lastLoginAt: "desc" },
    take: 200,
  });

  return (
    <div>
      <h1 className="font-display text-3xl">Customers</h1>
      <form className="mt-4">
        <input name="q" defaultValue={q} placeholder="Customer ID, mobile, email, order ID" className="w-full rounded-xl border px-4 py-2 md:w-96" />
      </form>
      <div className="mt-4 overflow-x-auto rounded-2xl bg-white">
        <table className="min-w-[900px] w-full text-left text-sm">
          <thead className="bg-cream text-xs uppercase text-muted">
            <tr>
              {["Customer", "Mobile", "Email", "Method", "First login", "Last login", "Logins", "Orders", "Status", ...(isSuperAdmin ? ["Actions"] : [])].map((h) => (
                <th key={h} className="px-3 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="px-3 py-3">
                  <Link href={`/admin/customers/${c.id}`} className="font-semibold text-royal">{c.fullName || c.id}</Link>
                </td>
                <td className="px-3 py-3">{c.mobile || "—"}</td>
                <td className="px-3 py-3">{c.email || "—"}</td>
                <td className="px-3 py-3">{c.loginMethod === "EMAIL" ? "Email OTP" : c.loginMethod === "MOBILE" ? "Mobile OTP" : c.loginMethod || "—"}</td>
                <td className="px-3 py-3">{c.firstLoginAt?.toLocaleString("en-IN") || "—"}</td>
                <td className="px-3 py-3">{c.lastLoginAt?.toLocaleString("en-IN") || "—"}</td>
                <td className="px-3 py-3">{c.loginCount}</td>
                <td className="px-3 py-3">{c._count.orders}</td>
                <td className="px-3 py-3">{c.status}</td>
                {isSuperAdmin && (
                  <td className="px-3 py-3">
                    <DeleteCustomerButton
                      id={c.id}
                      label={c.fullName || c.mobile || c.email || c.id}
                      orderCount={c._count.orders}
                    />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
