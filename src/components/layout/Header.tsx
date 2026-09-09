"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Phone, X } from "lucide-react";
import { BUSINESS, NAV } from "@/lib/constants";
import { Logo } from "./Logo";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    fetch("/api/auth/customer/me")
      .then((r) => r.json())
      .then((d) => setLoggedIn(Boolean(d.user)))
      .catch(() => setLoggedIn(false));
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const overHero = pathname === "/" && !scrolled;
  const navLink = overHero ? "text-white/80 transition hover:text-white" : "text-navy/80 transition hover:text-navy";
  const ink = overHero ? "text-white" : "text-navy";

  const items = NAV.filter((item) => !(loggedIn && item.href === "/login"));

  return (
    <header className={`fixed inset-x-0 top-0 z-40 border-b transition-all duration-300 ${scrolled ? "nav-glass border-navy/10" : "border-transparent bg-transparent"}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 lg:px-6">
        <Logo light={overHero} />
        <nav className="hidden items-center gap-4 xl:gap-5 lg:flex" aria-label="Primary">
          {items.map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative whitespace-nowrap text-[12px] font-medium tracking-wide xl:text-[13px] ${navLink} ${
                  active ? (overHero ? "text-white" : "text-navy") : ""
                }`}
              >
                {item.label}
                {active ? (
                  <span className="absolute inset-x-0 -bottom-1 mx-auto h-px w-6 bg-gold" />
                ) : null}
              </Link>
            );
          })}
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          <a
            href={BUSINESS.telHref}
            className={`hidden items-center gap-2 text-sm font-semibold xl:inline-flex ${ink}`}
          >
            <Phone className="h-4 w-4 text-gold" />
            Call {BUSINESS.phoneDisplay}
          </a>
          <Link
            href="/sell"
            className={`btn-premium rounded-full px-5 py-2.5 text-sm font-semibold tracking-wide ${
              overHero ? "bg-gold text-navy" : "bg-navy text-white"
            }`}
          >
            Sell My Phone
            <span className="btn-arrow" aria-hidden>→</span>
          </Link>
          {loggedIn && (
            <Link href="/account" className={`text-sm font-semibold ${ink}`}>
              My account
            </Link>
          )}
        </div>
        <button
          type="button"
          className={`grid h-11 w-11 place-items-center rounded-xl border lg:hidden ${
            overHero ? "border-white/30 text-white" : "border-navy/15 text-navy"
          }`}
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="border-t border-navy/10 bg-cream/95 px-4 py-4 backdrop-blur lg:hidden">
          <nav className="flex flex-col gap-3">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="py-1 text-base font-medium"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            {loggedIn && (
              <Link href="/account" onClick={() => setOpen(false)} className="py-1 font-semibold">
                My account
              </Link>
            )}
            <a href={BUSINESS.telHref} className="py-1 font-semibold">
              Call {BUSINESS.phoneDisplay}
            </a>
            <Link
              href="/sell"
              onClick={() => setOpen(false)}
              className="btn-premium mt-1 rounded-full bg-navy px-5 py-3 text-center font-semibold text-white"
            >
              Sell My Phone
              <span className="btn-arrow" aria-hidden>→</span>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
