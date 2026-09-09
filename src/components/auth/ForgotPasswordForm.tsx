"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/layout/Logo";
import { PasswordField } from "./PasswordField";

export function ForgotPasswordForm({
  kind,
  loginHref,
}: {
  kind: "customer" | "admin" | "executive";
  loginHref: string;
}) {
  const [method, setMethod] = useState<"mobile" | "email">("email");
  const [identifier, setIdentifier] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [sent, setSent] = useState(false);
  const [devCode, setDevCode] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function send() {
    setBusy(true);
    setError("");
    const res = await fetch("/api/auth/password/otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, method, identifier }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Could not send OTP");
      return;
    }
    setSent(true);
    setDevCode(data.devCode || "");
  }

  async function reset() {
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setBusy(true);
    setError("");
    const res = await fetch("/api/auth/password/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, method, identifier, code, password }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Could not reset password");
      return;
    }
    setDone(true);
  }

  return (
    <div className="mx-auto max-w-md rounded-3xl bg-white p-6 shadow-sm md:p-10">
      <Logo />
      <h1 className="font-display mt-6 text-3xl">Reset password</h1>
      {done ? (
        <p className="mt-4 text-sm">
          Password updated. <Link className="font-semibold text-royal" href={loginHref}>Sign in</Link>
        </p>
      ) : (
        <>
          <div className="mt-6 flex rounded-full bg-cream p-1">
            {(["email", "mobile"] as const).map((m) => (
              <button
                key={m}
                type="button"
                className={`flex-1 rounded-full py-2 text-sm font-semibold ${method === m ? "bg-navy text-white" : ""}`}
                onClick={() => setMethod(m)}
              >
                {m === "email" ? "Email ID" : "Mobile number"}
              </button>
            ))}
          </div>
          {error && <p className="mt-4 text-sm text-red-700">{error}</p>}
          <input
            className="mt-5 w-full rounded-2xl border px-4 py-3"
            placeholder={method === "mobile" ? "Registered mobile" : "Registered email"}
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />
          {!sent ? (
            <button disabled={busy} onClick={send} className="mt-4 w-full rounded-full bg-navy py-3 font-semibold text-white">
              {busy ? "Sending..." : "Send OTP"}
            </button>
          ) : (
            <div className="mt-3 space-y-3">
              <input className="w-full rounded-2xl border px-4 py-3" placeholder="6-digit OTP" value={code} onChange={(e) => setCode(e.target.value)} />
              {devCode && <p className="text-xs text-muted">Development OTP: {devCode}</p>}
              <PasswordField value={password} onChange={setPassword} placeholder="New password" autoComplete="new-password" />
              <PasswordField value={confirm} onChange={setConfirm} placeholder="Confirm password" autoComplete="new-password" />
              <button disabled={busy} onClick={reset} className="w-full rounded-full bg-gold py-3 font-semibold text-navy">
                {busy ? "Saving..." : "Update password"}
              </button>
            </div>
          )}
        </>
      )}
      <p className="mt-6 text-center text-xs">
        <Link href={loginHref} className="font-semibold text-royal">Back to login</Link>
      </p>
    </div>
  );
}
