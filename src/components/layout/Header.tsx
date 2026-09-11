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
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const items = NAV.filter((item) => !(loggedIn && item.href === "/login"));

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 border-b transition-all duration-300 ${
        scrolled ? "nav-glass border-navy/8" : "border-navy/6 bg-white/80 backdrop-blur-xl"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 lg:px-6">
        <Logo />
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {items.map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-3.5 py-2 text-[13px] font-medium tracking-tight transition ${
                  active ? "bg-navy text-white" : "text-navy/70 hover:bg-navy/5 hover:text-navy"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          <a href={BUSINESS.telHref} className="hidden items-center gap-2 text-sm font-semibold text-navy/80 xl:inline-flex">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-gold/12 text-royal">
              <Phone className="h-3.5 w-3.5" />
            </span>
            {BUSINESS.phoneDisplay}
          </a>
          <Link href="/sell" className="btn-premium rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white">
            Sell My Phone
            <span className="btn-arrow" aria-hidden>
              →
            </span>
          </Link>
          {loggedIn && (
            <Link href="/account" className="text-sm font-semibold text-navy/80 hover:text-navy">
              My account
            </Link>
          )}
        </div>
        <button
          type="button"
          className="grid h-11 w-11 place-items-center rounded-xl border border-navy/12 text-navy lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="border-t border-navy/8 bg-white px-4 py-4 lg:hidden">
          <nav className="flex flex-col gap-1">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-xl px-3 py-2.5 text-base font-medium hover:bg-cream"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            {loggedIn && (
              <Link href="/account" onClick={() => setOpen(false)} className="rounded-xl px-3 py-2.5 font-semibold">
                My account
              </Link>
            )}
            <a href={BUSINESS.telHref} className="rounded-xl px-3 py-2.5 font-semibold">
              Call {BUSINESS.phoneDisplay}
            </a>
            <Link
              href="/sell"
              onClick={() => setOpen(false)}
              className="btn-premium mt-2 rounded-full bg-navy px-5 py-3 text-center font-semibold text-white"
            >
              Sell My Phone
              <span className="btn-arrow" aria-hidden>
                →
              </span>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
