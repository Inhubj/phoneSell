"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ORDER_STATUSES, STATUS_LABELS, type OrderStatus } from "@/lib/constants";
import { formatInr } from "@/lib/money";
import { BUSINESS } from "@/lib/constants";
import { EditOrderPrice } from "./EditOrderPrice";
import { DiagnosisReport } from "@/components/diagnosis/DiagnosisReport";

export function OrderDetail({ order, executives }: { order: any; executives: { id: string; name: string }[] }) {
  const router = useRouter();
  const [status, setStatus] = useState(order.status);
  const [executiveId, setExecutiveId] = useState(order.assignment?.executiveId || "");
  const [adj, setAdj] = useState(order.inspectionAdj || 0);
  const [pickupStatus, setPickupStatus] = useState(order.pickupStatus || "PENDING");
  const [notes, setNotes] = useState(order.notes || "");
  const [busy, setBusy] = useState(false);
  const [inspect, setInspect] = useState({
    imei1: order.inspection?.imei1 || "",
    imei2: order.inspection?.imei2 || "",
    serialNumber: order.inspection?.serialNumber || "",
    actualRam: order.inspection?.actualRam || order.variant?.ramGb || "",
    actualStorage: order.inspection?.actualStorage || order.variant?.storageGb || "",
    batteryHealth: order.inspection?.batteryHealth || "",
    screenCondition: order.inspection?.screenCondition || "",
    bodyCondition: order.inspection?.bodyCondition || "",
    cameraCondition: order.inspection?.cameraCondition || "",
    speaker: order.inspection?.speaker || "",
    microphone: order.inspection?.microphone || "",
    chargingPort: order.inspection?.chargingPort || "",
    biometric: order.inspection?.biometric || "",
    network: order.inspection?.network || "",
    wifi: order.inspection?.wifi || "",
    bluetooth: order.inspection?.bluetooth || "",
    waterDamage: order.inspection?.waterDamage || "No",
    previousRepair: order.inspection?.previousRepair || "",
    displayReplacement: order.inspection?.displayReplacement || "",
    batteryReplacement: order.inspection?.batteryReplacement || "",
    accessories: order.inspection?.accessories || "",
    imeiVerified: order.inspection?.imeiVerified || "",
    finalResult: order.inspection?.finalResult || "",
    notes: order.inspection?.notes || "",
  });
  const [pay, setPay] = useState({ method: "UPI", reference: "", status: "PAID" });

  async function patch(body: Record<string, unknown>) {
    setBusy(true);
    await fetch(`/api/admin/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setBusy(false);
    router.refresh();
  }

  const finalPrice = Math.max(0, order.estimatedPrice + Number(adj || 0));

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl">{order.orderNumber}</h1>
      <section className="grid gap-4 lg:grid-cols-3">
        <Card title="Customer">
          <p className="font-semibold">{order.customer.fullName}</p>
          <a href={`tel:${order.customer.mobile}`} className="text-royal">{order.customer.mobile}</a>
          <p className="text-sm">{order.customer.email}</p>
          <p className="mt-2 text-sm">
            {order.address?.flatNumber}, {order.address?.building}, {order.address?.street}, {order.address?.area}, {order.address?.city} {order.address?.pincode}
          </p>
          <p className="text-sm">Landmark: {order.address?.landmark || "—"}</p>
        </Card>
        <Card title="Device">
          <p className="font-semibold">
            {order.customDevice
              ? `${order.customDevice.brand} ${order.customDevice.model}`
              : `${order.device?.brand?.name || ""} ${order.device?.name || ""}`}
          </p>
          <p>{order.variant ? `${order.variant.ramGb} GB / ${order.variant.storageGb} GB` : order.customDevice ? `${order.customDevice.ram} / ${order.customDevice.storage}` : ""}</p>
          <p className="text-sm">{order.conditionSummary}</p>
          <p className="mt-2">Estimated: {formatInr(order.estimatedPrice)}</p>
          <p>Current order price: {formatInr(order.currentPrice || order.finalPrice || order.estimatedPrice)}</p>
          <p>Final: {order.finalPrice ? formatInr(order.finalPrice) : "Pending inspection"}</p>
          {order.customDevice && <p className="mt-2 text-xs text-gold">Manual model · {order.customDevice.approvalStatus}</p>}
        </Card>
        <Card title="Pickup">
          <p>{order.pickupDate ? new Date(order.pickupDate).toLocaleDateString("en-IN") : "—"}</p>
          <p>{order.pickupSlot?.label}</p>
          <p>Pickup: {order.pickupStatus}</p>
          <p>Status: {STATUS_LABELS[order.status as OrderStatus]}</p>
          <p>Payment: {order.paymentStatus}</p>
        </Card>
      </section>

      <section className="rounded-2xl bg-white p-5">
        <h2 className="font-semibold">Photos</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3">
          {order.photos.map((p: { id: string; kind: string; url: string }) => (
            <figure key={p.id}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt={p.kind} className="h-36 w-full rounded-xl object-cover" />
              <figcaption className="mt-1 text-xs uppercase">{p.kind}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-white p-5">
        <h2 className="font-semibold">Device diagnosis</h2>
        <p className="mt-1 text-xs text-muted">Customer diagnostic report linked to this Order ID. Final price may differ after physical inspection.</p>
        <div className="mt-3">
          <DiagnosisReport diagnosis={order.diagnosis} photos={order.photos} showImei />
        </div>
        {order.finalPrice != null && (
          <p className="mt-3 text-sm">
            Estimated {formatInr(order.estimatedPrice)} → Final {formatInr(order.finalPrice)} · difference {formatInr(order.finalPrice - order.estimatedPrice)}
          </p>
        )}
      </section>

      <EditOrderPrice order={order} />

      <section className="rounded-2xl bg-white p-5">
        <h2 className="font-semibold">Assignment & status</h2>
        <div className="mt-3 flex flex-col gap-3 md:flex-row">
          <select value={executiveId} onChange={(e) => setExecutiveId(e.target.value)} className="rounded-xl border px-3 py-2">
            <option value="">Assign executive</option>
            {executives.map((e) => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border px-3 py-2">
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
          <select value={pickupStatus} onChange={(e) => setPickupStatus(e.target.value)} className="rounded-xl border px-3 py-2">
            {["PENDING", "SCHEDULED", "ASSIGNED", "COLLECTED", "FAILED"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <input
            placeholder="Internal notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="rounded-xl border px-3 py-2 md:min-w-[220px]"
          />
          <button disabled={busy} onClick={() => patch({ status, executiveId, pickupStatus, notes })} className="rounded-xl bg-navy px-4 py-2 text-white">
            Save
          </button>
        </div>
      </section>

      <section className="rounded-2xl bg-white p-5">
        <h2 className="font-semibold">Inspection</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {Object.entries(inspect).map(([k, v]) => (
            <label key={k} className="text-xs uppercase text-muted">
              {k}
              <input
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm text-ink"
                value={v as any}
                onChange={(e) => setInspect({ ...inspect, [k]: e.target.value })}
              />
            </label>
          ))}
          <label className="text-xs uppercase text-muted">
            Inspection adjustment (₹)
            <input type="number" className="mt-1 w-full rounded-xl border px-3 py-2 text-sm text-ink" value={adj} onChange={(e) => setAdj(Number(e.target.value))} />
          </label>
        </div>
        <p className="mt-3">Estimated {formatInr(order.estimatedPrice)} + adjustment {formatInr(Number(adj))} = <b>{formatInr(finalPrice)}</b></p>
        <div className="mt-3 flex gap-2">
          <button
            className="rounded-xl bg-navy px-4 py-2 text-white"
            onClick={async () => {
              await fetch(`/api/admin/orders/${order.id}/inspect`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...inspect, actualRam: Number(inspect.actualRam), actualStorage: Number(inspect.actualStorage), inspectionAdj: Number(adj) }),
              });
              router.refresh();
            }}
          >
            Save inspection
          </button>
          <button className="rounded-xl border px-4 py-2" onClick={() => patch({ status: "CUSTOMER_ACCEPTED", customerDecision: "ACCEPT", finalPrice })}>
            Customer accepted
          </button>
          <button className="rounded-xl border px-4 py-2" onClick={() => patch({ status: "REJECTED", customerDecision: "REJECT" })}>
            Customer rejected
          </button>
        </div>
      </section>

      <section className="rounded-2xl bg-white p-5">
        <h2 className="font-semibold">Payment</h2>
        <div className="mt-3 flex flex-col gap-3 md:flex-row">
          <select value={pay.method} onChange={(e) => setPay({ ...pay, method: e.target.value })} className="rounded-xl border px-3 py-2">
            <option>UPI</option>
            <option>BANK_TRANSFER</option>
            <option>CASH</option>
          </select>
          <input placeholder="Reference" value={pay.reference} onChange={(e) => setPay({ ...pay, reference: e.target.value })} className="rounded-xl border px-3 py-2" />
          <select value={pay.status} onChange={(e) => setPay({ ...pay, status: e.target.value })} className="rounded-xl border px-3 py-2">
            <option>PAID</option>
            <option>PENDING</option>
          </select>
          <button
            className="rounded-xl bg-gold px-4 py-2 font-semibold text-navy"
            onClick={async () => {
              await fetch(`/api/admin/orders/${order.id}/pay`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...pay, amount: finalPrice }),
              });
              await patch({ status: pay.status === "PAID" ? "PURCHASE_COMPLETED" : "PAYMENT_PENDING" });
            }}
          >
            Record payment
          </button>
        </div>
        <ul className="mt-3 text-sm">
          {order.payments.map((p: any) => (
            <li key={p.id}>{p.method} {formatInr(p.amount)} · {p.status} · {p.reference}</li>
          ))}
        </ul>
        <a href={BUSINESS.telHref} className="mt-3 inline-block text-sm">Call business {BUSINESS.phoneDisplay}</a>
      </section>

      <section className="rounded-2xl bg-white p-5">
        <h2 className="font-semibold">Status history</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {(order.statusHistory || []).map((h: any) => (
            <li key={h.id}>{new Date(h.createdAt).toLocaleString("en-IN")} · {h.oldStatus} → {h.newStatus} · {h.changedBy}</li>
          ))}
          {!(order.statusHistory || []).length && <li className="text-muted">No status changes recorded yet.</li>}
        </ul>
      </section>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-white p-5">
      <h2 className="text-xs uppercase tracking-wide text-muted">{title}</h2>
      <div className="mt-2 space-y-1">{children}</div>
    </section>
  );
}
