"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/layout/Logo";
import { BUSINESS, PICKUP_ACTIONS, STATUS_LABELS, type OrderStatus } from "@/lib/constants";
import { formatInr, orderValue } from "@/lib/money";
import { ExecutiveInspect } from "./ExecutiveInspect";

export function ExecutiveBoard({ name, today, upcoming, completed, cancelled, all }: {
  name: string;
  today: any[];
  upcoming: any[];
  completed: any[];
  cancelled: any[];
  all: any[];
}) {
  const router = useRouter();
  const [perm, setPerm] = useState("UNKNOWN");

  useEffect(() => {
    const stored = localStorage.getItem("rmt_gps_consent");
    if (stored === "DENIED") {
      setPerm("DENIED");
      fetch("/api/executive/location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permission: "DENIED" }),
      });
      return;
    }
    if (stored === "GRANTED" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPerm("GRANTED");
          fetch("/api/executive/location", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ permission: "GRANTED", lat: pos.coords.latitude, lng: pos.coords.longitude }),
          });
        },
        () => setPerm("DENIED"),
      );
    }
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/executive/login");
  }

  return (
    <div className="min-h-screen bg-cream p-4 md:p-8">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Logo compact />
            <p className="mt-3 text-sm text-muted">Pickup executive · {BUSINESS.name}</p>
            <h1 className="font-display text-3xl">{name}</h1>
          </div>
          <button onClick={logout} className="text-sm">Sign out</button>
        </div>
        {perm === "UNKNOWN" && (
          <div className="mt-4 rounded-2xl bg-white p-4 text-sm">
            <p>Share live location so the office can see you on the map during pickups? This is optional and only works if you allow it.</p>
            <div className="mt-3 flex gap-2">
              <button
                className="rounded-full bg-navy px-4 py-2 text-white"
                onClick={() => {
                  localStorage.setItem("rmt_gps_consent", "GRANTED");
                  if (!navigator.geolocation) return;
                  navigator.geolocation.getCurrentPosition((pos) => {
                    setPerm("GRANTED");
                    fetch("/api/executive/location", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ permission: "GRANTED", lat: pos.coords.latitude, lng: pos.coords.longitude }),
                    });
                  });
                }}
              >
                Allow location
              </button>
              <button
                className="rounded-full border px-4 py-2"
                onClick={() => {
                  localStorage.setItem("rmt_gps_consent", "DENIED");
                  setPerm("DENIED");
                  fetch("/api/executive/location", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ permission: "DENIED" }),
                  });
                }}
              >
                Not now
              </button>
            </div>
          </div>
        )}
        <p className="mt-3 text-xs text-muted">
          Location permission: {perm === "GRANTED" ? (
            <span className="inline-flex items-center gap-2 font-semibold text-green-800">
              <span className="pulse-marker inline-block h-2 w-2 rounded-full bg-green-600" /> Live (permission granted)
            </span>
          ) : perm}
        </p>
        <Section title="Today's pickups" rows={today} refresh={() => router.refresh()} />
        <Section title="Upcoming pickups" rows={upcoming} refresh={() => router.refresh()} />
        <Section title="Completed pickups" rows={completed} refresh={() => router.refresh()} />
        <Section title="Cancelled pickups" rows={cancelled} refresh={() => router.refresh()} />
        <Section title="All assigned" rows={all} refresh={() => router.refresh()} />
      </div>
    </div>
  );
}

function Section({ title, rows, refresh }: { title: string; rows: any[]; refresh: () => void }) {
  return (
    <div className="mt-8">
      <h2 className="font-semibold">{title}</h2>
      <List rows={rows} refresh={refresh} />
    </div>
  );
}

function List({ rows, refresh }: { rows: any[]; refresh: () => void }) {
  if (!rows.length) return <p className="mt-3 text-sm text-muted">No pickups in this list.</p>;
  return (
    <div className="mt-3 space-y-3">
      {rows.map((o) => {
        const maps = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
          `${o.address?.building} ${o.address?.street} ${o.address?.area} ${o.address?.pincode}`,
        )}`;
        return (
          <article key={o.id} className="glass rounded-2xl p-5">
            <div className="font-semibold">{o.customer.fullName} · {o.orderNumber}</div>
            <p className="text-sm">{o.device?.brand?.name} {o.device?.name || "Custom device"} · {formatInr(orderValue(o))}</p>
            <p className="text-sm">{o.customer.mobile} · {o.customer.email || "—"}</p>
            <p className="text-sm text-muted">{o.address?.flatNumber}, {o.address?.building}, {o.address?.area}</p>
            <p className="text-sm">{o.pickupSlot?.label} · {STATUS_LABELS[o.status as OrderStatus] || o.status} · Pickup {o.pickupStatus}</p>
            {o.diagnosis && <p className="mt-1 text-xs text-gold">Includes automatic diagnosis</p>}
            <ExecutiveInspect order={o} onSaved={refresh} />
            <div className="mt-3 flex flex-wrap gap-2">
              <a className="rounded-full bg-navy px-4 py-3 text-sm font-semibold text-white" href={`tel:${o.customer.mobile}`}>Call customer</a>
              <a className="rounded-full border px-4 py-3 text-sm font-semibold" href={maps} target="_blank" rel="noreferrer">Navigate</a>
              <a className="rounded-full border px-4 py-3 text-sm font-semibold" href={BUSINESS.telHref}>Call office</a>
              {PICKUP_ACTIONS.map((st) => (
                <button
                  key={st.action}
                  className="rounded-full bg-cream px-4 py-3 text-sm font-medium"
                  onClick={async () => {
                    await fetch("/api/executive/orders", {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ orderId: o.id, status: st.status, pickupStatus: st.pickup }),
                    });
                    refresh();
                  }}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </article>
        );
      })}
    </div>
  );
}
