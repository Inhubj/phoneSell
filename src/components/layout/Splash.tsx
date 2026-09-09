"use client";

import { useEffect, useState } from "react";
import { BUSINESS } from "@/lib/constants";

export function Splash() {
  const [show, setShow] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    try {
      if (sessionStorage.getItem("rmt_splash")) return;
      sessionStorage.setItem("rmt_splash", "1");
    } catch {
      return;
    }
    setShow(true);
    const fade = window.setTimeout(() => setLeaving(true), 520);
    const hide = window.setTimeout(() => setShow(false), 740);
    return () => {
      window.clearTimeout(fade);
      window.clearTimeout(hide);
    };
  }, []);

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 z-[80] grid place-items-center bg-navy text-white ${leaving ? "splash-leave" : ""}`}
      role="status"
      aria-label="Loading PhoneSell"
    >
      <div className="text-center">
        <img
          src="/phonesell-logo.jpg"
          alt={BUSINESS.name}
          className="mx-auto h-28 w-auto rounded-2xl object-contain sm:h-36"
        />
        <div className="mx-auto mt-6 h-1 w-24 overflow-hidden rounded-full bg-white/15">
          <div className="h-full w-1/2 rounded-full bg-gold" />
        </div>
      </div>
    </div>
  );
}
