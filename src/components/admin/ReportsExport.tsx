"use client";

import { useState } from "react";

const KINDS = [
  ["orders", "Order report"],
  ["customers", "Customer report"],
  ["logins", "Login report"],
  ["devices", "Device/model report"],
  ["pickups", "Pickup report"],
  ["payments", "Payment report"],
] as const;

export function ReportsExport() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const range = `${from ? `&from=${from}` : ""}${to ? `&to=${to}` : ""}`;

  return (
    <div>
      <div className="mt-4 flex flex-wrap gap-3 text-sm">
        <label>
          From
          <input type="date" className="ml-2 rounded-xl border px-3 py-2" value={from} onChange={(e) => setFrom(e.target.value)} />
        </label>
        <label>
          To
          <input type="date" className="ml-2 rounded-xl border px-3 py-2" value={to} onChange={(e) => setTo(e.target.value)} />
        </label>
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {KINDS.map(([kind, label]) => (
          <div key={kind} className="rounded-2xl bg-white p-4">
            <div className="font-semibold">{label}</div>
            <div className="mt-2 flex gap-3 text-sm">
              <a className="text-royal" href={`/api/admin/reports?kind=${kind}&format=csv${range}`}>CSV</a>
              <a className="text-royal" href={`/api/admin/reports?kind=${kind}&format=xlsx${range}`}>Excel</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
