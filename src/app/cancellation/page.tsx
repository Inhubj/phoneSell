import type { Metadata } from "next";
import { BUSINESS } from "@/lib/constants";

export const metadata: Metadata = { title: "Refund / Cancellation Policy" };

export default function CancellationPage() {
  return (
    <div className="reveal mx-auto max-w-3xl px-4 py-14 lg:px-6">
      <h1 className="font-display text-4xl">Refund / Cancellation Policy</h1>
      <div className="mt-6 space-y-4 text-sm leading-7 text-muted">
        <p>You may cancel a pickup request before the device is collected by calling {BUSINESS.phoneDisplay}, emailing {BUSINESS.email}, or messaging Instagram @{BUSINESS.social.instagramHandle} and quoting your order ID.</p>
        <p>If you reject the revised price after inspection, the device can be returned as per the executive’s process. No purchase payment is made unless you accept the final price.</p>
        <p>This is a device-purchase service, not a consumer retail sale of goods by us to you. Refunds of payouts already completed are handled only in cases of documented error or fraud investigation.</p>
      </div>
    </div>
  );
}
