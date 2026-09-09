import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { BUSINESS, PRICE_DISCLAIMER, SHORT_DISCLAIMER } from "@/lib/constants";
import { FAQS } from "@/lib/faqs";
import { PremiumCta } from "@/components/ui/PremiumCta";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TiltCard } from "@/components/ui/TiltCard";

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

const HERO_TRUST = [
  "Free doorstep pickup",
  "Fair market valuation",
  "Same-day slots in many areas",
  "Damaged phones accepted",
  "Payment recorded on your order",
];

const HOW = [
  { n: "01", t: "Select your phone", d: "Catalogue, custom model, or diagnose the phone you are using." },
  { n: "02", t: "See an estimate", d: "Share condition details. The figure is an estimate until inspection." },
  { n: "03", t: "Book pickup", d: "Choose a Mumbai service area and a convenient time slot." },
  { n: "04", t: "Get paid", d: "We inspect the device and record payment against your order." },
];

const WHY = [
  { t: "Fair & transparent pricing", d: "Catalogue rules, not hidden deductions after the fact." },
  { t: "Free doorstep pickup", d: "Our executive comes to your home or office." },
  { t: "Quick process", d: "Estimate online, then book a pickup slot." },
  { t: "Verified inspection", d: "Final value is confirmed after a physical check." },
  { t: "Secure payment", d: "UPI, bank transfer or cash — recorded on your order." },
  { t: "Mumbai-based team", d: `Local service from ${BUSINESS.area}, ${BUSINESS.city}.` },
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
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-32 lg:grid-cols-2 lg:px-6">
          <div className="reveal stagger-1">
            <p className="kicker">{BUSINESS.tagline}</p>
            <div className="mt-4 h-0.5 w-16 bg-gold" />
            <h1 className="font-display mt-5 text-[2.4rem] leading-[1.12] md:text-5xl lg:text-[3.15rem]">
              Turn your old smartphone into instant value
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-white/75">
              Get an estimated price online. We collect used or damaged smartphones from home across Mumbai, Mira Road, Bhayandar, Thane and nearby areas.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <PremiumCta href="/sell?flow=sell" variant="gold">
                Sell My Phone
              </PremiumCta>
              <PremiumCta href="/sell?flow=value" variant="ghost">
                Get My Phone’s Value
              </PremiumCta>
            </div>
            <p className="mt-5 text-sm text-white/75">
              Selling the same phone you are using now?{" "}
              <Link href="/sell?flow=diagnose" className="font-semibold text-gold underline-offset-4 hover:underline">
                Diagnose it
              </Link>
            </p>
            <ul className="mt-10 flex flex-wrap gap-2">
              {HERO_TRUST.map((item) => (
                <li key={item} className="rounded-full border border-white/15 bg-white/8 px-3.5 py-1.5 text-xs font-medium text-white/85">
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <TiltCard className="glass-dark reveal stagger-3 rounded-[1.6rem] p-7">
            <p className="kicker">Doorstep pickup</p>
            <h2 className="font-display mt-3 text-2xl leading-snug md:text-[1.7rem]">Get your phone’s value in minutes</h2>
            <p className="mt-3 text-sm leading-6 text-white/70">
              Search a model to sell, or check value. If this is the phone in your hand, diagnose it instead.
            </p>
            <ol className="mt-6 space-y-3 border-y border-white/10 py-5">
              {[
                ["01", "Select model"],
                ["02", "Share condition"],
                ["03", "Book home pickup"],
              ].map(([n, t]) => (
                <li key={n} className="flex items-center gap-3 text-sm text-white/85">
                  <span className="font-semibold tracking-wider text-gold">{n}</span>
                  {t}
                </li>
              ))}
            </ol>
            <Link
              href="/sell?flow=value"
              className="btn-premium mt-6 flex items-center justify-between rounded-2xl bg-white px-5 py-4 text-navy"
            >
              <span className="text-navy/45">Search iPhone 13, Galaxy S24…</span>
              <span className="rounded-full bg-navy px-4 py-2 text-sm font-semibold text-white">Search</span>
            </Link>
            <p className="mt-4 text-xs leading-5 text-white/45">{SHORT_DISCLAIMER}</p>
          </TiltCard>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 lg:px-6">
        <div className="panel overflow-hidden rounded-[1.6rem]">
          <div className="grid lg:grid-cols-2">
            <div className="p-7 md:p-10">
              <Reveal>
                <SectionHeading
                  kicker="On-device checks"
                  title="Diagnose your phone in minutes"
                  description="Open this site on the phone you want to sell. We run browser-supported tests; you confirm the rest. We never claim access the browser cannot provide."
                />
              </Reveal>
              <p className="mt-4 text-sm leading-6 text-muted">
                Results are labelled Automatically Detected, Test Passed, Customer Confirmed, or Unable to Test.
              </p>
              <PremiumCta href="/sell?flow=diagnose" className="mt-8">
                Start diagnosis
              </PremiumCta>
            </div>
            <ul className="grid gap-px bg-navy/8 sm:grid-cols-2">
              {CHECKS.map((item, i) => (
                <Reveal key={item} delay={i * 60}>
                  <li className="flex items-center gap-3 bg-cream/80 px-6 py-5 font-semibold text-navy">
                    <span className="step-num text-[11px]">{String(i + 1).padStart(2, "0")}</span>
                    {item}
                  </li>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="border-y border-navy/5 bg-white py-16">
        <div className="mx-auto max-w-6xl px-4 lg:px-6">
          <Reveal>
            <SectionHeading
              kicker="Catalogue"
              title="Phones people sell with us"
              description="Start with a brand, or add another model if it is not listed."
            />
          </Reveal>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {display.map((brand, i) => (
              <Reveal key={brand.id} delay={i * 40}>
                <Link href={`/sell?brand=${brand.slug}`} className="device-card panel block rounded-2xl px-5 py-6 text-center font-semibold">
                  {brand.name}
                </Link>
              </Reveal>
            ))}
            <Reveal delay={display.length * 40}>
              <Link href="/sell?custom=1" className="device-card panel block rounded-2xl border-dashed px-5 py-6 text-center font-semibold">
                Other brands
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="hero-grid relative overflow-hidden py-16 text-white">
        <span className="orb -left-16 top-0 h-40 w-40 bg-gold/20" />
        <span className="orb right-0 bottom-0 h-48 w-48 bg-royal/50" />
        <div className="relative mx-auto max-w-6xl px-4 lg:px-6">
          <Reveal>
            <SectionHeading
              light
              kicker="Service coverage"
              title="Doorstep pickup across Mumbai & nearby areas"
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
          <p className="mt-5 text-sm text-white/60">
            Popular areas include Mira Road, Bhayandar, Borivali, Andheri, Thane and Navi Mumbai.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 lg:px-6">
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

      <section className="border-y border-navy/5 bg-white py-16">
        <div className="mx-auto max-w-6xl px-4 lg:px-6">
          <Reveal>
            <SectionHeading kicker="Why PhoneSell" title="A local, professional buyback" />
          </Reveal>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {WHY.map((item, i) => (
              <Reveal key={item.t} delay={i * 50}>
                <article className="h-full rounded-2xl border border-navy/8 bg-cream/50 p-6">
                  <h3 className="border-l-2 border-gold pl-3 font-semibold">{item.t}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted">{item.d}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 lg:px-6">
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
          <div className="mx-auto max-w-6xl overflow-hidden rounded-[1.6rem] bg-navy text-white">
            <div className="grid lg:grid-cols-2">
              <div className="p-8 md:p-10">
                <p className="kicker">Store</p>
                <h2 className="font-display mt-3 text-3xl">Visit us in Mira Road East</h2>
                <p className="mt-4 leading-7 text-white/75">
                  {BUSINESS.addressLine1}
                  <br />
                  {BUSINESS.addressLine2}
                </p>
                <p className="mt-3 text-sm text-white/55">{BUSINESS.hours}</p>
                <a href={BUSINESS.telHref} className="mt-6 inline-flex rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-navy">
                  Call {BUSINESS.phoneDisplay}
                </a>
                <p className="mt-8 text-xs leading-5 text-white/40">{PRICE_DISCLAIMER}</p>
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
