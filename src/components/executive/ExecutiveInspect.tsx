"use client";

import { useState } from "react";
import { DiagnosisReport } from "@/components/diagnosis/DiagnosisReport";
import { formatInr, orderValue } from "@/lib/money";

export function ExecutiveInspect({ order, onSaved }: { order: any; onSaved: () => void }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const current = orderValue(order);
  const [form, setForm] = useState({
    screenCondition: order.inspection?.screenCondition || "",
    bodyCondition: order.inspection?.bodyCondition || "",
    cameraCondition: order.inspection?.cameraCondition || "",
    batteryHealth: order.inspection?.batteryHealth || "",
    accessories: order.inspection?.accessories || "",
    imei1: order.inspection?.imei1 || order.diagnosis?.imei || "",
    imeiVerified: order.inspection?.imeiVerified || "",
    finalResult: order.inspection?.finalResult || "",
    notes: order.inspection?.notes || "",
    finalPrice: String(order.finalPrice || current),
    reason: "",
  });

  async function save() {
    setBusy(true);
    await fetch(`/api/executive/orders/${order.id}/inspect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        screenCondition: form.screenCondition,
        bodyCondition: form.bodyCondition,
        cameraCondition: form.cameraCondition,
        batteryHealth: form.batteryHealth,
        accessories: form.accessories,
        imei1: form.imei1,
        imeiVerified: form.imeiVerified,
        finalResult: form.finalResult,
        notes: form.notes,
        finalPrice: Number(form.finalPrice),
        reason: form.reason || "Physical inspection",
      }),
    });
    setBusy(false);
    setOpen(false);
    onSaved();
  }

  return (
    <div className="mt-3">
      <button type="button" className="text-sm font-semibold text-royal" onClick={() => setOpen((v) => !v)}>
        {open ? "Hide diagnostic report" : "Diagnostic report & inspection"}
      </button>
      {open && (
        <div className="mt-3 space-y-4 rounded-2xl bg-cream p-3">
          <p className="text-sm">Estimated price: {formatInr(order.estimatedPrice)}</p>
          <DiagnosisReport diagnosis={order.diagnosis} photos={order.photos} showImei />
          <p className="font-semibold">Physical inspection</p>
          <div className="grid gap-2">
            {[
              ["screenCondition", "Screen condition"],
              ["bodyCondition", "Body condition"],
              ["cameraCondition", "Camera"],
              ["batteryHealth", "Battery condition"],
              ["accessories", "Accessories"],
              ["imei1", "IMEI"],
              ["imeiVerified", "IMEI verification"],
              ["finalResult", "Final inspection result"],
              ["notes", "Notes"],
              ["reason", "Price change reason"],
            ].map(([key, label]) => (
              <label key={key} className="text-xs">
                {label}
                <input
                  className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                  value={(form as any)[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                />
              </label>
            ))}
            <label className="text-xs">
              Final price (₹)
              <input
                type="number"
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                value={form.finalPrice}
                onChange={(e) => setForm({ ...form, finalPrice: e.target.value })}
              />
            </label>
          </div>
          <button type="button" disabled={busy} onClick={save} className="min-h-11 w-full rounded-full bg-navy py-2 font-semibold text-white">
            {busy ? "Saving…" : "Save inspection"}
          </button>
        </div>
      )}
    </div>
  );
}
