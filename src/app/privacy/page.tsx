import type { Metadata } from "next";
import { BUSINESS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Privacy Policy",
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <div className="reveal mx-auto max-w-3xl px-4 py-14 lg:px-6">
      <h1 className="font-display text-4xl">Privacy Policy</h1>
      <div className="mt-6 space-y-4 text-sm leading-7 text-muted">
        <p>PhoneSell ({BUSINESS.addressLine1}, {BUSINESS.addressLine2}) collects customer name, mobile number, email, pickup address, device details, photographs and inspection notes solely to complete a phone purchase.</p>
        <p>Customer information is not publicly accessible. Access is limited to authenticated admin and assigned pickup executives. Passwords are stored as one-way hashes. Uploaded images are stored against the order record.</p>
        <p>OTP verification is used to confirm the selling customer’s mobile number. Notification logs (SMS, WhatsApp, email) are stored even when a third-party provider is not yet connected.</p>
        <p>You may request correction or deletion of personal data by calling {BUSINESS.phoneDisplay} or emailing {BUSINESS.email}, subject to accounting and fraud-prevention retention needs.</p>
        <p>This site does not sell personal data to advertisers. Analytics in the admin dashboard are computed from order records we already store.</p>
      </div>
    </div>
  );
}
