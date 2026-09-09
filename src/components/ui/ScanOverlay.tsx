"use client";

import { useEffect, useRef, useState } from "react";

const CHECKS = [
  { at: 25, label: "Checking Screen..." },
  { at: 50, label: "Checking Camera..." },
  { at: 75, label: "Checking Touch..." },
  { at: 90, label: "Checking Device Information..." },
  { at: 100, label: "Checking Condition..." },
] as const;

function bucket(n: number) {
  if (n >= 100) return 100;
  if (n >= 75) return 75;
  if (n >= 50) return 50;
  if (n >= 25) return 25;
  return 0;
}

export function ScanOverlay({ active }: { active: boolean }) {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const ran = useRef(false);

  useEffect(() => {
    let frame = 0;
    let hide = 0;

    if (active) {
      ran.current = true;
      setVisible(true);
      setProgress(0);
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setProgress(90);
        return;
      }
      const start = performance.now();
      const duration = 420;
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        setProgress(Math.round(90 * (1 - Math.pow(1 - t, 3))));
        if (t < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(frame);
    }

    if (!ran.current) return;
    setProgress(100);
    hide = window.setTimeout(() => {
      setVisible(false);
      setProgress(0);
      ran.current = false;
    }, 140);
    return () => window.clearTimeout(hide);
  }, [active]);

  if (!visible && !active) return null;

  const shown = bucket(progress);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-navy/78 p-4 backdrop-blur-md" role="status" aria-live="polite">
      <div className="w-full max-w-md overflow-hidden rounded-[1.6rem] border border-white/15 bg-navy p-6 text-white shadow-[0_24px_60px_rgba(0,0,0,0.35)]">
        <p className="font-display text-2xl">Scanning Device...</p>
        <p className="mt-1 text-sm text-white/55">Browser-supported checks only. Hardware you confirm later is labelled separately.</p>

        <div className="relative mt-6 h-40 overflow-hidden rounded-2xl border border-white/12 bg-white/5">
          <div className="absolute inset-x-8 top-4 h-2 rounded-full bg-white/10" />
          <div className="absolute inset-x-10 bottom-4 h-2 rounded-full bg-white/10" />
          <span className="scan-line" />
        </div>

        <div className="mt-5">
          <div className="flex justify-between text-[11px] font-semibold tracking-wide text-white/45">
            <span>0%</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>100%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gold transition-[width] duration-150 ease-out"
              style={{ width: `${Math.max(progress, 2)}%` }}
            />
          </div>
          <p className="mt-2 text-center text-sm font-semibold text-gold">{shown}%</p>
        </div>

        <ul className="mt-5 space-y-2 text-left text-sm">
          {CHECKS.map((c) => {
            const done = progress >= c.at;
            return (
              <li key={c.label} className={`flex items-center justify-between gap-3 ${done ? "text-white" : "text-white/35"}`}>
                <span>{c.label}</span>
                <span className={done ? "font-semibold text-gold" : ""}>{done ? "✓" : ""}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
