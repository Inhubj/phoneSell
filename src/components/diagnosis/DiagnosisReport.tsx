import { SOURCE_LABELS, maskImei, type ResultSource } from "@/lib/diagnosis";
import { formatInr } from "@/lib/money";

type DiagnosisView = {
  status?: string;
  consentJson?: string;
  detectionJson?: string;
  testsJson?: string;
  batteryJson?: string;
  imei?: string;
  imeiLast4?: string;
  serialNumber?: string;
  aiAssessmentJson?: string;
  quoteJson?: string;
  issuesJson?: string;
  completedAt?: string | Date | null;
  createdAt?: string | Date;
  events?: { id: string; step: string; source: string; label: string; createdAt: string | Date }[];
};

function parseJson<T>(raw: string | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function DiagnosisReport({
  diagnosis,
  photos,
  showImei = false,
}: {
  diagnosis: DiagnosisView | null | undefined;
  photos?: { id?: string; kind: string; url: string }[];
  showImei?: boolean;
}) {
  if (!diagnosis) {
    return <p className="text-sm text-muted">No automatic diagnosis on this order.</p>;
  }
  const tests = parseJson<{ key: string; label: string; outcome: string; source: ResultSource; detail?: string }[]>(diagnosis.testsJson, []);
  const battery = parseJson<Record<string, unknown>>(diagnosis.batteryJson, {});
  const detection = parseJson<{ summary?: { os?: string; osVersion?: string; browser?: string; modelHint?: string } }>(diagnosis.detectionJson, {});
  const ai = parseJson<{ overall?: string; screen?: string; backPanel?: string; notes?: string[]; customerOverride?: string }>(diagnosis.aiAssessmentJson, {});
  const quote = parseJson<{ basePrice?: number; estimatedPrice?: number; adjustments?: { label: string; amount: number }[] }>(diagnosis.quoteJson, {});
  const issues = parseJson<string[]>(diagnosis.issuesJson, []);
  const imeiDisplay = showImei && diagnosis.imei ? diagnosis.imei : diagnosis.imei ? maskImei(diagnosis.imei) : diagnosis.imeiLast4 ? `******${diagnosis.imeiLast4}` : "—";

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 text-sm">
        <p><span className="text-muted">OS:</span> {detection.summary?.os || "—"} {detection.summary?.osVersion || ""}</p>
        <p><span className="text-muted">Browser:</span> {detection.summary?.browser || "—"}</p>
        <p><span className="text-muted">Model hint:</span> {detection.summary?.modelHint || "Not exposed"}</p>
        <p><span className="text-muted">IMEI:</span> {imeiDisplay}</p>
        <p><span className="text-muted">Serial:</span> {diagnosis.serialNumber || "—"}</p>
        <p><span className="text-muted">Battery:</span> {String(battery.healthPercent ?? battery.healthBand ?? "—")} ({String(battery.source || "UNAVAILABLE")})</p>
      </div>
      <ul className="space-y-2">
        {tests.map((t) => (
          <li key={t.key} className="rounded-xl bg-cream px-3 py-2 text-sm">
            <div className="flex justify-between gap-2">
              <span><b>{t.label}:</b> {t.outcome}</span>
              <span className="text-[10px] uppercase text-muted">{SOURCE_LABELS[t.source] || t.source}</span>
            </div>
            {t.detail && <p className="text-xs text-muted">{t.detail}</p>}
          </li>
        ))}
      </ul>
      {issues.length > 0 && (
        <div>
          <p className="font-semibold">Issues detected</p>
          <ul className="mt-1 list-disc pl-5 text-sm">
            {issues.map((i) => <li key={i}>{i}</li>)}
          </ul>
        </div>
      )}
      {ai.overall && (
        <div className="rounded-xl border border-navy/10 p-3 text-sm">
          <p className="font-semibold">AI-assisted condition</p>
          <p className="text-xs text-muted">Assistive estimate only — not a final inspection.</p>
          <p>Overall: {ai.overall} · Screen: {ai.screen} · Back: {ai.backPanel}</p>
          {ai.customerOverride && <p>Customer correction: {ai.customerOverride}</p>}
        </div>
      )}
      {quote.estimatedPrice != null && (
        <div className="text-sm">
          <p>Base: {formatInr(quote.basePrice || 0)}</p>
          {(quote.adjustments || []).map((a) => (
            <p key={a.label}>{a.label}: {formatInr(a.amount)}</p>
          ))}
          <p className="font-semibold">Estimated: {formatInr(quote.estimatedPrice)}</p>
        </div>
      )}
      {photos && photos.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {photos.map((p) => (
            <figure key={p.id || p.url}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt={p.kind} className="h-32 w-full rounded-xl object-cover" />
              <figcaption className="mt-1 text-xs uppercase">{p.kind}</figcaption>
            </figure>
          ))}
        </div>
      )}
      {diagnosis.events && diagnosis.events.length > 0 && (
        <ol className="space-y-1 text-xs text-muted">
          {diagnosis.events.map((e) => (
            <li key={e.id}>
              {new Date(e.createdAt).toLocaleString("en-IN")} · {e.step} · {e.label}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
