import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Why Us",
  description: "Fair valuation, doorstep pickup, transparent estimates and secure transactions from a Mira Road East based team.",
};

export default function WhyUsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 lg:px-6">
      <Reveal>
        <p className="kicker">Why PhoneSell</p>
        <h1 className="font-display mt-3 max-w-3xl text-4xl text-navy md:text-5xl">Why sell your phone with us</h1>
      </Reveal>
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {[
          ["Fair valuation", "We evaluate your device based on model, variant, condition and current market demand. Base prices and deductions are maintained by the administrator."],
          ["Doorstep pickup", "No need to travel. Our pickup executive comes to your preferred location across Mumbai and nearby areas."],
          ["Transparent process", "You can see the estimated value before scheduling your pickup. Final value is confirmed after inspection."],
          ["Secure transaction", "Every completed purchase has a digital transaction record, including payment method and reference."],
          ["Device data protection", "Customer data and device information are handled securely and are not publicly listed."],
          ["Mumbai-based service", "Local team operating from Singapore Plaza, Mira Road East, Thane."],
        ].map(([t, d], i) => (
          <Reveal key={t} delay={i * 70}>
            <article className="device-card panel h-full rounded-2xl p-6">
              <h2 className="border-l-2 border-gold pl-3 font-display text-2xl">{t}</h2>
              <p className="mt-3 leading-7 text-muted">{d}</p>
            </article>
          </Reveal>
        ))}
      </div>
      <Link href="/sell" className="btn-premium mt-10 inline-flex rounded-full bg-navy px-6 py-3 font-semibold text-white">
        Get my phone’s value
      </Link>
    </div>
  );
}
