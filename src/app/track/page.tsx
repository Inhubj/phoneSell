import { Suspense } from "react";
import type { Metadata } from "next";
import { TrackForm } from "@/components/track/TrackForm";

export const metadata: Metadata = { title: "Track My Order" };

export default function TrackPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 lg:px-6">
      <p className="kicker">Orders</p>
      <h1 className="font-display mt-3 text-4xl text-navy">Track my order</h1>
      <p className="mt-3 mb-8 text-muted">Enter your order ID and registered mobile number to see pickup status.</p>
      <Suspense fallback={<div className="panel rounded-2xl p-10">Loading…</div>}>
        <TrackForm />
      </Suspense>
    </div>
  );
}
