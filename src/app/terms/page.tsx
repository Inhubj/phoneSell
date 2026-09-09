import type { Metadata } from "next";
import { PRICE_DISCLAIMER } from "@/lib/constants";

export const metadata: Metadata = { title: "Terms & Conditions" };

export default function TermsPage() {
  return (
    <div className="reveal mx-auto max-w-3xl px-4 py-14 lg:px-6">
      <h1 className="font-display text-4xl">Terms & Conditions</h1>
      <div className="mt-6 space-y-4 text-sm leading-7 text-muted">
        <p>By submitting a sale request you confirm that you are authorised to sell the device and that the information and photographs provided are accurate.</p>
        <p>{PRICE_DISCLAIMER}</p>
        <p>PhoneSell may revise, accept or reject a purchase after inspection, including IMEI/serial checks and condition verification. Stolen or disputed devices will not be purchased.</p>
        <p>Customers should remove iCloud/Google accounts, SIM cards and personal data before handover. We are not responsible for data remaining on a device after collection if wipe was not completed.</p>
        <p>Payment is due only after the customer accepts the inspected final price. Pickup slots are subject to executive availability in the selected service area.</p>
      </div>
    </div>
  );
}
