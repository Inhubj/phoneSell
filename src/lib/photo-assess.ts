import type { AiAssessment } from "./diagnosis";

function luma(r: number, g: number, b: number) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function assessImageData(data: Uint8ClampedArray, width: number, height: number) {
  const n = width * height;
  if (n < 16) {
    return { brightness: 0, contrast: 0, sharpness: 0, notes: ["Photo is too small to assess."] };
  }
  let sum = 0;
  let sumSq = 0;
  const step = Math.max(1, Math.floor(n / 40000));
  let samples = 0;
  for (let i = 0; i < n; i += step) {
    const o = i * 4;
    const y = luma(data[o], data[o + 1], data[o + 2]);
    sum += y;
    sumSq += y * y;
    samples += 1;
  }
  const mean = sum / samples;
  const variance = Math.max(0, sumSq / samples - mean * mean);
  const contrast = Math.sqrt(variance);

  let edge = 0;
  let edgeN = 0;
  const stride = width * 4;
  for (let y = 1; y < height - 1; y += 4) {
    for (let x = 1; x < width - 1; x += 4) {
      const i = y * stride + x * 4;
      const c = luma(data[i], data[i + 1], data[i + 2]);
      const r = luma(data[i + 4], data[i + 5], data[i + 6]);
      const d = luma(data[i + stride], data[i + stride + 1], data[i + stride + 2]);
      edge += Math.abs(c - r) + Math.abs(c - d);
      edgeN += 1;
    }
  }
  const sharpness = edgeN ? edge / edgeN : 0;
  const notes: string[] = [];
  if (mean < 35) notes.push("Photo may be too dark to judge cosmetic condition.");
  if (mean > 230) notes.push("Photo may be overexposed.");
  if (sharpness < 4) notes.push("Photo may be blurry or out of focus.");
  if (contrast < 12) notes.push("Low contrast — scratches or cracks may not be visible.");
  return { brightness: Math.round(mean), contrast: Math.round(contrast), sharpness: Number(sharpness.toFixed(1)), notes };
}

export function combineAssessments(parts: { kind: string; notes: string[] }[]): AiAssessment {
  const notes = parts.flatMap((p) => p.notes.map((n) => `${p.kind}: ${n}`));
  if (!notes.length) {
    notes.push("No obvious capture problems in the uploaded photos. Cosmetic condition still needs your confirmation and a physical inspection.");
  }
  return {
    overall: "Needs confirmation",
    screen: "Needs confirmation",
    backPanel: "Needs confirmation",
    frame: "Needs confirmation",
    cameraArea: "Needs confirmation",
    notes,
    confidence: "low",
  };
}

export async function assessPhotoUrl(url: string, kind: string) {
  if (typeof window === "undefined") {
    return { kind, notes: ["Server-side pixel analysis is not used."] };
  }
  return new Promise<{ kind: string; notes: string[] }>((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const max = 480;
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve({ kind, notes: ["Could not read this photo in the browser."] });
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const result = assessImageData(pixels.data, canvas.width, canvas.height);
      resolve({ kind, notes: result.notes });
    };
    img.onerror = () => resolve({ kind, notes: ["Could not load this photo for assistive review."] });
    img.src = url;
  });
}
