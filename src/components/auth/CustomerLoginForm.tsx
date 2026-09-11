"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/layout/Logo";
import { BUSINESS } from "@/lib/constants";
import { PasswordField } from "./PasswordField";

export function CustomerLoginForm({
  onSuccess,
  reason,
}: {
  onSuccess?: () => void;
  reason?: string;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const rawNext = params.get("next") || "/sell";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/sell";
  const [method, setMethod] = useState<"mobile" | "email">("email");
  const [identifier, setIdentifier] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [mode, setMode] = useState<"otp" | "password">("otp");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function sendOtp() {
    setBusy(true);
    setError("");
    const res = await fetch("/api/auth/customer/otp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ method, identifier }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Could not send OTP");
      return;
    }
    setSent(true);
  }

  async function passwordLogin() {
    setBusy(true);
    setError("");
    const res = await fetch("/api/auth/customer/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ method, identifier, password }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Login failed");
      return;
    }
    router.refresh();
    if (onSuccess) onSuccess();
    else router.push(next);
  }

  async function verify() {
    setBusy(true);
    setError("");
    const res = await fetch("/api/auth/customer/otp/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ method, identifier, code }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Invalid OTP");
      return;
    }
    router.refresh();
    if (onSuccess) onSuccess();
    else router.push(next);
  }

  return (
    <div className="panel mx-auto max-w-md rounded-[1.4rem] p-6 md:p-10">
      <Logo />
      <h1 className="font-display mt-6 text-3xl">Welcome to PhoneSell</h1>
      <p className="mt-2 text-sm text-muted">
        {reason || "Login with mobile or email to sell a phone, diagnose this device, or manage orders. You can browse the website without an account."}
      </p>
      <div className="mt-6 flex rounded-full bg-cream p-1">
        <button
          type="button"
          className={`flex-1 rounded-full py-2 text-sm font-semibold ${method === "mobile" ? "bg-navy text-white" : ""}`}
          onClick={() => {
            setMethod("mobile");
            setSent(false);
            setIdentifier("");
          }}
        >
          Mobile number
        </button>
        <button
          type="button"
          className={`flex-1 rounded-full py-2 text-sm font-semibold ${method === "email" ? "bg-navy text-white" : ""}`}
          onClick={() => {
            setMethod("email");
            setSent(false);
            setIdentifier("");
          }}
        >
          Email ID
        </button>
      </div>
      <div className="mt-4 flex gap-3 text-xs font-semibold">
        <button type="button" className={mode === "otp" ? "text-navy" : "text-muted"} onClick={() => setMode("otp")}>OTP login</button>
        <button type="button" className={mode === "password" ? "text-navy" : "text-muted"} onClick={() => setMode("password")}>Password login</button>
      </div>
      {error && <p className="mt-4 text-sm text-red-700">{error}</p>}
      <input
        className="mt-5 w-full rounded-2xl border px-4 py-3"
        placeholder={method === "mobile" ? "10-digit mobile" : "Email address"}
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
      />
      {!sent && mode === "otp" ? (
        <button disabled={busy} onClick={sendOtp} className="btn-premium mt-4 w-full rounded-full bg-navy py-3 font-semibold text-white">
          {busy ? "Sending..." : "Send OTP"}
          <span className="btn-arrow" aria-hidden>→</span>
        </button>
      ) : mode === "password" ? (
        <>
          <div className="mt-3">
            <PasswordField value={password} onChange={setPassword} />
          </div>
          <button disabled={busy} onClick={passwordLogin} className="mt-4 w-full rounded-full bg-navy py-3 font-semibold text-white">
            {busy ? "Signing in..." : "Sign in"}
          </button>
        </>
      ) : (
        <>
          <input className="mt-3 w-full rounded-2xl border px-4 py-3" placeholder="6-digit OTP" value={code} onChange={(e) => setCode(e.target.value)} />
          <p className="mt-2 text-xs text-muted">
            {method === "email"
              ? "We emailed a 6-digit code. Check inbox and spam."
              : "Enter the 6-digit code sent to your mobile."}
          </p>
          <button disabled={busy} onClick={verify} className="btn-premium mt-4 w-full rounded-full bg-gold py-3 font-semibold text-navy">
            {busy ? "Verifying..." : "Verify & continue"}
            {!busy && <span className="btn-arrow" aria-hidden>→</span>}
          </button>
        </>
      )}
      <p className="mt-6 text-center text-xs text-muted">
        <a className="font-semibold text-royal" href="/forgot-password">Forgot password?</a>
        {" · "}
        Staff? <a className="font-semibold text-royal" href="/admin/login">Admin login</a>
        {" · "}
        <a className="font-semibold" href={BUSINESS.telHref}>Call {BUSINESS.phoneDisplay}</a>
      </p>
    </div>
  );
}
