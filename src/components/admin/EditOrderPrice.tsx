"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatInr, orderValue } from "@/lib/money";

export function EditOrderPrice({ order }: { order: any }) {
  const router = useRouter();
  const current = orderValue(order);
  const [price, setPrice] = useState(String(current));
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <section className="rounded-2xl bg-white p-5">
      <h2 className="font-semibold">Edit pricing</h2>
      <p className="mt-1 text-sm text-muted">
        Authoritative order price is {formatInr(current)}. Catalogue changes do not overwrite this value.
      </p>
      <div className="mt-3 flex flex-col gap-3 md:flex-row">
        <input type="number" className="rounded-xl border px-3 py-2" value={price} onChange={(e) => setPrice(e.target.value)} />
        <input className="flex-1 rounded-xl border px-3 py-2" placeholder="Reason / comment" value={reason} onChange={(e) => setReason(e.target.value)} />
        <button
          disabled={busy}
          className="rounded-xl bg-navy px-4 py-2 text-white"
          onClick={async () => {
            setBusy(true);
            setError("");
            const res = await fetch(`/api/admin/orders/${order.id}/price`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ price: Number(price), reason }),
            });
            const data = await res.json();
            setBusy(false);
            if (!res.ok) {
              setError(data.error || "Could not update price");
              return;
            }
            setReason("");
            router.refresh();
          }}
        >
          Save price
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
      <ul className="mt-4 space-y-2 text-sm">
        {(order.priceHistory || []).map((h: any) => (
          <li key={h.id} className="rounded-xl bg-cream px-3 py-2">
            {formatInr(h.oldPrice)} → {formatInr(h.newPrice)} · {h.changedBy} · {new Date(h.createdAt).toLocaleString("en-IN")}
            {h.reason ? ` · ${h.reason}` : ""}
          </li>
        ))}
        {!(order.priceHistory || []).length && <li className="text-muted">No order-specific price changes yet.</li>}
      </ul>
    </section>
  );
}
