import { prisma } from "@/lib/prisma";
import { PricingEditor } from "@/components/admin/PricingEditor";
import { adminPage } from "@/lib/guard";

export default async function PricingPage() {
  await adminPage("pricing");
  const [rules, variants, history] = await Promise.all([
    prisma.pricingRule.findMany({ orderBy: [{ category: "asc" }, { key: "asc" }] }),
    prisma.deviceVariant.findMany({
      include: { pricing: true, device: { include: { brand: true } }, bands: true },
      take: 80,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.pricingHistory.findMany({ orderBy: { createdAt: "desc" }, take: 40 }),
  ]);
  return (
    <div>
      <h1 className="font-display text-3xl">Price management</h1>
      <p className="mt-2 text-sm text-muted">Catalogue prices apply to new quotes only. Existing orders keep their quoted/current price until an authorised user edits that order.</p>
      <PricingEditor rules={rules} variants={JSON.parse(JSON.stringify(variants))} />
      <section className="mt-8 rounded-2xl bg-white p-5">
        <h2 className="font-semibold">Pricing history</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {history.map((h) => (
            <li key={h.id}>
              {h.deviceLabel} {h.configuration} {h.conditionLabel}: ₹{h.oldPrice} → ₹{h.newPrice} · {h.changedBy} · {h.createdAt.toLocaleString("en-IN")}
              {h.reason ? ` · ${h.reason}` : ""}
            </li>
          ))}
          {!history.length && <li className="text-muted">No catalogue price changes recorded yet.</li>}
        </ul>
      </section>
    </div>
  );
}
