"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ManageForm({ type, fields, defaults }: { type: string; fields: { name: string; label: string; type?: string }[]; defaults?: Record<string, string> }) {
  const router = useRouter();
  const [form, setForm] = useState<Record<string, string>>(defaults || {});

  return (
    <form
      className="mt-4 grid gap-3 rounded-2xl bg-white p-4 md:grid-cols-3"
      onSubmit={async (e) => {
        e.preventDefault();
        await fetch("/api/admin/manage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type, ...form }),
        });
        setForm(defaults || {});
        router.refresh();
      }}
    >
      {fields.map((f) => (
        <input
          key={f.name}
          type={f.type || "text"}
          placeholder={f.label}
          value={form[f.name] || ""}
          onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
          className="rounded-xl border px-3 py-2"
        />
      ))}
      <button className="rounded-xl bg-navy px-4 py-2 font-semibold text-white">Save</button>
    </form>
  );
}
