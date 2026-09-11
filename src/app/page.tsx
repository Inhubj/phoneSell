import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { BUSINESS, PRICE_DISCLAIMER, SHORT_DISCLAIMER } from "@/lib/constants";
import { FAQS } from "@/lib/faqs";
import { PremiumCta } from "@/components/ui/PremiumCta";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  BadgeCheck,
  MapPin,
  ScanLine,
  ShieldCheck,
  Smartphone,
  Truck,
  Wallet,
} from "lucide-react";

export const dynamic = "force-dynamic";

const FEATURED_BRANDS = [
  "Apple",
  "Samsung",
  "OnePlus",
  "Xiaomi",
  "Google Pixel",
  "vivo",
  "OPPO",
  "Realme",
  "Motorola",
  "Nothing",
];

const STATS = [
  { n: "Free", l: "Doorstep pickup" },
  { n: "Same day", l: "Slots in many areas" },
  { n: "Fair", l: "Catalogue pricing" },
  { n: "Recorded", l: "Payment on order" },
];

const HOW = [
  { n: "01", t: "Select your phone", d: "Catalogue, custom model, or diagnose the phone you are using." },
  { n: "02", t: "See an estimate", d: "Share condition details. The figure is an estimate until inspection." },
  { n: "03", t: "Book pickup", d: "Choose a Mumbai service area and a convenient time slot." },
  { n: "04", t: "Get paid", d: "We inspect the device and record payment against your order." },
];

const WHY = [
  { t: "Fair & transparent pricing", d: "Catalogue rules, not hidden deductions after the fact.", Icon: BadgeCheck },
  { t: "Free doorstep pickup", d: "Our executive comes to your home or office.", Icon: Truck },
  { t: "Quick process", d: "Estimate online, then book a pickup slot.", Icon: ScanLine },
  { t: "Verified inspection", d: "Final value is confirmed after a physical check.", Icon: ShieldCheck },
  { t: "Secure payment", d: "UPI, bank transfer or cash — recorded on your order.", Icon: Wallet },
  { t: "Mumbai-based team", d: `Local service from ${BUSINESS.area}, ${BUSINESS.city}.`, Icon: MapPin },
];

const CHECKS = ["Screen", "Camera", "Speaker", "Battery", "Touch", "Device condition"];

export default async function HomePage() {
  const [brands, areas] = await Promise.all([
    prisma.brand.findMany({
      where: { isActive: true, devices: { some: { isActive: true, deviceType: "PHONE" } } },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.serviceArea.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ]);
  const ordered = FEATURED_BRANDS.map((name) => {
    const slug = name.toLowerCase().replace(/\s+/g, "-");
    return brands.find((b) => b.name.toLowerCase() === name.toLowerCase() || b.slug === slug);
  }).filter(Boolean) as typeof brands;
  const extras = brands.filter((b) => !ordered.some((o) => o.id === b.id)).slice(0, 2);
  const display = [...ordered, ...extras];

  return (
    <div>
      <section className="hero-grid relative overflow-hidden text-white">
        <span className="orb -left-10 top-8 h-48 w-48 bg-gold/20" />
        <span className="orb right-0 bottom-0 h-56 w-56 bg-royal/40" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:px-6 lg:pb-20 lg:pt-16">
          <div className="reveal stagger-1">
            <p className="inline-flex rounded-full border border-white/15 bg-white/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-gold-2">
              {BUSINESS.tagline}
            </p>
            <h1 className="font-display mt-6 text-[2.45rem] leading-[1.08] md:text-5xl lg:text-[3.35rem]">
              Sell your old phone.
              <span className="block text-gold-2">Get a clear offer.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-white/70">
              Instant online estimate and scheduled doorstep pickup across Mumbai, Mira Road, Bhayandar, Thane and nearby areas.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <PremiumCta href="/sell?flow=sell" variant="gold">
                Sell My Phone
              </PremiumCta>
              <PremiumCta href="/sell?flow=value" variant="ghost">
                Get My Phone’s Value
              </PremiumCta>
            </div>
            <p className="mt-5 text-sm text-white/65">
              Using this phone now?{" "}
              <Link href="/sell?flow=diagnose" className="font-semibold text-gold-2 underline-offset-4 hover:underline">
                Diagnose it
              </Link>
            </p>
          </div>
          <div className="reveal stagger-3 rounded-[1.75rem] border border-white/12 bg-white/8 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl md:p-8">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gold text-white">
                <Smartphone className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-2">Doorstep pickup</p>
                <h2 className="mt-1 text-xl font-semibold">Value in a few minutes</h2>
              </div>
            </div>
            <ol className="mt-6 space-y-3">
              {[
                ["01", "Select model"],
                ["02", "Share condition"],
                ["03", "Book home pickup"],
              ].map(([n, t]) => (
                <li key={n} className="flex items-center gap-3 rounded-2xl bg-white/6 px-4 py-3 text-sm text-white/90">
                  <span className="font-semibold text-gold-2">{n}</span>
                  {t}
                </li>
              ))}
            </ol>
            <Link
              href="/sell?flow=value"
              className="btn-premium mt-6 flex items-center justify-between rounded-2xl bg-white px-5 py-4 text-navy"
            >
              <span className="text-navy/40">Search iPhone 13, Galaxy S24…</span>
              <span className="rounded-full bg-navy px-4 py-2 text-sm font-semibold text-white">Search</span>
            </Link>
            <p className="mt-4 text-xs leading-5 text-white/40">{SHORT_DISCLAIMER}</p>
          </div>
        </div>
        <div className="relative border-t border-white/10">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px bg-white/8 sm:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.l} className="bg-navy/40 px-5 py-5">
                <p className="text-lg font-semibold text-white">{s.n}</p>
                <p className="mt-1 text-sm text-white/55">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-6">
        <div className="panel overflow-hidden rounded-[1.75rem]">
          <div className="grid lg:grid-cols-2">
            <div className="p-7 md:p-10">
              <Reveal>
                <SectionHeading
                  kicker="On-device checks"
                  title="Diagnose your phone in minutes"
                  description="Open this site on the phone you want to sell. We run browser-supported tests; you confirm the rest."
                />
              </Reveal>
              <PremiumCta href="/sell?flow=diagnose" className="mt-8">
                Start diagnosis
              </PremiumCta>
            </div>
            <ul className="grid gap-px bg-navy/6 sm:grid-cols-2">
              {CHECKS.map((item, i) => (
                <Reveal key={item} delay={i * 60}>
                  <li className="flex items-center gap-3 bg-white px-6 py-5 font-semibold text-navy">
                    <span className="step-num text-[11px]">{String(i + 1).padStart(2, "0")}</span>
                    {item}
                  </li>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <Reveal>
            <SectionHeading
              kicker="Catalogue"
              title="Popular phones we buy"
              description="Start with a brand, or add another model if it is not listed."
            />
          </Reveal>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {display.map((brand, i) => (
              <Reveal key={brand.id} delay={i * 40}>
                <Link href={`/sell?brand=${brand.slug}`} className="device-card panel block rounded-2xl px-5 py-7 text-center font-semibold">
                  {brand.name}
                </Link>
              </Reveal>
            ))}
            <Reveal delay={display.length * 40}>
              <Link href="/sell?custom=1" className="device-card panel block rounded-2xl border-dashed px-5 py-7 text-center font-semibold text-royal">
                Other brands
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="hero-grid relative overflow-hidden py-16 text-white">
        <div className="relative mx-auto max-w-7xl px-4 lg:px-6">
          <Reveal>
            <SectionHeading
              light
              kicker="Service coverage"
              title="Pickup across Mumbai & nearby"
              description="We collect phones from your home or office. Timing and any pickup charges follow the area selected at booking."
            />
          </Reveal>
          <div className="mt-8 flex flex-wrap gap-2">
            {areas.map((area, i) => (
              <span key={area.id} className="chip-navy" style={{ animationDelay: `${Math.min(i * 35, 500)}ms` }}>
                {area.name}
                {area.etaHours ? <span className="ml-1 text-white/55">· {area.etaHours}h</span> : null}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-6">
        <Reveal>
          <SectionHeading kicker="Process" title="How it works" description="Four steps from enquiry to payment, with a clear order record at every stage." />
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {HOW.map((s, i) => (
            <Reveal key={s.n} delay={i * 70}>
              <article className="device-card panel h-full rounded-2xl p-6">
                <span className="step-num">{s.n}</span>
                <h3 className="font-display mt-4 text-xl">{s.t}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{s.d}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <Reveal>
            <SectionHeading kicker="Why PhoneSell" title="A local, professional buyback" />
          </Reveal>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {WHY.map((item, i) => (
              <Reveal key={item.t} delay={i * 50}>
                <article className="h-full rounded-2xl border border-navy/6 bg-cream p-6">
                  <item.Icon className="h-5 w-5 text-royal" />
                  <h3 className="mt-4 font-semibold">{item.t}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">{item.d}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-6">
        <Reveal>
          <SectionHeading kicker="Help" title="Frequently asked questions" />
        </Reveal>
        <div className="mt-8 grid gap-3 md:grid-cols-2">
          {FAQS.slice(0, 8).map((faq, i) => (
            <Reveal key={faq.q} delay={i * 30}>
              <details className="panel group rounded-2xl p-5">
                <summary className="cursor-pointer list-none font-semibold marker:content-none">{faq.q}</summary>
                <p className="mt-3 text-sm leading-7 text-muted">{faq.a}</p>
              </details>
            </Reveal>
          ))}
        </div>
        <Link href="/faq" className="mt-6 inline-flex text-sm font-semibold text-royal hover:text-navy">
          View all FAQs →
        </Link>
      </section>

      <section className="px-4 pb-16 lg:px-6">
        <Reveal>
          <div className="mx-auto max-w-7xl overflow-hidden rounded-[1.75rem] bg-navy text-white">
            <div className="grid lg:grid-cols-2">
              <div className="p-8 md:p-10">
                <p className="kicker text-gold-2">Store</p>
                <h2 className="font-display mt-3 text-3xl">Visit us in Mira Road East</h2>
                <p className="mt-4 leading-7 text-white/70">
                  {BUSINESS.addressLine1}
                  <br />
                  {BUSINESS.addressLine2}
                </p>
                <p className="mt-3 text-sm text-white/50">{BUSINESS.hours}</p>
                <a href={BUSINESS.telHref} className="mt-6 inline-flex rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-white">
                  Call {BUSINESS.phoneDisplay}
                </a>
                <p className="mt-8 text-xs leading-5 text-white/35">{PRICE_DISCLAIMER}</p>
              </div>
              <iframe
                title="PhoneSell location"
                src={BUSINESS.embedMaps}
                className="h-72 w-full border-0 lg:h-full min-h-[18rem]"
                loading="lazy"
              />
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
