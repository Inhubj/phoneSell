"use client";

import { SOURCE_LABELS, type ResultSource } from "@/lib/diagnosis";

export function Choice({ selected, onClick, label }: { selected: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-12 rounded-full px-5 py-3 text-base font-medium ${selected ? "bg-navy text-white" : "bg-cream text-ink"}`}
    >
      {label}
    </button>
  );
}

export function Field({
  label,
  value,
  onChange,
  inputMode,
  maxLength,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  inputMode?: "numeric" | "email" | "tel" | "text";
  maxLength?: number;
  placeholder?: string;
}) {
  return (
    <label className="text-sm font-medium">
      {label}
      <input
        value={value}
        inputMode={inputMode}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-2xl border border-navy/15 px-4 py-3 text-base"
      />
    </label>
  );
}

export function Back({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="min-h-12 rounded-full border px-5 py-3 font-semibold">
      Back
    </button>
  );
}

export function Primary({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="min-h-12 flex-1 rounded-full bg-navy px-5 py-3 font-semibold text-white disabled:opacity-40"
    >
      {children}
    </button>
  );
}

export function SourceBadge({ source }: { source: ResultSource }) {
  return (
    <span className="rounded-full bg-cream px-2 py-0.5 text-[10px] font-semibold tracking-wide text-muted uppercase">
      {SOURCE_LABELS[source]}
    </span>
  );
}

export function StepFrame({
  title,
  hint,
  progress,
  label,
  onStop,
  children,
}: {
  title: string;
  hint?: string;
  progress: number;
  label: string;
  onStop: () => void;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-5">
        <div className="flex items-center justify-between text-xs text-muted">
          <span>{label}</span>
          <span>{progress}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-cream">
          <div className="h-full rounded-full bg-gold" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <div className="flex items-start justify-between gap-3">
        <h1 className="font-display text-3xl">{title}</h1>
        <button type="button" onClick={onStop} className="text-xs font-semibold text-muted">
          Stop
        </button>
      </div>
      {hint && <p className="mt-2 text-sm text-muted">{hint}</p>}
      <div className="mt-6">{children}</div>
    </div>
  );
}
