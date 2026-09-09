"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ORDER_STATUSES, STATUS_LABELS } from "@/lib/constants";

export function ManualOrderForm() {
  const router = useRouter();
  const [areas, setAreas] = useState<any[]>([]);
  const [slots, setSlots] = useState<any[]>([]);
  const [executives, setExecutives] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    mobile: "",
    email: "",
    deviceType: "PHONE",
    brand: "",
    model: "",
    ram: "",
    storage: "",
    processor: "",
    colour: "",
    condition: "",
    imei: "",
    price: "",
    building: "",
    flatNumber: "",
    street: "",
    areaId: "",
    city: "",
    pincode: "",
    pickupDate: "",
    pickupSlotId: "",
    executiveId: "",
    status: "PICKUP_PENDING",
    notes: "",
  });

  useEffect(() => {
    fetch("/api/catalog/areas").then((r) => r.json()).then((d) => setAreas(d.areas || []));
    fetch("/api/catalog/slots").then((r) => r.json()).then((d) => setSlots(d.slots || []));
    fetch("/api/admin/executives").then((r) => r.json()).then((d) => setExecutives(d.executives || []));
  }, []);

  function set(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  return (
    <form
      className="mt-6 grid gap-3 rounded-2xl bg-white p-5 md:grid-cols-2"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        const res = await fetch("/api/admin/orders/manual", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        setBusy(false);
        if (!res.ok) {
          setError(data.error || "Could not create order");
          return;
        }
        router.push(`/admin/orders/${data.orderId}`);
      }}
    >
      {error && <p className="md:col-span-2 text-sm text-red-700">{error}</p>}
      <input className="rounded-xl border px-3 py-2" placeholder="Customer name" value={form.fullName} onChange={(e) => set("fullName", e.target.value)} />
      <input className="rounded-xl border px-3 py-2" placeholder="Mobile (mandatory)" value={form.mobile} onChange={(e) => set("mobile", e.target.value)} />
      <input className="rounded-xl border px-3 py-2" placeholder="Email (mandatory)" value={form.email} onChange={(e) => set("email", e.target.value)} />
      <select className="rounded-xl border px-3 py-2" value={form.deviceType} onChange={(e) => set("deviceType", e.target.value)}>
        <option value="PHONE">Mobile</option>
        <option value="LAPTOP">Laptop</option>
        <option value="TABLET">Tablet</option>
        <option value="OTHER">Other</option>
      </select>
      <input className="rounded-xl border px-3 py-2" placeholder="Brand" value={form.brand} onChange={(e) => set("brand", e.target.value)} />
      <input className="rounded-xl border px-3 py-2" placeholder="Model" value={form.model} onChange={(e) => set("model", e.target.value)} />
      <input className="rounded-xl border px-3 py-2" placeholder="RAM" value={form.ram} onChange={(e) => set("ram", e.target.value)} />
      <input className="rounded-xl border px-3 py-2" placeholder="Storage" value={form.storage} onChange={(e) => set("storage", e.target.value)} />
      <input className="rounded-xl border px-3 py-2" placeholder="Processor" value={form.processor} onChange={(e) => set("processor", e.target.value)} />
      <input className="rounded-xl border px-3 py-2" placeholder="Colour" value={form.colour} onChange={(e) => set("colour", e.target.value)} />
      <input className="rounded-xl border px-3 py-2" placeholder="Condition" value={form.condition} onChange={(e) => set("condition", e.target.value)} />
      <input className="rounded-xl border px-3 py-2" placeholder="IMEI / Serial" value={form.imei} onChange={(e) => set("imei", e.target.value)} />
      <input className="rounded-xl border px-3 py-2" placeholder="Price ₹" value={form.price} onChange={(e) => set("price", e.target.value)} />
      <input className="rounded-xl border px-3 py-2" placeholder="Building" value={form.building} onChange={(e) => set("building", e.target.value)} />
      <input className="rounded-xl border px-3 py-2" placeholder="Flat" value={form.flatNumber} onChange={(e) => set("flatNumber", e.target.value)} />
      <input className="rounded-xl border px-3 py-2" placeholder="Street" value={form.street} onChange={(e) => set("street", e.target.value)} />
      <select className="rounded-xl border px-3 py-2" value={form.areaId} onChange={(e) => set("areaId", e.target.value)}>
        <option value="">Service area</option>
        {areas.map((a) => (
          <option key={a.id} value={a.id}>{a.name} · ₹{a.pickupCharge} · {a.etaHours}h</option>
        ))}
      </select>
      <input className="rounded-xl border px-3 py-2" placeholder="City" value={form.city} onChange={(e) => set("city", e.target.value)} />
      <input className="rounded-xl border px-3 py-2" placeholder="Pincode" value={form.pincode} onChange={(e) => set("pincode", e.target.value)} />
      <input type="date" className="rounded-xl border px-3 py-2" value={form.pickupDate} onChange={(e) => set("pickupDate", e.target.value)} />
      <select className="rounded-xl border px-3 py-2" value={form.pickupSlotId} onChange={(e) => set("pickupSlotId", e.target.value)}>
        <option value="">Pickup slot</option>
        {slots.map((s) => (
          <option key={s.id} value={s.id}>{s.label}</option>
        ))}
      </select>
      <select className="rounded-xl border px-3 py-2" value={form.executiveId} onChange={(e) => set("executiveId", e.target.value)}>
        <option value="">Assign executive (optional)</option>
        {executives.map((e) => (
          <option key={e.id} value={e.id}>{e.name} · {e.employeeId}</option>
        ))}
      </select>
      <select className="rounded-xl border px-3 py-2" value={form.status} onChange={(e) => set("status", e.target.value)}>
        {ORDER_STATUSES.map((s) => (
          <option key={s} value={s}>{STATUS_LABELS[s]}</option>
        ))}
      </select>
      <input className="md:col-span-2 rounded-xl border px-3 py-2" placeholder="Internal notes" value={form.notes} onChange={(e) => set("notes", e.target.value)} />
      <button disabled={busy} className="rounded-xl bg-navy px-4 py-2 font-semibold text-white">
        {busy ? "Saving..." : "Create order"}
      </button>
    </form>
  );
}
