"use client";

import { useState } from "react";
import { HARDWARE_CHECKS, type BatteryRecord, type BrowserSignals, type TestResult } from "@/lib/diagnosis";
import { Back, Choice, Field, Primary } from "./ui";

export function HardwareStep({
  signals,
  onBack,
  onDone,
}: {
  signals: BrowserSignals | null;
  onBack: () => void;
  onDone: (results: TestResult[]) => void;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [note, setNote] = useState("");

  async function tryVibrate() {
    if (typeof navigator.vibrate !== "function") {
      setNote("Vibration API is not available in this browser.");
      return;
    }
    const ok = navigator.vibrate([80, 40, 80]);
    setNote(ok ? "Vibration pattern sent. Confirm whether you felt it." : "The browser did not accept the vibration request.");
  }

  async function tryFlash() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities?.() as { torch?: boolean } | undefined;
      if (capabilities?.torch && track.applyConstraints) {
        await track.applyConstraints({ advanced: [{ torch: true }] } as never);
        setTimeout(() => {
          void track.applyConstraints({ advanced: [{ torch: false }] } as never);
          stream.getTracks().forEach((t) => t.stop());
        }, 800);
        setNote("Torch constraint was accepted. Confirm whether the flash lit.");
      } else {
        stream.getTracks().forEach((t) => t.stop());
        setNote("This test isn't supported on your device/browser. Please test the flash manually.");
      }
    } catch {
      setNote("Flash / torch could not be started. Please test manually and confirm.");
    }
  }

  const ready = HARDWARE_CHECKS.every((c) => answers[c.key]);

  return (
    <div>
      <p className="text-sm text-muted">
        A website cannot directly press hardware buttons or read Face ID / fingerprint sensors. Please test manually and confirm.
      </p>
      {note && <p className="mt-3 rounded-xl bg-cream px-4 py-3 text-sm">{note}</p>}
      <div className="mt-4 space-y-4">
        {HARDWARE_CHECKS.map((item) => (
          <div key={item.key} className="rounded-2xl border border-navy/10 p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="font-semibold">{item.label}</p>
              {item.key === "vibration" && (
                <button type="button" onClick={tryVibrate} className="text-xs font-semibold text-royal">
                  Try vibrate
                </button>
              )}
              {item.key === "flash" && (
                <button type="button" onClick={tryFlash} className="text-xs font-semibold text-royal">
                  Try torch
                </button>
              )}
            </div>
            <p className="mt-1 text-xs text-muted">
              {item.key === "charging" && signals?.battery
                ? `Browser reports ${signals.battery.charging ? "currently charging" : "not charging"} at ${signals.battery.level}%. That is not proof the port is healthy.`
                : "Please test manually and confirm."}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Choice selected={answers[item.key] === "working"} onClick={() => setAnswers((a) => ({ ...a, [item.key]: "working" }))} label="Working" />
              <Choice selected={answers[item.key] === "not_working"} onClick={() => setAnswers((a) => ({ ...a, [item.key]: "not_working" }))} label="Not working" />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex gap-3">
        <Back onClick={onBack} />
        <Primary
          disabled={!ready}
          onClick={() => {
            onDone(
              HARDWARE_CHECKS.map((item) => ({
                key: item.key,
                label: item.label,
                outcome: answers[item.key] === "working" ? "Working" : "Not working",
                source: "CUSTOMER" as const,
              })),
            );
          }}
        >
          Continue
        </Primary>
      </div>
    </div>
  );
}

export function BatteryStep({
  signals,
  isIos,
  onBack,
  onDone,
}: {
  signals: BrowserSignals | null;
  isIos: boolean;
  onBack: () => void;
  onDone: (battery: BatteryRecord, result: TestResult) => void;
}) {
  const auto = signals?.battery || null;
  const [health, setHealth] = useState("");
  const [percent, setPercent] = useState("");

  return (
    <div>
      <p className="text-sm text-muted">
        Browsers do not expose Maximum Capacity / battery health. If we can read anything, it is only the current charge level — not health.
      </p>
      <div className="mt-4 rounded-2xl bg-cream p-4">
        {auto ? (
          <p>
            Current charge (browser): <b>{auto.level}%</b> · {auto.charging ? "charging" : "not charging"}
            <span className="mt-1 block text-xs text-muted">Automatically Detected — this is not battery health.</span>
          </p>
        ) : (
          <p>
            Battery Health: Unable to automatically detect
            <span className="mt-1 block text-xs text-muted">Unable to Test</span>
          </p>
        )}
      </div>
      {isIos && (
        <p className="mt-3 text-sm">On iPhone: Settings → Battery → Battery Health & Charging. Enter Maximum Capacity if you can see it.</p>
      )}
      <div className="mt-4">
        <Field
          label="Enter battery health % (optional)"
          value={percent}
          inputMode="numeric"
          maxLength={3}
          placeholder="e.g. 87"
          onChange={(v) => setPercent(v.replace(/\D/g, "").slice(0, 3))}
        />
      </div>
      <p className="mt-4 font-semibold">If you do not know the percentage</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {["good", "average", "poor"].map((k) => (
          <Choice key={k} selected={health === k} onClick={() => setHealth(k)} label={k[0].toUpperCase() + k.slice(1)} />
        ))}
      </div>
      <div className="mt-6 flex gap-3">
        <Back onClick={onBack} />
        <Primary
          disabled={!health && !percent}
          onClick={() => {
            const healthPercent = percent ? Number(percent) : null;
            const record: BatteryRecord = {
              source: healthPercent != null ? "CUSTOMER" : auto ? "AUTO" : "UNAVAILABLE",
              chargeLevel: auto?.level ?? null,
              charging: auto?.charging ?? null,
              healthPercent,
              healthBand: health || "good",
              note: healthPercent != null ? "Customer provided maximum capacity / health." : auto ? "Only current charge level was available from the browser." : "Customer estimate only.",
            };
            if (healthPercent == null && !auto) record.source = "CUSTOMER";
            if (healthPercent != null) record.source = "CUSTOMER";
            else if (auto) record.source = "AUTO";
            onDone(record, {
              key: "battery",
              label: "Battery",
              outcome: healthPercent != null ? `${healthPercent}% health (customer)` : auto ? `Charge ${auto.level}% (not health)` : health,
              source: record.source === "AUTO" ? "AUTO" : "CUSTOMER",
            });
          }}
        >
          Continue
        </Primary>
      </div>
    </div>
  );
}

export function NetworkStep({
  signals,
  onBack,
  onDone,
}: {
  signals: BrowserSignals | null;
  onBack: () => void;
  onDone: (result: TestResult) => void;
}) {
  const [latency, setLatency] = useState<number | null>(null);
  const [wifi, setWifi] = useState("");
  const [mobileNet, setMobileNet] = useState("");
  const [busy, setBusy] = useState(false);

  async function ping() {
    setBusy(true);
    const t0 = performance.now();
    try {
      await fetch("/api/diagnosis/ping", { cache: "no-store" });
      setLatency(Math.round(performance.now() - t0));
    } catch {
      setLatency(-1);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <p className="text-sm text-muted">A temporary internet problem is not treated as hardware failure.</p>
      <div className="mt-4 rounded-2xl bg-cream p-4 text-sm">
        <p>Online: {signals?.online ? "Yes" : "No"}</p>
        <p>Network type: {signals?.connection?.effectiveType || signals?.connection?.type || "Not exposed by this browser"}</p>
        <p>Latency: {latency == null ? "Not measured" : latency < 0 ? "Request failed" : `${latency} ms`}</p>
      </div>
      <button type="button" onClick={ping} disabled={busy} className="mt-3 min-h-12 rounded-full border px-5 py-3 font-semibold">
        {busy ? "Checking…" : "Run basic latency test"}
      </button>
      <div className="mt-4">
        <p className="font-semibold">Wi-Fi</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Choice selected={wifi === "working"} onClick={() => setWifi("working")} label="Working" />
          <Choice selected={wifi === "not_working"} onClick={() => setWifi("not_working")} label="Not working" />
        </div>
      </div>
      <div className="mt-4">
        <p className="font-semibold">Mobile network</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Choice selected={mobileNet === "working"} onClick={() => setMobileNet("working")} label="Working" />
          <Choice selected={mobileNet === "not_working"} onClick={() => setMobileNet("not_working")} label="Not working" />
        </div>
      </div>
      <div className="mt-6 flex gap-3">
        <Back onClick={onBack} />
        <Primary
          disabled={!wifi || !mobileNet}
          onClick={() =>
            onDone({
              key: "network",
              label: "Connectivity",
              outcome: latency != null && latency >= 0 ? "Passed" : "Customer confirmed",
              source: latency != null && latency >= 0 ? "TEST_PASSED" : "CUSTOMER",
              detail: `Wi-Fi ${wifi}; mobile ${mobileNet}; latency ${latency ?? "n/a"}`,
            })
          }
        >
          Continue
        </Primary>
      </div>
    </div>
  );
}

export function GpsStep({
  onBack,
  onDone,
}: {
  onBack: () => void;
  onDone: (result: TestResult) => void;
}) {
  const [status, setStatus] = useState<"idle" | "ok" | "denied" | "unsupported">("idle");
  const [accuracy, setAccuracy] = useState<number | null>(null);

  function request() {
    if (!navigator.geolocation) {
      setStatus("unsupported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setAccuracy(Math.round(pos.coords.accuracy));
        setStatus("ok");
      },
      () => setStatus("denied"),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 0 },
    );
  }

  return (
    <div>
      <p className="text-sm text-muted">
        Location is requested only to check that location services can return a reading. Coordinates are not stored on the order.
      </p>
      <button type="button" onClick={request} className="mt-4 min-h-12 rounded-full bg-navy px-5 py-3 font-semibold text-white">
        Allow location
      </button>
      <p className="mt-3 text-sm">
        {status === "idle" && "Not started"}
        {status === "ok" && `Valid location returned (accuracy about ${accuracy} m). Precise coordinates are discarded.`}
        {status === "denied" && "Location permission was denied."}
        {status === "unsupported" && "This test isn't supported on your device/browser."}
      </p>
      <div className="mt-6 flex gap-3">
        <Back onClick={onBack} />
        <Primary
          onClick={() =>
            onDone({
              key: "gps",
              label: "GPS / location",
              outcome: status === "ok" ? "Passed" : status === "denied" ? "Permission denied" : "Unable to test",
              source: status === "ok" ? "TEST_PASSED" : status === "denied" ? "DENIED" : "UNSUPPORTED",
            })
          }
        >
          Continue
        </Primary>
      </div>
    </div>
  );
}
