"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function PricingEditor({ rules, variants }: { rules: any[]; variants: any[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState("");

  async function save(type: string, payload: Record<string, unknown>) {
    setBusy(true);
    await fetch("/api/admin/manage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, ...payload }),
    });
    setBusy(false);
    setSaved("✓ Pricing Updated Successfully");
    window.setTimeout(() => setSaved(""), 2500);
    router.refresh();
  }

  return (
    <div className="mt-6 space-y-8">
      {saved && <p className="rounded-xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">{saved}</p>}
      <section className="rounded-2xl bg-white p-5">
        <h2 className="font-semibold">Condition & component adjustments</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-muted"><th>Category</th><th>Rule</th><th>Amount (₹)</th><th></th></tr></thead>
            <tbody>
              {rules.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="py-2">{r.category}</td>
                  <td>{r.label}</td>
                  <td>
                    <input defaultValue={r.amount} id={`amt-${r.id}`} className="w-28 rounded border px-2 py-1" />
                  </td>
                  <td>
                    <button
                      disabled={busy}
                      className="text-royal"
                      onClick={() => {
                        const amount = Number((document.getElementById(`amt-${r.id}`) as HTMLInputElement).value);
                        save("rule", { id: r.id, amount });
                      }}
                    >
                      Update
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="rounded-2xl bg-white p-5">
        <h2 className="font-semibold">Device variant base prices</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-muted"><th>Brand</th><th>Model</th><th>RAM</th><th>Storage</th><th>Base</th><th></th></tr></thead>
            <tbody>
              {variants.map((v) => (
                <tr key={v.id} className="border-t">
                  <td className="py-2">{v.device.brand.name}</td>
                  <td>{v.device.name}</td>
                  <td>{v.ramGb}</td>
                  <td>{v.storageGb}</td>
                  <td>
                    <input defaultValue={v.pricing?.basePrice} id={`bp-${v.pricing?.id}`} className="w-28 rounded border px-2 py-1" />
                  </td>
                  <td>
                    {v.pricing && (
                      <button
                        className="text-royal"
                        onClick={() => {
                          const basePrice = Number((document.getElementById(`bp-${v.pricing.id}`) as HTMLInputElement).value);
                          save("pricing", { id: v.pricing.id, basePrice, reason: "Admin catalogue update" });
                        }}
                      >
                        Update
                      </button>
                    )}
                    <div className="mt-2 flex gap-1">
                      <input placeholder="Good/Fair" id={`band-c-${v.id}`} className="w-20 rounded border px-1 py-1 text-xs" />
                      <input placeholder="₹" id={`band-p-${v.id}`} className="w-16 rounded border px-1 py-1 text-xs" />
                      <button
                        className="text-xs text-royal"
                        onClick={() => {
                          const conditionLabel = (document.getElementById(`band-c-${v.id}`) as HTMLInputElement).value;
                          const price = Number((document.getElementById(`band-p-${v.id}`) as HTMLInputElement).value);
                          save("pricingBand", { variantId: v.id, conditionLabel, price });
                        }}
                      >
                        Add condition price
                      </button>
                    </div>
                    {(v.bands || []).map((b: any) => (
                      <div key={b.id} className="text-xs text-muted">{b.conditionLabel}: ₹{b.price}</div>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
