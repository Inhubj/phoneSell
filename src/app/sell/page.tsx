import { Suspense } from "react";
import type { Metadata } from "next";
import { SellWizard } from "@/components/sell/SellWizard";

export const metadata: Metadata = {
  title: "Sell Your Phone in Mumbai",
  description:
    "Select your exact phone model, share condition details, get an estimated selling price and schedule doorstep pickup with PhoneSell.",
};

export default function SellPage() {
  return (
    <div className="relative mx-auto max-w-4xl overflow-hidden px-4 py-10 lg:px-6">
      <span className="orb -left-20 top-0 h-48 w-48 bg-gold/15" />
      <span className="orb right-0 bottom-10 h-40 w-40 bg-royal/15" />
      <Suspense fallback={<div className="glass rounded-3xl p-10">Loading selling flow…</div>}>
        <SellWizard />
      </Suspense>
    </div>
  );
}
