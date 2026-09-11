import Link from "next/link";
import { BUSINESS } from "@/lib/constants";
import { Logo } from "./Logo";

const SELL = [
  { href: "/sell?flow=sell", label: "Sell my phone" },
  { href: "/sell?flow=value", label: "Get my phone’s value" },
  { href: "/sell?flow=diagnose", label: "Diagnose this phone" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/track", label: "Track order" },
];

const COMPANY = [
  { href: "/about", label: "About" },
  { href: "/why-us", label: "Why us" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export function Footer() {
  return (
    <footer className="bg-navy text-white">
      <div className="h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:grid-cols-2 lg:grid-cols-4 lg:px-6">
        <div className="sm:col-span-2 lg:col-span-1">
          <Logo light />
          <p className="mt-5 max-w-sm text-sm leading-7 text-white/60">
            Professional smartphone buyback with doorstep pickup across Mumbai, Mira Road, Bhayandar, Thane and nearby areas.
          </p>
          <a
            href={BUSINESS.telHref}
            className="mt-5 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/15 hover:bg-white/15"
          >
            Call {BUSINESS.phoneDisplay}
          </a>
        </div>
        <div>
          <p className="kicker text-gold-2">Sell</p>
          <ul className="mt-4 space-y-2.5 text-sm text-white/65">
            {SELL.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="transition hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="kicker text-gold-2">Company</p>
          <ul className="mt-4 space-y-2.5 text-sm text-white/65">
            {COMPANY.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="transition hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="kicker text-gold-2">Visit</p>
          <p className="mt-4 text-sm leading-6 text-white/65">
            {BUSINESS.addressLine1}
            <br />
            {BUSINESS.addressLine2}
          </p>
          <p className="mt-3 text-xs text-white/40">{BUSINESS.hours}</p>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-white/35">
        © 2026 {BUSINESS.name}. All rights reserved.
      </div>
    </footer>
  );
}
