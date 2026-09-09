"use client";

import { useRouter } from "next/navigation";

export function ApproveCustom({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  async function act(approvalStatus: string, addToCatalog = false) {
    await fetch("/api/admin/manage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "customDevice", id, approvalStatus, addToCatalog }),
    });
    router.refresh();
  }
  return (
    <div className="mt-3 flex gap-2 text-sm">
      <button className="rounded-full bg-navy px-3 py-1 text-white" onClick={() => act("APPROVED")}>Approve</button>
      <button className="rounded-full border px-3 py-1" onClick={() => act("APPROVED", true)}>Approve + add to catalogue</button>
      <button className="rounded-full border px-3 py-1" onClick={() => act("REJECTED")}>Reject</button>
      <span className="self-center text-xs text-muted">{status}</span>
    </div>
  );
}
