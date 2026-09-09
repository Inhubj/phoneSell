"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function NotifyConfigForm({ config }: { config: { id: string; channel: string; provider: string; isEnabled: boolean; configJson: string } }) {
  const router = useRouter();
  const [provider, setProvider] = useState(config.provider);
  const [isEnabled, setIsEnabled] = useState(config.isEnabled);
  const [json, setJson] = useState(config.configJson);

  return (
    <form
      className="rounded-2xl bg-white p-4"
      onSubmit={async (e) => {
        e.preventDefault();
        await fetch("/api/admin/manage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "notify", id: config.id, provider, isEnabled, config: JSON.parse(json || "{}") }),
        });
        router.refresh();
      }}
    >
      <div className="font-semibold">{config.channel}</div>
      <input value={provider} onChange={(e) => setProvider(e.target.value)} className="mt-2 w-full rounded-xl border px-3 py-2" placeholder="Provider name e.g. msg91, twilio, gupshup" />
      <label className="mt-2 flex items-center gap-2 text-sm">
        <input type="checkbox" checked={isEnabled} onChange={(e) => setIsEnabled(e.target.checked)} /> Enable provider
      </label>
      <textarea value={json} onChange={(e) => setJson(e.target.value)} className="mt-2 h-24 w-full rounded-xl border px-3 py-2 font-mono text-xs" />
      <button className="mt-2 rounded-xl bg-navy px-4 py-2 text-sm text-white">Save channel</button>
    </form>
  );
}
