"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function OrdersFilter() {
  const router = useRouter();
  const sp = useSearchParams();

  function go(form: FormData) {
    const q = String(form.get("q") || "");
    const status = String(form.get("status") || "");
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status) params.set("status", status);
    router.push(`/admin/orders?${params.toString()}`);
  }

  return (
    <form
      className="mt-4 flex flex-col gap-2 md:flex-row"
      action={(form) => go(form)}
    >
        <input
          name="q"
          defaultValue={sp.get("q") || ""}
          placeholder="Search name, mobile, email, order ID, IMEI, brand, model"
          className="flex-1 rounded-xl border bg-white px-4 py-2"
        />
      <select name="status" defaultValue={sp.get("status") || ""} className="rounded-xl border bg-white px-3 py-2">
        <option value="">All statuses</option>
        {["NEW_LEAD","CONTACTED","PICKUP_PENDING","PICKUP_ASSIGNED","EXECUTIVE_ON_THE_WAY","DEVICE_COLLECTED","UNDER_INSPECTION","PRICE_REVISED","CUSTOMER_ACCEPTED","PAYMENT_PENDING","PAYMENT_COMPLETED","PURCHASE_COMPLETED","CANCELLED","REJECTED"].map((s) => (
          <option key={s} value={s}>{s.replaceAll("_", " ")}</option>
        ))}
      </select>
      <button className="rounded-xl bg-navy px-4 py-2 font-semibold text-white">Filter</button>
    </form>
  );
}
