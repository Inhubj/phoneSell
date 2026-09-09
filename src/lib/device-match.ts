import { summarizeDetection, type BrowserSignals, type DetectionSummary } from "./diagnosis";

export type CatalogDevice = {
  id: string;
  name: string;
  slug: string;
  isIos: boolean;
  launchYear: number | null;
  deviceType: string;
  brand: { id: string; name: string; slug: string };
};

const STOP = new Set([
  "apple",
  "samsung",
  "google",
  "phone",
  "mobile",
  "smartphone",
  "galaxy",
  "the",
  "and",
  "for",
  "with",
  "sm",
]);

function tokens(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .filter((w) => w.length > 1 && !STOP.has(w));
}

function scoreDevice(device: CatalogDevice, summary: DetectionSummary, haystack: string) {
  let score = 0;
  const brand = device.brand.name.toLowerCase();
  if (summary.brandHint && brand === summary.brandHint.toLowerCase()) score += 40;
  else if (haystack.includes(brand)) score += 20;

  const model = (summary.modelHint || "").toLowerCase();
  const name = device.name.toLowerCase();
  if (model && (name === model || name.includes(model) || model.includes(name))) score += 80;
  const modelTokens = tokens(summary.modelHint || "");
  const nameTokens = tokens(device.name);
  const overlap = modelTokens.filter((t) => nameTokens.includes(t) || haystack.includes(t));
  score += overlap.length * 12;
  if (summary.deviceType && device.deviceType === summary.deviceType) score += 8;
  if (summary.os === "iOS" && device.isIos) score += 15;
  if (summary.os === "Android" && !device.isIos) score += 6;
  return score;
}

export function matchCatalogDevices(devices: CatalogDevice[], signals: BrowserSignals, chModel?: string) {
  const merged: BrowserSignals = {
    ...signals,
    hints: {
      ...(signals.hints || {}),
      model: chModel || signals.hints?.model,
    },
  };
  const summary = summarizeDetection(merged);
  const haystack = `${signals.userAgent} ${summary.modelHint} ${summary.brandHint}`.toLowerCase();
  const ranked = devices
    .map((device) => ({ device, score: scoreDevice(device, summary, haystack) }))
    .sort((a, b) => b.score - a.score);

  const top = ranked[0];
  const second = ranked[1];
  let confidence: DetectionSummary["confidence"] = "none";
  if (top && top.score >= 70 && (!second || top.score - second.score >= 12)) confidence = "high";
  else if (top && top.score >= 40) confidence = "low";

  return {
    summary: { ...summary, confidence: summary.modelHint ? confidence : "none" },
    matches: ranked.filter((r) => r.score >= 25).slice(0, 8).map((r) => ({ ...r.device, score: r.score })),
    best: confidence === "high" ? top.device : null,
  };
}
