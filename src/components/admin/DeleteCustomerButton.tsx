"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteCustomerButton({
  id,
  label,
  orderCount,
}: {
  id: string;
  label: string;
  orderCount: number;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onDelete() {
    const who = label || "this customer";
    const extra = orderCount
      ? ` This will also delete ${orderCount} order${orderCount === 1 ? "" : "s"}.`
      : "";
    if (!window.confirm(`Delete ${who}?${extra} This cannot be undone.`)) return;
    setBusy(true);
    const res = await fetch(`/api/admin/customers/${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      window.alert(data.error || "Could not delete customer");
      return;
    }
    router.push("/admin/customers");
    router.refresh();
  }

  return (
    <button
      type="button"
      disabled={busy}
      onClick={onDelete}
      className="text-sm font-semibold text-red-700 hover:text-red-800 disabled:opacity-50"
    >
      {busy ? "Deleting…" : "Delete"}
    </button>
  );
}
