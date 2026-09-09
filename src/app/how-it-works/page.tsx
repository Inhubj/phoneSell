import type { Metadata } from "next";
import { BUSINESS } from "@/lib/constants";
import { PremiumCta } from "@/components/ui/PremiumCta";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "How It Works",
  description: "Select your phone, get an estimated value, schedule pickup and get paid with PhoneSell.",
};

const STEPS = [
  { n: "01", t: "Select your phone", d: "Choose the brand, model and variant, add your model, or diagnose the phone you are using." },
  { n: "02", t: "Get estimated value", d: "Share the condition. The figure is an estimate until inspection." },
  { n: "03", t: "Schedule pickup", d: "Enter a serviceable Mumbai-area address. We pick up from your doorstep." },
  { n: "04", t: "Get paid", d: "We inspect the phone and record payment against your Order ID." },
];

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 lg:px-6">
      <Reveal>
        <p className="kicker">Process</p>
        <h1 className="font-display mt-3 text-4xl text-navy md:text-5xl">How it works</h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">A simple path to sell your used smartphone in Mumbai — with a clear record at every stage.</p>
      </Reveal>
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {STEPS.map((s, i) => (
          <Reveal key={s.n} delay={i * 80}>
            <article className="device-card panel h-full rounded-2xl p-6">
              <span className="step-num">{s.n}</span>
              <h2 className="font-display mt-4 text-2xl">{s.t}</h2>
              <p className="mt-2 leading-7 text-muted">{s.d}</p>
            </article>
          </Reveal>
        ))}
      </div>
      <div className="mt-10 flex flex-wrap gap-3">
        <PremiumCta href="/sell" variant="gold">Sell My Phone</PremiumCta>
        <PremiumCta href="/sell?flow=diagnose">Diagnose this phone</PremiumCta>
        <a href={BUSINESS.telHref} className="rounded-full border border-navy/15 px-6 py-3.5 font-semibold">
          Call {BUSINESS.phoneDisplay}
        </a>
      </div>
    </div>
  );
}
