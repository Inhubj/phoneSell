"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/layout/Logo";
import { PasswordField } from "./PasswordField";

export function LoginForm({ title, hint, executiveHref }: { title: string; hint: string; executiveHref?: boolean }) {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [need2fa, setNeed2fa] = useState(false);
  const [devCode, setDevCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password, otp: otp || undefined }),
    });
    const data = await res.json();
    setBusy(false);
    if (data.requires2fa) {
      setNeed2fa(true);
      setDevCode(data.devCode || "");
      return;
    }
    if (!res.ok) {
      setError(data.error || "Login failed");
      return;
    }
    router.push(data.redirect);
    router.refresh();
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-navy px-4">
      <span className="orb -left-10 top-10 h-48 w-48 bg-gold/20" />
      <span className="orb right-0 bottom-0 h-56 w-56 bg-royal/40" />
      <form onSubmit={submit} className="glass relative w-full max-w-md rounded-3xl p-8">
        <Logo />
        <h1 className="font-display mt-6 text-3xl">{title}</h1>
        <p className="mt-2 text-sm text-muted">{hint}</p>
        {error && <p className="mt-4 text-sm text-red-700">{error}</p>}
        <input className="mt-6 w-full rounded-2xl border px-4 py-3" placeholder="Email / username" value={identifier} onChange={(e) => setIdentifier(e.target.value)} />
        <div className="mt-3">
          <PasswordField value={password} onChange={setPassword} />
        </div>
        <p className="mt-2 text-right text-xs">
          <a className="font-semibold text-royal" href={executiveHref ? "/admin/forgot-password" : "/executive/forgot-password"}>Forgot password?</a>
        </p>
        {need2fa && (
          <>
            <input className="mt-3 w-full rounded-2xl border px-4 py-3" placeholder="2FA / OTP code" value={otp} onChange={(e) => setOtp(e.target.value)} />
            {devCode && <p className="mt-2 text-xs text-muted">Development OTP: {devCode}</p>}
          </>
        )}
        <button disabled={busy} className="btn-premium mt-5 w-full rounded-full bg-navy py-3 font-semibold text-white">
          {busy ? "Signing in..." : "Sign in"}
          {!busy && <span className="btn-arrow" aria-hidden>→</span>}
        </button>
        {executiveHref && (
          <p className="mt-4 text-center text-xs text-muted">
            Pickup executive? <a className="font-semibold text-royal" href="/executive/login">Use the executive login</a>
          </p>
        )}
      </form>
    </div>
  );
}
