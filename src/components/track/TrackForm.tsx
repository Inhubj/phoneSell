"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { BUSINESS } from "@/lib/constants";

export function TrackForm() {
  const params = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(params.get("order") || "");
  const [mobile, setMobile] = useState("");
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setData(null);
    const res = await fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderNumber, mobile }),
    });
    const json = await res.json();
    setBusy(false);
    if (!res.ok) setError(json.error || "Not found");
    else setData(json);
  }

  return (
    <div className="panel rounded-[1.4rem] p-6 md:p-10">
      <form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-2">
        <input className="rounded-2xl border px-4 py-3" placeholder="RMT-2026-000123" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} />
        <input className="rounded-2xl border px-4 py-3" placeholder="10-digit mobile" value={mobile} onChange={(e) => setMobile(e.target.value)} />
        <button disabled={busy} className="btn-premium rounded-full bg-navy px-6 py-3 font-semibold text-white md:col-span-2">
          {busy ? "Searching..." : "Track order"}
          <span className="btn-arrow" aria-hidden>→</span>
        </button>
      </form>
      {error && <p className="mt-4 text-sm text-red-700">{error}</p>}
      {data && (
        <div className="mt-8">
          <p className="font-semibold">{data.orderNumber} · {data.phone}</p>
          <p className="text-sm text-muted">Status: {data.status}</p>
          <ol className="mt-6 space-y-3">
            {data.steps.map((s: { label: string; done: boolean; current: boolean }) => (
              <li key={s.label} className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${s.current ? "bg-navy text-white" : s.done ? "bg-gold/20" : "bg-cream"}`}>
                <span className={`grid h-6 w-6 place-items-center rounded-full text-xs ${s.current ? "pulse-marker bg-gold text-navy" : s.done ? "bg-navy text-white" : "border"}`}>
                  {s.done && !s.current ? "✓" : s.current ? "●" : "○"}
                </span>
                {s.label}
              </li>
            ))}
          </ol>
          {data.finalPrice ? <p className="mt-4 font-semibold">Final price: ₹{data.finalPrice.toLocaleString("en-IN")}</p> : null}
          <a href={BUSINESS.telHref} className="mt-6 inline-block font-semibold">Call {BUSINESS.phoneDisplay}</a>
        </div>
      )}
    </div>
  );
}
