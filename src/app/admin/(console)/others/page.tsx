import { prisma } from "@/lib/prisma";
import { ApproveCustom } from "@/components/admin/ApproveCustom";
import { adminPage } from "@/lib/guard";

export default async function OthersPage() {
  await adminPage("custom_devices");
  const rows = await prisma.customDevice.findMany({
    include: { customer: true, order: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return (
    <div>
      <h1 className="font-display text-3xl">Others / manual models</h1>
      <p className="mt-2 text-sm text-muted">Review customer-submitted devices and optionally add approved models to the catalogue.</p>
      <div className="mt-6 space-y-4">
        {rows.map((r) => (
          <article key={r.id} className="rounded-2xl bg-white p-5">
            <div className="font-semibold">{r.brand} {r.model} · {r.deviceType}</div>
            <p className="text-sm text-muted">{r.ram} / {r.storage} / {r.processor} · {r.configuration}</p>
            <p className="text-sm">Order {r.order.orderNumber} · {r.customer.mobile || r.customer.email} · {r.approvalStatus}</p>
            <p className="text-sm">{r.description}</p>
            <ApproveCustom id={r.id} status={r.approvalStatus} />
          </article>
        ))}
      </div>
    </div>
  );
}
