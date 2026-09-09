"use client";

import { TRACK_STEPS, type OrderStatus } from "@/lib/constants";

export function OrderTimeline({ status }: { status: string }) {
  const idx = TRACK_STEPS.findIndex((s) => (s.statuses as readonly string[]).includes(status));
  const current = idx < 0 ? 0 : idx;

  return (
    <ol className="space-y-3">
      {TRACK_STEPS.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li
            key={s.key}
            className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${
              active ? "bg-navy text-white" : done ? "bg-gold/20" : "bg-cream text-muted"
            }`}
          >
            <span
              className={`grid h-6 w-6 place-items-center rounded-full text-xs font-bold ${
                active ? "pulse-marker bg-gold text-navy" : done ? "bg-navy text-white" : "border border-navy/20"
              }`}
              aria-hidden
            >
              {done && !active ? "✓" : active ? "●" : "○"}
            </span>
            <span className="font-medium">{s.label}</span>
          </li>
        );
      })}
    </ol>
  );
}
