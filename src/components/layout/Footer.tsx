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
      <div className="h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent" />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-3 lg:px-6">
        <div>
          <Logo light />
          <p className="mt-4 max-w-sm text-sm leading-6 text-white/65">
            Professional used-phone buyback with doorstep pickup across Mumbai, Mira Road, Bhayandar, Thane and nearby areas.
          </p>
          <p className="mt-4 text-sm text-white/50">
            {BUSINESS.addressLine1}
            <br />
            {BUSINESS.addressLine2}
          </p>
          <a href={BUSINESS.telHref} className="mt-4 inline-block text-sm font-semibold text-gold-2">
            Call {BUSINESS.phoneDisplay}
          </a>
        </div>
        <div>
          <p className="kicker">Sell</p>
          <ul className="mt-4 space-y-2.5 text-sm text-white/70">
            {SELL.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="kicker">Company</p>
          <ul className="mt-4 space-y-2.5 text-sm text-white/70">
            {COMPANY.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs tracking-wide text-white/40">
        © 2026 {BUSINESS.name}
      </div>
    </footer>
  );
}
