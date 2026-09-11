"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export function NotifyConfigForm({
  config,
}: {
  config: { id: string; channel: string; provider: string; isEnabled: boolean; configJson: string };
}) {
  const router = useRouter();
  const parsed = useMemo(() => {
    try {
      return JSON.parse(config.configJson || "{}") as Record<string, string | number | boolean>;
    } catch {
      return {};
    }
  }, [config.configJson]);

  const [provider, setProvider] = useState(config.provider);
  const [isEnabled, setIsEnabled] = useState(config.isEnabled);
  const [json, setJson] = useState(config.configJson);
  const [host, setHost] = useState(String(parsed.host || ""));
  const [port, setPort] = useState(String(parsed.port || "587"));
  const [user, setUser] = useState(String(parsed.user || ""));
  const [pass, setPass] = useState("");
  const [from, setFrom] = useState(String(parsed.from || "PhoneSell <Phone0Sell@gmail.com>"));
  const [secure, setSecure] = useState(Boolean(parsed.secure) || port === "465");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const isEmail = config.channel === "EMAIL";

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    const payload = isEmail
      ? {
          host,
          port: Number(port) || 587,
          user,
          from,
          secure,
          ...(pass ? { pass } : {}),
        }
      : JSON.parse(json || "{}");
    const res = await fetch("/api/admin/manage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "notify", id: config.id, provider: isEmail ? "smtp" : provider, isEnabled, config: payload }),
    });
    setBusy(false);
    setMessage(res.ok ? "Saved." : "Could not save.");
    if (res.ok) {
      setPass("");
      router.refresh();
    }
  }

  return (
    <form className="panel rounded-2xl p-5" onSubmit={save}>
      <div className="font-semibold">{config.channel}</div>
      {isEmail ? (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="text-sm sm:col-span-2">
            SMTP host
            <input className="field mt-1" value={host} onChange={(e) => setHost(e.target.value)} placeholder="smtp.gmail.com" />
          </label>
          <label className="text-sm">
            Port
            <input className="field mt-1" value={port} onChange={(e) => setPort(e.target.value)} placeholder="587" />
          </label>
          <label className="mt-6 flex items-center gap-2 text-sm">
            <input type="checkbox" checked={secure} onChange={(e) => setSecure(e.target.checked)} />
            Use SSL (port 465)
          </label>
          <label className="text-sm">
            Username
            <input className="field mt-1" value={user} onChange={(e) => setUser(e.target.value)} placeholder="you@gmail.com" />
          </label>
          <label className="text-sm">
            Password / app password
            <input
              className="field mt-1"
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder={parsed.pass ? "Unchanged if left blank" : "App password"}
            />
          </label>
          <label className="text-sm sm:col-span-2">
            From address
            <input className="field mt-1" value={from} onChange={(e) => setFrom(e.target.value)} placeholder="PhoneSell <Phone0Sell@gmail.com>" />
          </label>
        </div>
      ) : (
        <>
          <input
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="field mt-3"
            placeholder="Provider name e.g. msg91, twilio, gupshup"
          />
          <textarea value={json} onChange={(e) => setJson(e.target.value)} className="field mt-2 h-24 font-mono text-xs" />
        </>
      )}
      <label className="mt-3 flex items-center gap-2 text-sm">
        <input type="checkbox" checked={isEnabled} onChange={(e) => setIsEnabled(e.target.checked)} />
        Enable this channel
      </label>
      <p className="mt-2 text-xs text-muted">
        {isEmail
          ? "You can also set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS and SMTP_FROM in the server environment. Environment values fill any blank fields here."
          : "SMS and WhatsApp stay logged until a provider is connected."}
      </p>
      <button disabled={busy} className="btn-premium mt-3 rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white">
        {busy ? "Saving…" : "Save channel"}
      </button>
      {message ? <span className="ml-3 text-sm text-muted">{message}</span> : null}
    </form>
  );
}
