"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { collectBrowserSignals } from "@/lib/browser-signals";
import { BUSINESS, PRICE_DISCLAIMER, SHORT_DISCLAIMER } from "@/lib/constants";
import {
  DIAGNOSIS_CONDITION,
  DIAGNOSIS_PHOTOS,
  DIAGNOSIS_STEPS,
  collectIssues,
  last4,
  maskImei,
  summarizeDetection,
  testsToCondition,
  type AiAssessment,
  type BatteryRecord,
  type BrowserSignals,
  type DetectionSummary,
  type DiagnosisStep,
  type TestResult,
} from "@/lib/diagnosis";
import { assessPhotoUrl, combineAssessments } from "@/lib/photo-assess";
import { CountUp } from "@/components/ui/CountUp";
import { CameraStep } from "./diagnose/CameraStep";
import { PhotoPicker } from "./PhotoPicker";
import { AudioStep } from "./diagnose/AudioStep";
import { ScreenStep, TouchStep } from "./diagnose/ScreenTouch";
import { BatteryStep, GpsStep, HardwareStep, NetworkStep } from "./diagnose/AssistedSteps";
import { Back, Choice, Field, Primary, SourceBadge, StepFrame } from "./diagnose/ui";
import { ScanOverlay } from "@/components/ui/ScanOverlay";

type Brand = { id: string; name: string; slug: string };
type Device = { id: string; name: string; slug: string; isIos: boolean; launchYear: number | null; brand: Brand; deviceType?: string };
type Variant = { id: string; ramGb: number; storageGb: number; colour: string; pricing: { basePrice: number } | null };
type Area = { id: string; name: string; city: string; pickupCharge: number; serviceCharge?: number; etaHours: number };
type Slot = { id: string; label: string };
type Quote = { basePrice: number; estimatedPrice: number; adjustments: { label: string; amount: number; key?: string }[]; pending?: boolean };

type EventRow = { step: string; source: string; label: string; detail?: string };

function formatInr(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

function mergeTests(prev: TestResult[], next: TestResult[]) {
  const map = new Map(prev.map((t) => [t.key, t]));
  for (const t of next) map.set(t.key, t);
  return [...map.values()];
}

export function DiagnoseWizard({ onExit }: { onExit: () => void }) {
  const [step, setStep] = useState<DiagnosisStep>("consent");
  const [signals, setSignals] = useState<BrowserSignals | null>(null);
  const [summary, setSummary] = useState<DetectionSummary | null>(null);
  const [matches, setMatches] = useState<(Device & { score?: number })[]>([]);
  const [device, setDevice] = useState<Device | null>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [variant, setVariant] = useState<Variant | null>(null);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandId, setBrandId] = useState("");
  const [catalog, setCatalog] = useState<Device[]>([]);
  const [q, setQ] = useState("");
  const [tests, setTests] = useState<TestResult[]>([]);
  const [battery, setBattery] = useState<BatteryRecord>({
    source: "UNAVAILABLE",
    chargeLevel: null,
    charging: null,
    healthPercent: null,
    healthBand: "good",
    note: "",
  });
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [imei, setImei] = useState("");
  const [serial, setSerial] = useState("");
  const [photos, setPhotos] = useState<{ kind: string; url: string }[]>([]);
  const [approved, setApproved] = useState<Record<string, boolean>>({});
  const [ai, setAi] = useState<AiAssessment | null>(null);
  const [aiOverride, setAiOverride] = useState("");
  const [quote, setQuote] = useState<Quote | null>(null);
  const [areas, setAreas] = useState<Area[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [customer, setCustomer] = useState({ fullName: "", mobile: "", alternate: "", email: "" });
  const [address, setAddress] = useState({
    building: "",
    flatNumber: "",
    street: "",
    areaId: "",
    city: "Mumbai",
    pincode: "",
    landmark: "",
  });
  const [pickupDate, setPickupDate] = useState("");
  const [pickupSlotId, setPickupSlotId] = useState("");
  const [events, setEvents] = useState<EventRow[]>([{ step: "STARTED", source: "CUSTOMER", label: "Diagnosis started" }]);
  const [consentAt, setConsentAt] = useState("");
  const [busy, setBusy] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ orderNumber: string; pickupDate: string; slot: string; phone: string; price: number } | null>(null);

  const meta = DIAGNOSIS_STEPS.find((s) => s.key === step)!;

  useEffect(() => {
    fetch("/api/auth/customer/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) {
          setCustomer((c) => ({
            ...c,
            fullName: d.user.name || c.fullName,
            mobile: d.user.mobile || c.mobile,
            email: d.user.email || c.email,
          }));
        }
      })
      .catch(() => {});
    fetch("/api/catalog/brands").then((r) => r.json()).then((d) => setBrands(d.brands || []));
    fetch("/api/catalog/areas").then((r) => r.json()).then((d) => setAreas(d.areas || []));
    fetch("/api/catalog/slots").then((r) => r.json()).then((d) => setSlots(d.slots || []));
  }, []);

  useEffect(() => {
    if (!device) return;
    fetch(`/api/catalog/devices/${device.id}`)
      .then((r) => r.json())
      .then((d) => setVariants(d.variants || []));
  }, [device]);

  useEffect(() => {
    if (step !== "model") return;
    const url = q
      ? `/api/catalog/devices?q=${encodeURIComponent(q)}&deviceType=PHONE`
      : brandId
        ? `/api/catalog/devices?brandId=${brandId}&deviceType=PHONE`
        : "";
    if (!url) return;
    fetch(url)
      .then((r) => r.json())
      .then((d) => setCatalog(d.devices || []));
  }, [q, brandId, step]);

  function pushEvent(row: EventRow) {
    setEvents((e) => [...e, row]);
  }

  function go(next: DiagnosisStep) {
    setError("");
    setStep(next);
  }

  const mapped = useMemo(() => {
    if (!device) return null;
    return testsToCondition(tests, answers, battery, device.isIos);
  }, [tests, answers, battery, device]);

  async function startDiagnosis() {
    setBusy(true);
    setScanning(true);
    setError("");
    try {
      const collected = await collectBrowserSignals();
      setSignals(collected);
      setSummary(summarizeDetection(collected));
      const res = await fetch("/api/diagnosis/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signals: collected }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Detection failed");
      setSummary(data.summary);
      setMatches(data.matches || []);
      if (data.best) setDevice(data.best);
      setConsentAt(new Date().toISOString());
      pushEvent({ step: "PERMISSIONS", source: "CUSTOMER", label: "Permissions granted and diagnosis started" });
      pushEvent({
        step: "DETECT",
        source: data.best ? "AUTO" : "UNSUPPORTED",
        label: data.best ? `Matched ${data.best.brand.name} ${data.best.name}` : "Exact model not identified",
      });
      go("detect");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start diagnosis");
    } finally {
      setScanning(false);
      setBusy(false);
    }
  }

  async function uploadPhoto(kind: string, file: File) {
    const body = new FormData();
    body.append("file", file);
    body.append("kind", kind);
    const res = await fetch("/api/upload", { method: "POST", body });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Upload failed");
    setPhotos((prev) => [...prev.filter((p) => p.kind !== kind), { kind, url: data.url }]);
    setApproved((a) => ({ ...a, [kind]: false }));
  }

  async function runAssistiveReview() {
    setBusy(true);
    try {
      const parts = await Promise.all(photos.map((p) => assessPhotoUrl(p.url, p.kind)));
      const assessment = combineAssessments(parts);
      setAi(assessment);
      pushEvent({ step: "PHOTOS", source: "ASSISTIVE", label: "Photos submitted and assistive review run" });
      go("result");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Photo review failed");
    } finally {
      setBusy(false);
    }
  }

  async function loadQuote() {
    if (!variant || !mapped) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variantId: variant.id,
          condition: mapped.condition,
          extras: mapped.extras,
          battery: mapped.battery,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not calculate price");
      setQuote(data);
      pushEvent({ step: "QUOTE", source: "AUTO", label: `Estimated value ${data.estimatedPrice}` });
      go("quote");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Quote failed");
    } finally {
      setBusy(false);
    }
  }

  async function submitOrder() {
    if (!variant || !quote || !mapped) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variantId: variant.id,
          deviceType: "PHONE",
          condition: mapped.condition,
          extras: mapped.extras,
          battery: mapped.battery,
          photos,
          customer,
          address,
          pickupDate,
          pickupSlotId,
          source: "DIAGNOSIS",
          diagnosis: {
            consent: {
              grantedAt: consentAt,
              camera: true,
              microphone: true,
              location: true,
              text: "Customer accepted diagnosis consent on device.",
            },
            detection: { signals, summary, matchedDeviceId: device?.id },
            capabilities: signals?.capabilities,
            tests,
            battery,
            imei,
            serialNumber: serial,
            aiAssessment: { ...ai, customerOverride: aiOverride },
            quote,
            issues: collectIssues(tests, answers, ai),
            events: [...events, { step: "ORDER", source: "CUSTOMER", label: "Customer accepted estimate" }],
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Booking failed");
      setDone({
        orderNumber: data.orderNumber,
        pickupDate: data.pickupDate,
        slot: data.slot,
        phone: `${device?.brand.name} ${device?.name} ${variant.storageGb} GB`,
        price: data.estimatedPrice,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Booking failed");
    } finally {
      setBusy(false);
    }
  }

  const requiredPhotosOk = DIAGNOSIS_PHOTOS.filter((p) => p.required).every(
    (p) => photos.some((x) => x.kind === p.key) && approved[p.key],
  );

  if (done) {
    return (
      <div className="rounded-3xl bg-white p-6 shadow-sm md:p-10">
        <p className="text-sm tracking-[0.2em] text-gold uppercase">Confirmed</p>
        <h1 className="font-display mt-2 text-4xl">Your Pickup Is Booked</h1>
        <dl className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-cream p-4">
            <div className="text-xs uppercase tracking-wide text-muted">Order ID</div>
            <div className="mt-1 font-semibold">{done.orderNumber}</div>
          </div>
          <div className="rounded-2xl bg-cream p-4">
            <div className="text-xs uppercase tracking-wide text-muted">Device</div>
            <div className="mt-1 font-semibold">{done.phone}</div>
          </div>
          <div className="rounded-2xl bg-cream p-4">
            <div className="text-xs uppercase tracking-wide text-muted">Estimated Value</div>
            <div className="mt-1 font-semibold">{formatInr(done.price)}</div>
          </div>
          <div className="rounded-2xl bg-cream p-4">
            <div className="text-xs uppercase tracking-wide text-muted">Pickup</div>
            <div className="mt-1 font-semibold">{done.pickupDate} · {done.slot}</div>
          </div>
        </dl>
        <p className="mt-6 text-xs text-muted">{PRICE_DISCLAIMER}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/account" className="rounded-full bg-navy px-6 py-3 text-center font-semibold text-white">
            View my orders
          </Link>
          <Link href={`/track?order=${done.orderNumber}`} className="rounded-full border border-navy/20 px-6 py-3 text-center font-semibold">
            Track my order
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-white p-4 shadow-sm md:p-8">
      <ScanOverlay active={scanning} />
      {error && <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      {step === "consent" && (
        <StepFrame title="Let's check your phone" progress={meta.progress} label={meta.label} onStop={onExit} hint="We will run a quick device health check to estimate your phone's resale value.">
          <div className="space-y-3 text-sm text-muted">
            <p>We may request access to:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Camera — only when you capture a test or listing photo</li>
              <li>Microphone — a short test sample, discarded immediately</li>
              <li>Location — only if you start the location test, to confirm GPS works</li>
              <li>Browser-reported capabilities (screen size, OS, network type if exposed)</li>
            </ul>
            <p>
              Photos of the device are used for valuation and pickup inspection. Diagnostic results are stored against your order so our executive and admin team can review them. We never silently access camera, microphone, location, files or contacts.
            </p>
            <p>You can stop at any time before submitting an order. Final price is always subject to physical inspection.</p>
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Primary onClick={startDiagnosis} disabled={busy}>
              {busy ? "Starting…" : "Allow & Start Diagnosis"}
            </Primary>
            <button type="button" onClick={onExit} className="min-h-12 rounded-full border px-5 py-3 font-semibold">
              Skip Diagnosis
            </button>
          </div>
        </StepFrame>
      )}

      {step === "detect" && summary && (
        <StepFrame title="Device detection" progress={meta.progress} label={meta.label} onStop={onExit}>
          <dl className="grid gap-3 sm:grid-cols-2 text-sm">
            <Info label="Device type" value={summary.deviceType} />
            <Info label="Brand hint" value={summary.brandHint || "Not exposed"} />
            <Info label="Model hint" value={summary.modelHint || "Not exposed"} />
            <Info label="OS" value={`${summary.os} ${summary.osVersion}`.trim()} />
            <Info label="Browser" value={summary.browser} />
            <Info label="Screen" value={signals ? `${signals.screen.width}×${signals.screen.height} @${signals.screen.dpr}x · ${signals.screen.orientation}` : "—"} />
            <Info label="Camera API" value={signals?.capabilities.camera ? "Available" : "Not available"} />
            <Info label="Microphone API" value={signals?.capabilities.microphone ? "Available" : "Not available"} />
            <Info label="Location API" value={signals?.capabilities.geolocation ? "Available" : "Not available"} />
            <Info label="Battery API" value={signals?.battery ? `Charge ${signals.battery.level}%` : "Not available"} />
            <Info label="Network" value={signals?.connection?.effectiveType || (signals?.online ? "Online" : "Offline")} />
          </dl>
          {summary.notes.map((n) => (
            <p key={n} className="mt-3 text-sm text-muted">{n}</p>
          ))}
          {device && summary.confidence === "high" ? (
            <p className="mt-4 font-semibold">Matched catalogue model: {device.brand.name} {device.name}</p>
          ) : (
            <p className="mt-4 font-semibold">We couldn&apos;t automatically identify your exact model.</p>
          )}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            {device && summary.confidence === "high" && (
              <Primary onClick={() => go("variant")}>Use {device.name}</Primary>
            )}
            <button type="button" onClick={() => go("model")} className="min-h-12 rounded-full border px-5 py-3 font-semibold">
              Select Model Manually
            </button>
          </div>
          {matches.length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-semibold">Possible matches</p>
              <div className="mt-2 grid gap-2">
                {matches.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    className="rounded-2xl border border-navy/10 p-4 text-left"
                    onClick={() => {
                      setDevice(m);
                      go("variant");
                    }}
                  >
                    <div className="text-xs text-muted">{m.brand.name}</div>
                    <div className="font-semibold">{m.name}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </StepFrame>
      )}

      {step === "model" && (
        <StepFrame title="Select model manually" progress={meta.progress} label={meta.label} onStop={onExit} hint="Use the existing device catalogue.">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search iPhone 15" className="w-full rounded-2xl border px-4 py-3" />
          <div className="mt-3 flex flex-wrap gap-2">
            {brands.map((b) => (
              <Choice key={b.id} selected={brandId === b.id} onClick={() => { setBrandId(b.id); setQ(""); }} label={b.name} />
            ))}
          </div>
          <div className="mt-4 grid gap-2">
            {catalog.map((d) => (
              <button
                key={d.id}
                type="button"
                className="rounded-2xl border border-navy/10 p-4 text-left"
                onClick={() => {
                  setDevice(d);
                  go("variant");
                }}
              >
                <div className="text-xs text-muted">{d.brand.name}</div>
                <div className="font-semibold">{d.name}</div>
              </button>
            ))}
          </div>
          <div className="mt-6">
            <Back onClick={() => go("detect")} />
          </div>
        </StepFrame>
      )}

      {step === "variant" && device && (
        <StepFrame title={`${device.brand.name} ${device.name}`} progress={meta.progress} label={meta.label} onStop={onExit} hint="Choose RAM / storage. This uses catalogue pricing for this order only.">
          <div className="grid gap-3">
            {variants.map((v) => (
              <button
                key={v.id}
                type="button"
                className="rounded-2xl border border-navy/10 p-4 text-left"
                onClick={() => {
                  setVariant(v);
                  pushEvent({ step: "DEVICE", source: "CUSTOMER", label: `Selected ${device.name} ${v.storageGb}GB` });
                  go("camera");
                }}
              >
                <div className="font-semibold">
                  {v.ramGb ? `${v.ramGb} GB RAM · ` : ""}
                  {v.storageGb >= 1024 ? `${v.storageGb / 1024} TB` : `${v.storageGb} GB`}
                </div>
              </button>
            ))}
          </div>
          <div className="mt-6">
            <Back onClick={() => go("model")} />
          </div>
        </StepFrame>
      )}

      {step === "camera" && (
        <StepFrame title="Camera test" progress={meta.progress} label={meta.label} onStop={onExit}>
          <CameraStep
            onBack={() => go("variant")}
            onDone={(results) => {
              setTests((t) => mergeTests(t, results));
              pushEvent({ step: "TESTS", source: "TEST_PASSED", label: "Camera test completed" });
              go("audio");
            }}
          />
        </StepFrame>
      )}

      {step === "audio" && (
        <StepFrame title="Microphone & speaker" progress={meta.progress} label={meta.label} onStop={onExit}>
          <AudioStep
            onBack={() => go("camera")}
            onDone={(results) => {
              setTests((t) => mergeTests(t, results));
              go("screen");
            }}
          />
        </StepFrame>
      )}

      {step === "screen" && (
        <StepFrame title="Screen test" progress={meta.progress} label={meta.label} onStop={onExit}>
          <ScreenStep
            onBack={() => go("audio")}
            onDone={(result) => {
              setTests((t) => mergeTests(t, [result]));
              go("touch");
            }}
          />
        </StepFrame>
      )}

      {step === "touch" && (
        <StepFrame title="Touch test" progress={meta.progress} label={meta.label} onStop={onExit}>
          <TouchStep
            onBack={() => go("screen")}
            onDone={(result) => {
              setTests((t) => mergeTests(t, [result]));
              go("hardware");
            }}
          />
        </StepFrame>
      )}

      {step === "hardware" && (
        <StepFrame title="Buttons & hardware" progress={meta.progress} label={meta.label} onStop={onExit}>
          <HardwareStep
            signals={signals}
            onBack={() => go("touch")}
            onDone={(results) => {
              setTests((t) => mergeTests(t, results));
              go("battery");
            }}
          />
        </StepFrame>
      )}

      {step === "battery" && (
        <StepFrame title="Battery health" progress={meta.progress} label={meta.label} onStop={onExit}>
          <BatteryStep
            signals={signals}
            isIos={Boolean(device?.isIos)}
            onBack={() => go("hardware")}
            onDone={(record, result) => {
              setBattery(record);
              setTests((t) => mergeTests(t, [result]));
              go("network");
            }}
          />
        </StepFrame>
      )}

      {step === "network" && (
        <StepFrame title="Network / connectivity" progress={meta.progress} label={meta.label} onStop={onExit}>
          <NetworkStep
            signals={signals}
            onBack={() => go("battery")}
            onDone={(result) => {
              setTests((t) => mergeTests(t, [result]));
              go("gps");
            }}
          />
        </StepFrame>
      )}

      {step === "gps" && (
        <StepFrame title="Location test" progress={meta.progress} label={meta.label} onStop={onExit}>
          <GpsStep
            onBack={() => go("network")}
            onDone={(result) => {
              setTests((t) => mergeTests(t, [result]));
              go("identity");
            }}
          />
        </StepFrame>
      )}

      {step === "identity" && (
        <StepFrame title="IMEI / serial number" progress={meta.progress} label={meta.label} onStop={onExit} hint="Optional. Dial *#06# on many phones to view IMEI. We mask it in the customer view.">
          <Field label="IMEI" value={imei} inputMode="numeric" maxLength={16} onChange={(v) => setImei(v.replace(/\D/g, "").slice(0, 16))} />
          {imei && <p className="mt-2 text-sm">Preview: IMEI {maskImei(imei)}</p>}
          <div className="mt-4">
            <Field label="Serial number (optional)" value={serial} onChange={setSerial} />
          </div>
          <div className="mt-6 flex gap-3">
            <Back onClick={() => go("gps")} />
            <Primary onClick={() => go("condition")}>Continue</Primary>
          </div>
        </StepFrame>
      )}

      {step === "condition" && (
        <StepFrame title="Device condition" progress={meta.progress} label={meta.label} onStop={onExit} hint="Correct anything the tests missed.">
          <div className="space-y-6">
            {DIAGNOSIS_CONDITION.map((block) => (
              <fieldset key={block.key}>
                <legend className="font-semibold">{block.title}</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {block.options.map((opt) => (
                    <Choice
                      key={opt.key}
                      selected={answers[block.key] === opt.key}
                      onClick={() => setAnswers((a) => ({ ...a, [block.key]: opt.key }))}
                      label={opt.label}
                    />
                  ))}
                </div>
              </fieldset>
            ))}
          </div>
          <div className="mt-6 flex gap-3">
            <Back onClick={() => go("identity")} />
            <Primary
              disabled={!DIAGNOSIS_CONDITION.every((b) => answers[b.key])}
              onClick={() => {
                pushEvent({ step: "CONDITION", source: "CUSTOMER", label: "Condition questions completed" });
                go("photos");
              }}
            >
              Continue
            </Primary>
          </div>
        </StepFrame>
      )}

      {step === "photos" && (
        <StepFrame title="Upload phone photos" progress={meta.progress} label={meta.label} onStop={onExit} hint="Use this phone’s camera. Approve each required photo before continuing.">
          <div className="grid gap-4">
            {DIAGNOSIS_PHOTOS.map((kind) => {
              const shot = photos.find((p) => p.kind === kind.key);
              return (
                <div key={kind.key} className="rounded-2xl border border-dashed border-navy/20 p-4">
                  <div className="font-semibold">
                    {kind.label} {kind.required ? "*" : "(optional)"}
                  </div>
                  <p className="text-xs text-muted">{kind.hint}</p>
                  <PhotoPicker
                    disabled={busy}
                    onFile={async (file) => {
                      setBusy(true);
                      setError("");
                      try {
                        await uploadPhoto(kind.key, file);
                      } catch (err) {
                        setError(err instanceof Error ? err.message : "Upload failed");
                      } finally {
                        setBusy(false);
                      }
                    }}
                  />
                  {shot && (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={shot.url} alt={kind.label} className="mt-3 h-40 w-full rounded-xl object-cover" />
                      <button
                        type="button"
                        className={`mt-3 min-h-11 w-full rounded-full px-4 py-2 text-sm font-semibold ${approved[kind.key] ? "bg-navy text-white" : "bg-gold text-navy"}`}
                        onClick={() => setApproved((a) => ({ ...a, [kind.key]: true }))}
                      >
                        {approved[kind.key] ? "Photo approved" : "Approve this photo"}
                      </button>
                    </>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-6 flex gap-3">
            <Back onClick={() => go("condition")} />
            <Primary disabled={!requiredPhotosOk || busy} onClick={runAssistiveReview}>
              {busy ? "Reviewing…" : "Continue"}
            </Primary>
          </div>
        </StepFrame>
      )}

      {step === "result" && device && variant && (
        <StepFrame title="Device diagnosis" progress={meta.progress} label={meta.label} onStop={onExit}>
          <p className="font-semibold">
            {device.brand.name} {device.name} · {variant.storageGb} GB
          </p>
          <p className="text-sm text-muted">{summary?.os} {summary?.osVersion}</p>
          {imei && <p className="mt-2 text-sm">IMEI: {maskImei(imei)}{last4(imei) ? "" : ""}</p>}
          <ul className="mt-4 space-y-2">
            {tests.map((t) => (
              <li key={t.key} className="flex items-start justify-between gap-3 rounded-2xl bg-cream px-4 py-3 text-sm">
                <span>
                  <b>{t.label}:</b> {t.outcome}
                  {t.detail ? <span className="block text-xs text-muted">{t.detail}</span> : null}
                </span>
                <SourceBadge source={t.source} />
              </li>
            ))}
          </ul>
          {ai && (
            <div className="mt-6 rounded-2xl border border-navy/10 p-4">
              <p className="font-semibold">Detected condition (assistive)</p>
              <p className="text-xs text-muted">This is an estimate from photo capture quality, not a guaranteed inspection.</p>
              <ul className="mt-2 text-sm">
                <li>Screen: {ai.screen}</li>
                <li>Back panel: {ai.backPanel}</li>
                <li>Frame: {ai.frame}</li>
                <li>Camera area: {ai.cameraArea}</li>
                <li>Overall cosmetic: {ai.overall}</li>
              </ul>
              <ul className="mt-2 list-disc pl-5 text-sm text-muted">
                {ai.notes.map((n) => <li key={n}>{n}</li>)}
              </ul>
              <Field label="Correct anything the system missed" value={aiOverride} onChange={setAiOverride} />
            </div>
          )}
          <div className="mt-6 flex gap-3">
            <Back onClick={() => go("photos")} />
            <Primary onClick={loadQuote} disabled={busy}>{busy ? "Calculating…" : "Calculate value"}</Primary>
          </div>
        </StepFrame>
      )}

      {step === "quote" && quote && (
        <StepFrame title="Your estimated phone value" progress={meta.progress} label={meta.label} onStop={onExit}>
          <div className="rounded-3xl bg-navy p-6 text-white">
            <p className="text-sm text-white/70">{device?.brand.name} {device?.name}</p>
            <p className="mt-2 font-display text-5xl">
              <CountUp prefix="₹" value={quote.estimatedPrice} />
            </p>
            <p className="mt-3 text-sm text-gold-2">{SHORT_DISCLAIMER}</p>
          </div>
          <ul className="mt-4 space-y-1 text-sm text-muted">
            <li>Base price: {formatInr(quote.basePrice)}</li>
            {quote.adjustments.map((a) => (
              <li key={a.label}>
                {a.label}: {a.amount > 0 ? "+" : ""}
                {formatInr(a.amount)}
              </li>
            ))}
            <li className="font-semibold text-ink">Estimated value: {formatInr(quote.estimatedPrice)}</li>
          </ul>
          <p className="mt-4 text-xs text-muted">{PRICE_DISCLAIMER}</p>
          <div className="mt-6 flex flex-col gap-3">
            <Primary onClick={() => go("details")}>Accept Estimate</Primary>
            <button type="button" onClick={() => go("camera")} className="min-h-12 rounded-full border px-5 py-3 font-semibold">
              Recheck device
            </button>
            <button type="button" onClick={onExit} className="min-h-12 text-sm font-semibold text-muted">
              Cancel
            </button>
          </div>
        </StepFrame>
      )}

      {step === "details" && (
        <StepFrame title="Your details" progress={meta.progress} label={meta.label} onStop={onExit}>
          <div className="grid gap-3">
            <Field label="Full name" value={customer.fullName} onChange={(v) => setCustomer({ ...customer, fullName: v })} />
            <Field label="Mobile" value={customer.mobile} inputMode="numeric" maxLength={10} onChange={(v) => setCustomer({ ...customer, mobile: v.replace(/\D/g, "").slice(0, 10) })} />
            <Field label="Email" value={customer.email} inputMode="email" onChange={(v) => setCustomer({ ...customer, email: v })} />
          </div>
          <div className="mt-6 flex gap-3">
            <Back onClick={() => go("quote")} />
            <Primary
              disabled={customer.fullName.length < 2 || !customer.email.includes("@") || customer.mobile.length !== 10}
              onClick={() => go("pickup")}
            >
              Continue
            </Primary>
          </div>
        </StepFrame>
      )}

      {step === "pickup" && (
        <StepFrame title="Pickup address & slot" progress={meta.progress} label={meta.label} onStop={onExit}>
          <div className="grid gap-3">
            <Field label="Building / Society" value={address.building} onChange={(v) => setAddress({ ...address, building: v })} />
            <Field label="Flat number" value={address.flatNumber} onChange={(v) => setAddress({ ...address, flatNumber: v })} />
            <Field label="Street" value={address.street} onChange={(v) => setAddress({ ...address, street: v })} />
            <label className="text-sm font-medium">
              Area
              <select
                className="mt-1 w-full rounded-2xl border px-4 py-3"
                value={address.areaId}
                onChange={(e) => {
                  const area = areas.find((a) => a.id === e.target.value);
                  setAddress({ ...address, areaId: e.target.value, city: area?.city || address.city });
                }}
              >
                <option value="">Select area</option>
                {areas.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} · pickup ₹{a.pickupCharge} · ETA {a.etaHours}h
                  </option>
                ))}
              </select>
            </label>
            <Field label="City" value={address.city} onChange={(v) => setAddress({ ...address, city: v })} />
            <Field label="Pincode" value={address.pincode} inputMode="numeric" maxLength={6} onChange={(v) => setAddress({ ...address, pincode: v.replace(/\D/g, "").slice(0, 6) })} />
            <label className="text-sm font-medium">
              Pickup date
              <input type="date" className="mt-1 w-full rounded-2xl border px-4 py-3" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} min={new Date().toISOString().slice(0, 10)} />
            </label>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {slots.map((s) => (
              <Choice key={s.id} selected={pickupSlotId === s.id} onClick={() => setPickupSlotId(s.id)} label={s.label} />
            ))}
          </div>
          <div className="mt-6 flex gap-3">
            <Back onClick={() => go("details")} />
            <button
              type="button"
              disabled={busy || !address.areaId || !pickupDate || !pickupSlotId}
              onClick={submitOrder}
              className="min-h-12 flex-1 rounded-full bg-gold px-5 py-3 font-semibold text-navy disabled:opacity-40"
            >
              {busy ? "Booking…" : "Book doorstep pickup"}
            </button>
          </div>
        </StepFrame>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-cream p-3">
      <div className="text-[10px] uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-1 font-semibold">{value}</div>
    </div>
  );
}
