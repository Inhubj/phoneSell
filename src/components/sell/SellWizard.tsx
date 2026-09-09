"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ANDROID_BATTERY, CONDITION_STEPS, EXTRA_QUESTIONS, IOS_BATTERY } from "@/lib/conditions";
import { BUSINESS, PHOTO_KINDS, PRICE_DISCLAIMER, SHORT_DISCLAIMER } from "@/lib/constants";
import { DiagnoseWizard } from "./DiagnoseWizard";
import { CountUp } from "@/components/ui/CountUp";
import { SellLoginOverlay } from "./SellLoginOverlay";

type Brand = { id: string; name: string; slug: string };
type Device = { id: string; name: string; slug: string; isIos: boolean; launchYear: number | null; deviceType?: string; brand: Brand };
type Variant = { id: string; ramGb: number; storageGb: number; colour: string; pricing: { basePrice: number } | null };
type Area = { id: string; name: string; city: string; pickupCharge: number; serviceCharge?: number; etaHours: number };
type Slot = { id: string; label: string };
type Quote = { basePrice: number; estimatedPrice: number; adjustments: { label: string; amount: number }[]; pending?: boolean };
type CustomModel = {
  brand: string;
  model: string;
  deviceType: string;
  ram: string;
  storage: string;
  processor: string;
  configuration: string;
  colour: string;
  purchaseYear: string;
  conditionNote: string;
  imeiOrSerial: string;
  description: string;
};

const EMPTY_CUSTOM: CustomModel = {
  brand: "",
  model: "",
  deviceType: "PHONE",
  ram: "",
  storage: "",
  processor: "",
  configuration: "",
  colour: "",
  purchaseYear: "",
  conditionNote: "",
  imeiOrSerial: "",
  description: "",
};

const STEPS = [
  "Brand",
  "Model",
  "Variant",
  "Condition",
  "Extras",
  "Photos",
  "Estimate",
  "Details",
  "Pickup",
] as const;

function formatInr(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

export function SellWizard() {
  const params = useSearchParams();
  const presetBrand = params.get("brand") || "";
  const customStart = params.get("custom") === "1";
  const flow = params.get("flow");
  const intended = flow === "diagnose" ? "diagnose" : customStart || presetBrand || flow === "sell" || flow === "value" ? "catalog" : null;
  const [loggedIn, setLoggedIn] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginReason, setLoginReason] = useState("Login to sell your phone or diagnose this device.");
  const pendingMode = useRef<"catalog" | "diagnose" | null>(intended);
  const [mode, setMode] = useState<"choose" | "catalog" | "diagnose">("choose");
  const [step, setStep] = useState(customStart ? 9 : 0);
  const [q, setQ] = useState("");
  const [brands, setBrands] = useState<Brand[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [brand, setBrand] = useState<Brand | null>(null);
  const [device, setDevice] = useState<Device | null>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [variant, setVariant] = useState<Variant | null>(null);
  const [condition, setCondition] = useState<Record<string, string>>({});
  const [battery, setBattery] = useState("");
  const [extras, setExtras] = useState<Record<string, string>>({});
  const [photos, setPhotos] = useState<{ kind: string; url: string }[]>([]);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [areas, setAreas] = useState<Area[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [customer, setCustomer] = useState({ fullName: "", mobile: "", alternate: "", email: "" });
  const [otpToken, setOtpToken] = useState("");
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
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [deviceType, setDeviceType] = useState("PHONE");
  const [customMode, setCustomMode] = useState(customStart);
  const [custom, setCustom] = useState<CustomModel>(EMPTY_CUSTOM);
  const [done, setDone] = useState<{ orderNumber: string; pickupDate: string; slot: string; phone: string; price: number } | null>(null);

  useEffect(() => {
    fetch("/api/auth/customer/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) {
          setLoggedIn(true);
          setCustomer((c) => ({
            ...c,
            fullName: d.user.name || c.fullName,
            mobile: d.user.mobile || c.mobile,
            email: d.user.email || c.email,
          }));
          setOtpToken("session");
          if (intended) setMode(intended);
        } else {
          setLoggedIn(false);
          if (intended) {
            pendingMode.current = intended;
            setLoginReason(
              intended === "diagnose"
                ? "Login to diagnose the phone you are using."
                : "Login to sell your phone or check its value.",
            );
            setLoginOpen(true);
          }
        }
      })
      .catch(() => {});
  }, [intended]);

  function requireAuth(nextMode: "catalog" | "diagnose", reason: string) {
    if (loggedIn) {
      setMode(nextMode);
      return;
    }
    pendingMode.current = nextMode;
    setLoginReason(reason);
    setLoginOpen(true);
  }

  useEffect(() => {
    fetch(`/api/catalog/brands?deviceType=${deviceType}`)
      .then((r) => r.json())
      .then((d) => {
        setBrands(d.brands || []);
        if (presetBrand && !customStart) {
          const match = (d.brands || []).find((b: Brand) => b.slug === presetBrand);
          if (match) {
            setBrand(match);
            setStep(1);
          }
        }
      });
    fetch("/api/catalog/areas").then((r) => r.json()).then((d) => setAreas(d.areas || []));
    fetch("/api/catalog/slots").then((r) => r.json()).then((d) => setSlots(d.slots || []));
  }, [presetBrand, deviceType, customStart]);

  useEffect(() => {
    const url = q
      ? `/api/catalog/devices?q=${encodeURIComponent(q)}&deviceType=${deviceType}`
      : brand
        ? `/api/catalog/devices?brandId=${brand.id}&deviceType=${deviceType}`
        : "";
    if (!url) {
      setDevices([]);
      return;
    }
    fetch(url)
      .then((r) => r.json())
      .then((d) => setDevices(d.devices || []));
  }, [q, brand, deviceType]);

  useEffect(() => {
    if (!device) return;
    fetch(`/api/catalog/devices/${device.id}`)
      .then((r) => r.json())
      .then((d) => setVariants(d.variants || []));
  }, [device]);

  const conditionReady = useMemo(() => {
    const needed = CONDITION_STEPS.every((s) => condition[s.key]);
    return needed && Boolean(battery);
  }, [condition, battery]);

  const extraReady = EXTRA_QUESTIONS.every((s) => extras[s.key]);
  const requiredPhotos = PHOTO_KINDS.filter((p) => p.required).every((p) => photos.some((x) => x.kind === p.key));

  async function loadQuote() {
    if (!variant && !customMode) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          customMode
            ? { custom: true, condition, extras, battery }
            : { variantId: variant!.id, condition, extras, battery },
        ),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not calculate price");
      setQuote(data);
      setStep(6);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Quote failed");
    } finally {
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
  }

  async function submitOrder() {
    if ((!variant && !customMode) || !quote) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variantId: variant?.id,
          custom: customMode ? custom : undefined,
          deviceType: customMode ? custom.deviceType : deviceType,
          condition,
          extras,
          battery,
          photos,
          customer,
          address,
          pickupDate,
          pickupSlotId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          requireAuth("catalog", "Login to book this pickup.");
          return;
        }
        throw new Error(data.error || "Booking failed");
      }
      setDone({
        orderNumber: data.orderNumber,
        pickupDate: data.pickupDate,
        slot: data.slot,
        phone: customMode ? `${custom.brand} ${custom.model}` : `${device?.name} ${variant?.storageGb} GB`,
        price: data.estimatedPrice,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Booking failed");
    } finally {
      setBusy(false);
    }
  }

  const loginGate = (
    <SellLoginOverlay
      open={loginOpen}
      reason={loginReason}
      onClose={() => {
        setLoginOpen(false);
        pendingMode.current = null;
      }}
      onSuccess={() => {
        setLoggedIn(true);
        setLoginOpen(false);
        const next = pendingMode.current;
        pendingMode.current = null;
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
              setOtpToken("session");
            }
          })
          .catch(() => {});
        if (next) setMode(next);
      }}
    />
  );

  if (mode === "diagnose") {
    return (
      <>
        {loginGate}
        <DiagnoseWizard onExit={() => setMode("choose")} />
      </>
    );
  }

  if (mode === "choose") {
    return (
      <>
        {loginGate}
      <div className="panel rounded-[1.4rem] p-6 md:p-10">
        <p className="kicker">Sell your device</p>
        <h1 className="font-display mt-2 text-3xl md:text-4xl">How do you want to start?</h1>
        <p className="mt-3 text-muted">Sell a phone, check its value, or diagnose the device you are using right now.</p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <button
            type="button"
            onClick={() => requireAuth("catalog", "Login to sell your phone.")}
            className="device-card rounded-2xl border-2 border-gold bg-gold/10 p-6 text-left"
          >
            <p className="text-xs font-semibold tracking-wide text-gold uppercase">Sell</p>
            <h2 className="font-display mt-2 text-2xl">Sell my phone</h2>
            <p className="mt-2 text-sm text-muted">Pick a model from the catalogue and book doorstep pickup.</p>
          </button>
          <button
            type="button"
            onClick={() => requireAuth("catalog", "Login to get your phone’s value.")}
            className="device-card rounded-2xl border border-navy/10 bg-white p-6 text-left"
          >
            <p className="text-xs font-semibold tracking-wide text-gold uppercase">Estimate</p>
            <h2 className="font-display mt-2 text-2xl">Get my phone’s value</h2>
            <p className="mt-2 text-sm text-muted">See an estimated price for a model you select — including a different phone than this one.</p>
          </button>
          <button
            type="button"
            onClick={() => requireAuth("diagnose", "Login to diagnose the phone you are using.")}
            className="device-card rounded-2xl border border-navy/10 bg-white p-6 text-left"
          >
            <p className="text-xs font-semibold tracking-wide text-gold uppercase">Same device</p>
            <h2 className="font-display mt-2 text-2xl">Diagnose it</h2>
            <p className="mt-2 text-sm text-muted">Use this if the phone you want to sell is the one in your hand.</p>
          </button>
        </div>
      </div>
      </>
    );
  }

  if (done) {
    return (
      <div className="glass rounded-3xl p-6 md:p-10">
        <p className="text-sm tracking-[0.2em] text-gold uppercase">Confirmed</p>
        <h1 className="font-display mt-2 text-4xl">Your Pickup Is Booked</h1>
        <dl className="mt-8 grid gap-4 md:grid-cols-2">
          <Info label="Order ID" value={done.orderNumber} />
          <Info label="Phone" value={done.phone} />
          <Info label="Estimated Value" value={formatInr(done.price)} />
          <Info label="Pickup Date" value={done.pickupDate} />
          <Info label="Time" value={done.slot} />
        </dl>
        <p className="mt-6 text-muted">Our executive will contact you before pickup.</p>
        <p className="mt-2 text-xs text-muted">{PRICE_DISCLAIMER}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a href={BUSINESS.telHref} className="rounded-full bg-navy px-6 py-3 text-center font-semibold text-white">
            Call PhoneSell
          </a>
          <Link href={`/track?order=${done.orderNumber}`} className="rounded-full border border-navy/20 px-6 py-3 text-center font-semibold">
            Track My Order
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {loginGate}
    <div className="glass rounded-3xl p-4 md:p-8">
      <div className="mb-6 flex gap-1 overflow-x-auto pb-2">
        {STEPS.map((label, i) => (
          <span
            key={label}
            className={`rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap ${
              i === step ? "bg-navy text-white" : i < step ? "bg-gold/20 text-navy" : "bg-cream text-muted"
            }`}
          >
            {i + 1}. {label}
          </span>
        ))}
      </div>
      {error && <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      {step === 0 && (
        <div>
          <button type="button" className="mb-4 text-sm font-semibold text-royal" onClick={() => setMode("choose")}>
            ← How do you want to start?
          </button>
          <h1 className="font-display text-3xl">Select your phone</h1>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search iPhone 13, Galaxy S24…"
            className="mt-4 w-full rounded-2xl border border-navy/15 px-4 py-3"
          />
          <button
            type="button"
            className="mt-4 w-full rounded-2xl border border-dashed border-navy/20 bg-cream px-4 py-3 text-left font-semibold"
            onClick={() => {
              setCustomMode(true);
              setCustom({ ...EMPTY_CUSTOM, deviceType: "PHONE" });
              setStep(9);
            }}
          >
            + Add Your Model
          </button>
          {q ? (
            <DeviceGrid
              devices={devices}
              onPick={(d) => {
                setDevice(d);
                setBrand(d.brand);
                setStep(2);
              }}
            />
          ) : (
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {brands.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => {
                    setBrand(b);
                    setQ("");
                    setStep(1);
                  }}
                  className="rounded-2xl border border-navy/10 p-4 text-left font-semibold hover:border-gold"
                >
                  {b.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {step === 1 && brand && (
        <div>
          <h1 className="font-display text-3xl">Select {brand.name} model</h1>
          <button
            type="button"
            className="mt-4 w-full rounded-2xl border-2 border-dashed border-gold bg-gold/10 px-4 py-3 text-left font-semibold"
            onClick={() => {
              setCustomMode(true);
              setCustom({ ...EMPTY_CUSTOM, deviceType, brand: brand.name });
              setStep(9);
            }}
          >
            + Others / Add Your Model
          </button>
          <DeviceGrid
            devices={devices}
            onPick={(d) => {
              setDevice(d);
              setStep(2);
            }}
          />
          <Back onClick={() => setStep(0)} />
        </div>
      )}

      {step === 2 && device && (
        <div>
          <h1 className="font-display text-3xl">{device.name}</h1>
          <p className="mt-1 text-muted">Choose the RAM, storage and configuration for this device.</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {variants.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => {
                  setVariant(v);
                  setStep(3);
                }}
                className="rounded-2xl border border-navy/10 p-4 text-left hover:border-gold"
              >
                <div className="font-semibold">
                  {v.ramGb ? `${v.ramGb} GB RAM` : "Standard"} / {v.storageGb >= 1024 ? `${v.storageGb / 1024} TB` : `${v.storageGb} GB`}
                </div>
                <div className="text-sm text-muted">Starting estimate available after condition</div>
              </button>
            ))}
          </div>
          <Back onClick={() => setStep(1)} />
        </div>
      )}

      {step === 3 && (
        <div>
          <h1 className="font-display text-3xl">Device condition</h1>
          <div className="mt-6 space-y-6">
            {CONDITION_STEPS.map((block) => (
              <fieldset key={block.key}>
                <legend className="font-semibold">{block.title}</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {block.options.map((opt) => (
                    <Choice
                      key={opt.key}
                      selected={condition[block.key] === opt.key}
                      onClick={() => setCondition((c) => ({ ...c, [block.key]: opt.key }))}
                      label={opt.label}
                    />
                  ))}
                </div>
              </fieldset>
            ))}
            <fieldset>
              <legend className="font-semibold">Battery {device?.isIos ? "health" : "condition"}</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {(device?.isIos ? IOS_BATTERY : ANDROID_BATTERY).map((opt) => (
                  <Choice key={opt.key} selected={battery === opt.key} onClick={() => setBattery(opt.key)} label={opt.label} />
                ))}
              </div>
            </fieldset>
          </div>
          <div className="mt-6 flex gap-3">
            <Back onClick={() => setStep(customMode ? 9 : 2)} />
            <button disabled={!conditionReady} onClick={() => setStep(4)} className="rounded-full bg-navy px-5 py-2 font-semibold text-white disabled:opacity-40">
              Continue
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div>
          <h1 className="font-display text-3xl">A few more details</h1>
          <div className="mt-6 space-y-6">
            {EXTRA_QUESTIONS.map((block) => (
              <fieldset key={block.key}>
                <legend className="font-semibold">{block.title}</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {block.options.map((opt) => (
                    <Choice key={opt} selected={extras[block.key] === opt} onClick={() => setExtras((c) => ({ ...c, [block.key]: opt }))} label={opt} />
                  ))}
                </div>
              </fieldset>
            ))}
          </div>
          <div className="mt-6 flex gap-3">
            <Back onClick={() => setStep(3)} />
            <button disabled={!extraReady} onClick={() => setStep(5)} className="rounded-full bg-navy px-5 py-2 font-semibold text-white disabled:opacity-40">
              Continue
            </button>
          </div>
        </div>
      )}

      {step === 5 && (
        <div>
          <h1 className="font-display text-3xl">Device photographs</h1>
          <p className="mt-2 text-sm text-muted">Use camera capture or gallery upload. Front, back and screen are required.</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {PHOTO_KINDS.map((kind) => (
              <label key={kind.key} className="rounded-2xl border border-dashed border-navy/20 p-4">
                <div className="font-semibold">
                  {kind.label} {kind.required ? "*" : "(optional)"}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="mt-3 text-sm"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setBusy(true);
                    try {
                      await uploadPhoto(kind.key, file);
                    } catch (err) {
                      setError(err instanceof Error ? err.message : "Upload failed");
                    } finally {
                      setBusy(false);
                    }
                  }}
                />
                {photos.find((p) => p.kind === kind.key) && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photos.find((p) => p.kind === kind.key)!.url} alt={kind.label} className="mt-3 h-28 w-full rounded-xl object-cover" />
                )}
              </label>
            ))}
          </div>
          <div className="mt-6 flex gap-3">
            <Back onClick={() => setStep(4)} />
            <button disabled={!requiredPhotos || busy} onClick={loadQuote} className="rounded-full bg-navy px-5 py-2 font-semibold text-white disabled:opacity-40">
              {busy ? "Calculating..." : "See estimated value"}
            </button>
          </div>
        </div>
      )}

      {step === 6 && quote && (variant && device || customMode) && (
        <div>
          <h1 className="font-display text-3xl">Estimated selling price</h1>
          <div className="mt-6 rounded-3xl bg-navy p-6 text-white">
            <p className="text-sm text-white/70">
              {customMode
                ? `${custom.brand} ${custom.model}`
                : `${brand?.name} ${device?.name} · ${variant?.ramGb} GB / ${variant?.storageGb} GB`}
            </p>
            <p className="mt-2 font-display text-5xl">
              {quote.pending ? "Pending review" : <CountUp prefix="₹" value={quote.estimatedPrice} />}
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
          </ul>
          <p className="mt-4 text-xs text-muted">{PRICE_DISCLAIMER}</p>
          <div className="mt-6 flex gap-3">
            <Back onClick={() => setStep(5)} />
            <button onClick={() => setStep(7)} className="rounded-full bg-navy px-5 py-2 font-semibold text-white">
              Continue to pickup
            </button>
          </div>
        </div>
      )}

      {step === 7 && (
        <div>
          <h1 className="font-display text-3xl">Your details</h1>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            <Field label="Full name" value={customer.fullName} onChange={(v) => setCustomer({ ...customer, fullName: v })} />
            <Field label="Mobile number (mandatory)" value={customer.mobile} onChange={(v) => setCustomer({ ...customer, mobile: v.replace(/\D/g, "").slice(0, 10) })} />
            <Field label="Alternate number" value={customer.alternate} onChange={(v) => setCustomer({ ...customer, alternate: v })} />
            <Field label="Email (mandatory)" value={customer.email} onChange={(v) => setCustomer({ ...customer, email: v })} />
          </div>
          {!otpToken && (
            <p className="mt-4 text-sm text-red-700">Your login session expired. Please log in again.</p>
          )}
          {otpToken && <p className="mt-3 text-sm font-semibold text-green-700">Account verified</p>}
          <div className="mt-6 flex gap-3">
            <Back onClick={() => setStep(6)} />
            <button disabled={!otpToken || customer.fullName.length < 2 || !customer.email.includes("@") || customer.mobile.length !== 10} onClick={() => setStep(8)} className="rounded-full bg-navy px-5 py-2 font-semibold text-white disabled:opacity-40">
              Continue
            </button>
          </div>
        </div>
      )}

      {step === 8 && (
        <div>
          <h1 className="font-display text-3xl">Pickup address & slot</h1>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
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
            {address.areaId && (
              <p className="md:col-span-2 rounded-2xl bg-cream px-4 py-3 text-sm">
                {(() => {
                  const area = areas.find((a) => a.id === address.areaId);
                  if (!area) return null;
                  return `Pickup charge ₹${area.pickupCharge}${area.serviceCharge ? ` · service ₹${area.serviceCharge}` : ""} · ETA ${area.etaHours} hours. Inactive areas are not listed.`;
                })()}
              </p>
            )}
            <Field label="City" value={address.city} onChange={(v) => setAddress({ ...address, city: v })} />
            <Field label="Pincode" value={address.pincode} onChange={(v) => setAddress({ ...address, pincode: v.replace(/\D/g, "").slice(0, 6) })} />
            <Field label="Landmark" value={address.landmark} onChange={(v) => setAddress({ ...address, landmark: v })} />
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
            <Back onClick={() => setStep(7)} />
            <button
              disabled={busy || !address.areaId || !pickupDate || !pickupSlotId}
              onClick={submitOrder}
              className="rounded-full bg-gold px-5 py-2 font-semibold text-navy disabled:opacity-40"
            >
              {busy ? "Booking..." : "Book doorstep pickup"}
            </button>
          </div>
        </div>
      )}

      {step === 9 && (
        <div>
          <h1 className="font-display text-3xl">Can't Find Your Phone?</h1>
          <p className="mt-2 text-sm text-muted">No problem. Add your phone details manually. Our team will review them with your order.</p>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            <Field label="Brand" value={custom.brand} onChange={(v) => setCustom({ ...custom, brand: v })} />
            <Field label="Model Name" value={custom.model} onChange={(v) => setCustom({ ...custom, model: v })} />
            <Field label="RAM" value={custom.ram} onChange={(v) => setCustom({ ...custom, ram: v })} />
            <Field label="Storage" value={custom.storage} onChange={(v) => setCustom({ ...custom, storage: v })} />
            <Field label="Variant" value={custom.configuration} onChange={(v) => setCustom({ ...custom, configuration: v })} />
            <Field label="Colour" value={custom.colour} onChange={(v) => setCustom({ ...custom, colour: v })} />
            <Field label="Phone condition" value={custom.conditionNote} onChange={(v) => setCustom({ ...custom, conditionNote: v })} />
          </div>
          <div className="mt-6 flex gap-3">
            <Back onClick={() => { setCustomMode(false); setStep(0); }} />
            <button
              disabled={!custom.brand || !custom.model}
              onClick={() => {
                setDeviceType("PHONE");
                setCustom({ ...custom, deviceType: "PHONE" });
                setStep(3);
              }}
              className="rounded-full bg-navy px-5 py-2 font-semibold text-white disabled:opacity-40"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
    </>
  );
}

function DeviceGrid({ devices, onPick }: { devices: Device[]; onPick: (d: Device) => void }) {
  if (!devices.length) return <p className="mt-6 text-muted">No matching models. Try another search or brand.</p>;
  return (
    <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
      {devices.map((d) => (
        <button key={d.id} type="button" onClick={() => onPick(d)} className="device-card rounded-2xl border border-navy/10 bg-white p-4 text-left">
          <div className="text-xs uppercase tracking-wide text-muted">{d.brand.name}</div>
          <div className="font-semibold">{d.name}</div>
          {d.launchYear && <div className="text-sm text-muted">{d.launchYear}</div>}
          <span className="mt-2 inline-block text-sm font-semibold text-royal">Check Price →</span>
        </button>
      ))}
    </div>
  );
}

function Choice({ selected, onClick, label }: { selected: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-medium ${selected ? "bg-navy text-white" : "bg-cream text-ink"}`}
    >
      {label}
    </button>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="text-sm font-medium">
      {label}
      <input value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-2xl border border-navy/15 px-4 py-3" />
    </label>
  );
}

function Back({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="rounded-full border px-5 py-2 font-semibold">
      Back
    </button>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-cream p-4">
      <div className="text-xs uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-1 font-semibold">{value}</div>
    </div>
  );
}
