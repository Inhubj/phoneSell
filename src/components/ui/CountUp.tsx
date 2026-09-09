"use client";

import { useEffect, useState } from "react";

export function CountUp({
  value,
  prefix = "",
  duration = 700,
  className = "",
}: {
  value: number;
  prefix?: string;
  duration?: number;
  className?: string;
}) {
  const [n, setN] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setN(value);
      return;
    }
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);

  return (
    <span className={className}>
      {prefix}
      {n.toLocaleString("en-IN")}
    </span>
  );
}

export function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="text-xs uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-2 text-2xl font-semibold">
        <CountUp value={value} />
      </div>
    </div>
  );
}
