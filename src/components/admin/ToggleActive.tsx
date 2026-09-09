"use client";

import { useRouter } from "next/navigation";

export function ToggleActive({ type, id, isActive, extra }: { type: string; id: string; isActive: boolean; extra?: Record<string, unknown> }) {
  const router = useRouter();
  return (
    <button
      className={`rounded-full px-3 py-1 text-xs font-semibold ${isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
      onClick={async () => {
        await fetch("/api/admin/manage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type, id, isActive: !isActive, ...extra }),
        });
        router.refresh();
      }}
    >
      {isActive ? "Active" : "Disabled"}
    </button>
  );
}
