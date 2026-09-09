import type { Metadata } from "next";
import { FAQS } from "@/lib/faqs";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "FAQ — Selling Old Phones in Mumbai",
  description: "Answers about selling old, used, damaged and iPhone or Samsung devices with doorstep pickup in Mumbai.",
};

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 lg:px-6">
      <Reveal>
        <p className="kicker">Help</p>
        <h1 className="font-display mt-3 text-4xl text-navy">Frequently asked questions</h1>
        <p className="mt-4 text-muted">Straightforward answers about valuation, pickup and payment.</p>
      </Reveal>
      <div className="mt-8 space-y-3">
        {FAQS.map((faq, i) => (
          <Reveal key={faq.q} delay={i * 40}>
            <details className="panel rounded-2xl p-5">
              <summary className="cursor-pointer font-semibold">{faq.q}</summary>
              <p className="mt-3 text-sm leading-7 text-muted">{faq.a}</p>
            </details>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
