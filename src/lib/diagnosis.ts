export const RESULT_SOURCES = ["AUTO", "TEST_PASSED", "CUSTOMER", "UNSUPPORTED", "ASSISTIVE", "DENIED"] as const;
export type ResultSource = (typeof RESULT_SOURCES)[number];

export const SOURCE_LABELS: Record<ResultSource, string> = {
  AUTO: "Automatically Detected",
  TEST_PASSED: "Test Passed",
  CUSTOMER: "Customer Confirmed",
  UNSUPPORTED: "Unable to Test",
  ASSISTIVE: "Assistive estimate",
  DENIED: "Permission denied",
};

export type TestResult = {
  key: string;
  label: string;
  outcome: string;
  source: ResultSource;
  detail?: string;
};

export type BrowserSignals = {
  userAgent: string;
  language: string;
  platform: string;
  vendor: string;
  uaBrands: { brand: string; version: string }[];
  uaMobile: boolean | null;
  uaPlatform: string;
  hints: {
    model?: string;
    platformVersion?: string;
    uaFullVersion?: string;
    architecture?: string;
    fullVersionList?: { brand: string; version: string }[];
  } | null;
  screen: { width: number; height: number; availWidth: number; availHeight: number; dpr: number; orientation: string };
  maxTouchPoints: number;
  cookiesEnabled: boolean;
  online: boolean;
  connection: { type?: string; effectiveType?: string; downlink?: number; rtt?: number } | null;
  battery: { level: number; charging: boolean } | null;
  media: {
    enumerateSupported: boolean;
    videoInputs: number;
    audioInputs: number;
    audioOutputs: number;
  };
  capabilities: {
    camera: boolean;
    microphone: boolean;
    geolocation: boolean;
    vibration: boolean;
    bluetoothApi: boolean;
    nfcApi: boolean;
    batteryApi: boolean;
    networkApi: boolean;
    mediaDevices: boolean;
    torchHint: boolean;
  };
};

export type DetectionSummary = {
  deviceType: string;
  brandHint: string;
  modelHint: string;
  os: string;
  osVersion: string;
  browser: string;
  confidence: "high" | "low" | "none";
  notes: string[];
};

export type BatteryRecord = {
  source: "AUTO" | "CUSTOMER" | "UNAVAILABLE";
  chargeLevel: number | null;
  charging: boolean | null;
  healthPercent: number | null;
  healthBand: string;
  note: string;
};

export type AiAssessment = {
  overall: string;
  screen: string;
  backPanel: string;
  frame: string;
  cameraArea: string;
  notes: string[];
  confidence: "low";
  customerOverride?: string;
};

export const DIAGNOSIS_STEPS = [
  { key: "consent", label: "Permission", progress: 5 },
  { key: "detect", label: "Device Detection", progress: 15 },
  { key: "model", label: "Model", progress: 18 },
  { key: "variant", label: "Storage", progress: 20 },
  { key: "camera", label: "Camera", progress: 28 },
  { key: "audio", label: "Mic & Speaker", progress: 34 },
  { key: "screen", label: "Screen", progress: 40 },
  { key: "touch", label: "Touch", progress: 45 },
  { key: "hardware", label: "Hardware", progress: 50 },
  { key: "battery", label: "Battery", progress: 55 },
  { key: "network", label: "Network", progress: 60 },
  { key: "gps", label: "Location", progress: 65 },
  { key: "identity", label: "IMEI", progress: 68 },
  { key: "condition", label: "Condition", progress: 72 },
  { key: "photos", label: "Photos", progress: 75 },
  { key: "result", label: "Diagnosis", progress: 85 },
  { key: "quote", label: "Valuation", progress: 92 },
  { key: "details", label: "Details", progress: 96 },
  { key: "pickup", label: "Pickup", progress: 100 },
] as const;

export type DiagnosisStep = (typeof DIAGNOSIS_STEPS)[number]["key"];

export const HARDWARE_CHECKS = [
  { key: "power", label: "Power button", auto: false },
  { key: "volUp", label: "Volume up", auto: false },
  { key: "volDown", label: "Volume down", auto: false },
  { key: "silent", label: "Silent switch (if present)", auto: false },
  { key: "fingerprint", label: "Fingerprint sensor", auto: false },
  { key: "face", label: "Face unlock", auto: false },
  { key: "vibration", label: "Vibration", auto: true },
  { key: "flash", label: "Flash / torch", auto: true },
  { key: "charging", label: "Charging", auto: true },
  { key: "wireless", label: "Wireless charging", auto: false },
  { key: "bluetooth", label: "Bluetooth", auto: false },
  { key: "wifi", label: "Wi-Fi", auto: false },
  { key: "nfc", label: "NFC", auto: false },
  { key: "sim", label: "SIM / mobile calling", auto: false },
] as const;

export const DIAGNOSIS_CONDITION = [
  {
    key: "screen",
    title: "Screen",
    options: [
      { key: "perfect", label: "No damage" },
      { key: "minor", label: "Minor scratches" },
      { key: "cracked", label: "Cracked" },
      { key: "broken", label: "Display issue" },
    ],
  },
  {
    key: "body",
    title: "Body",
    options: [
      { key: "excellent", label: "Excellent" },
      { key: "minor", label: "Minor scratches" },
      { key: "heavy", label: "Major scratches/dents" },
      { key: "damaged", label: "Broken/damaged" },
    ],
  },
  {
    key: "camera",
    title: "Camera",
    options: [
      { key: "working", label: "Working" },
      { key: "not_working", label: "Not working" },
      { key: "glass", label: "Camera glass damaged" },
    ],
  },
  {
    key: "batteryAsk",
    title: "Battery",
    options: [
      { key: "good", label: "Good" },
      { key: "average", label: "Average" },
      { key: "poor", label: "Poor" },
    ],
  },
  {
    key: "charging",
    title: "Charging",
    options: [
      { key: "working", label: "Working" },
      { key: "intermittent", label: "Slow" },
      { key: "not_working", label: "Not working" },
    ],
  },
  {
    key: "water",
    title: "Water damage",
    options: [
      { key: "No", label: "No" },
      { key: "Yes", label: "Yes" },
      { key: "Not sure", label: "Not sure" },
    ],
  },
  {
    key: "repaired",
    title: "Repairs",
    options: [
      { key: "No", label: "Never repaired" },
      { key: "Yes", label: "Repaired" },
      { key: "Don't Know", label: "Not sure" },
    ],
  },
] as const;

export const DIAGNOSIS_PHOTOS = [
  { key: "front", label: "Front of phone", required: true, hint: "Front screen, full phone visible" },
  { key: "back", label: "Back of phone", required: true, hint: "Back panel, camera module, overall condition" },
  { key: "left", label: "Left", required: false, hint: "Optional side photo" },
  { key: "right", label: "Right", required: false, hint: "Optional side photo" },
] as const;

export function parseUserAgent(ua: string, hints: BrowserSignals["hints"], uaPlatform: string) {
  const browser = detectBrowser(ua, hints);
  const { os, osVersion } = detectOs(ua, hints, uaPlatform);
  return { browser, os, osVersion };
}

function detectBrowser(ua: string, hints: BrowserSignals["hints"]) {
  const list = hints?.fullVersionList || [];
  const named = list.find((b) => !/not_|chromium/i.test(b.brand));
  if (named) return `${named.brand} ${named.version}`.trim();
  if (/Edg\//.test(ua)) return "Microsoft Edge";
  if (/OPR\//.test(ua) || /Opera/.test(ua)) return "Opera";
  if (/Chrome\//.test(ua) && !/Edg\//.test(ua)) return "Chrome";
  if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) return "Safari";
  if (/Firefox\//.test(ua)) return "Firefox";
  return "Unknown browser";
}

function detectOs(ua: string, hints: BrowserSignals["hints"], uaPlatform: string) {
  const platform = (hints && uaPlatform) || uaPlatform || "";
  if (/iPhone|iPad|iOS/i.test(ua) || /iOS|iPhone/i.test(platform)) {
    const m = ua.match(/OS (\d+)[_.](\d+)/);
    return { os: "iOS", osVersion: m ? `${m[1]}.${m[2]}` : hints?.platformVersion || "" };
  }
  if (/Android/i.test(ua) || /Android/i.test(platform)) {
    const m = ua.match(/Android ([\d.]+)/);
    return { os: "Android", osVersion: m?.[1] || hints?.platformVersion || "" };
  }
  if (/Windows/i.test(ua) || /Windows/i.test(platform)) {
    return { os: "Windows", osVersion: hints?.platformVersion || "" };
  }
  if (/Mac OS X|Macintosh/i.test(ua) || /macOS/i.test(platform)) {
    return { os: "macOS", osVersion: hints?.platformVersion || "" };
  }
  return { os: platform || "Unknown", osVersion: hints?.platformVersion || "" };
}

export function summarizeDetection(signals: BrowserSignals): DetectionSummary {
  const { browser, os, osVersion } = parseUserAgent(signals.userAgent, signals.hints, signals.uaPlatform);
  const notes: string[] = [];
  const modelHint = (signals.hints?.model || "").trim();
  let brandHint = "";
  let deviceType = "PHONE";
  let confidence: DetectionSummary["confidence"] = "none";

  if (/iPad/i.test(signals.userAgent)) deviceType = "TABLET";
  else if (/Android/i.test(signals.userAgent) && !signals.uaMobile && /Tablet/i.test(signals.userAgent)) deviceType = "TABLET";
  else if (!/Mobile|Android|iPhone|iPad/i.test(signals.userAgent) && !signals.uaMobile) {
    deviceType = "OTHER";
    notes.push("This browser does not look like a phone. Open the site on the device you want to sell for a better match.");
  }

  if (/iPhone/i.test(signals.userAgent) || /iOS/i.test(os)) brandHint = "Apple";
  else if (/Samsung|SM-/i.test(modelHint + signals.userAgent)) brandHint = "Samsung";
  else if (/Pixel/i.test(modelHint + signals.userAgent)) brandHint = "Google";
  else if (/OnePlus|ONEPLUS/i.test(modelHint + signals.userAgent)) brandHint = "OnePlus";
  else if (/Xiaomi|Redmi|POCO/i.test(modelHint + signals.userAgent)) brandHint = "Xiaomi";
  else if (/OPPO|CPH/i.test(modelHint)) brandHint = "OPPO";
  else if (/vivo|V\d{4}/i.test(modelHint)) brandHint = "vivo";
  else if (/realme/i.test(modelHint)) brandHint = "realme";
  else if (/Motorola|moto/i.test(modelHint)) brandHint = "Motorola";
  else if (/Nothing/i.test(modelHint)) brandHint = "Nothing";

  if (modelHint && !/^K\b|generic|android/i.test(modelHint)) {
    confidence = "low";
  }
  if (!modelHint) {
    notes.push("Browsers usually do not expose the exact iPhone/Android model. If we cannot match a catalogue model, please select it manually.");
  }
  if (os === "iOS" && !modelHint) {
    notes.push("Safari identifies this as an iPhone but not the exact model (for example iPhone 15 vs iPhone 13).");
  }

  return { deviceType, brandHint, modelHint, os, osVersion, browser, confidence, notes };
}

export function batteryBandFromHealth(healthPercent: number | null, isIos: boolean, fallback: string) {
  if (healthPercent == null || Number.isNaN(healthPercent)) {
    if (fallback === "good") return isIos ? "90_94" : "good";
    if (fallback === "average") return isIos ? "85_89" : "average";
    if (fallback === "poor") return isIos ? "below_80" : "poor";
    return isIos ? "90_94" : "good";
  }
  if (isIos) {
    if (healthPercent >= 95) return "95_100";
    if (healthPercent >= 90) return "90_94";
    if (healthPercent >= 85) return "85_89";
    if (healthPercent >= 80) return "80_84";
    return "below_80";
  }
  if (healthPercent >= 90) return "excellent";
  if (healthPercent >= 80) return "good";
  if (healthPercent >= 70) return "average";
  if (healthPercent >= 60) return "poor";
  return "replace";
}

export function testsToCondition(
  tests: TestResult[],
  answers: Record<string, string>,
  battery: BatteryRecord,
  isIos: boolean,
) {
  const byKey = Object.fromEntries(tests.map((t) => [t.key, t]));
  const failed = (key: string) => {
    const o = (byKey[key]?.outcome || "").toLowerCase();
    return o.includes("not working") || o.includes("failed") || o.includes("issue");
  };

  const screenAns = answers.screen || "perfect";
  const display = screenAns === "broken" || failed("screen") || failed("touch")
    ? failed("touch")
      ? "touch"
      : screenAns === "broken"
        ? "lines"
        : "working"
    : "working";

  const cameraAns = answers.camera || "working";
  const extras: Record<string, string> = {
    repaired: answers.repaired || "No",
    water: answers.water || "No",
    bill: answers.bill || "No",
    box: answers.box || "No",
    warranty: answers.warranty || "No",
    displayReplaced: answers.displayReplaced || "Don't Know",
    batteryReplaced: answers.batteryReplaced || "Don't Know",
    locked: answers.locked || "No",
  };
  if (cameraAns === "glass") extras.cameraGlass = "damaged";

  const condition: Record<string, string> = {
    screen: screenAns === "broken" ? "broken" : screenAns,
    body: answers.body || "good",
    display,
    cameraFront: failed("cameraFront") || cameraAns === "not_working" ? "not_working" : "working",
    cameraRear: failed("cameraRear") || cameraAns === "not_working" ? "not_working" : "working",
    speaker: failed("speaker") ? "not_working" : "working",
    microphone: failed("microphone") ? "not_working" : "working",
    charging: answers.charging || (failed("charging") ? "not_working" : "working"),
    biometric: failed("fingerprint") && failed("face") ? "not_working" : "working",
    network: failed("sim") || failed("network") ? "not_working" : "working",
    wifi: failed("wifi") ? "not_working" : "working",
    bluetooth: failed("bluetooth") ? "not_working" : "working",
    power: "working",
  };

  const healthBand = batteryBandFromHealth(battery.healthPercent, isIos, answers.batteryAsk || "good");

  return { condition, extras, battery: healthBand };
}

export function collectIssues(tests: TestResult[], answers: Record<string, string>, ai?: AiAssessment | null) {
  const issues: string[] = [];
  for (const t of tests) {
    const o = t.outcome.toLowerCase();
    if (o.includes("not working") || o.includes("failed") || o.includes("issue") || o.includes("denied")) {
      issues.push(`${t.label}: ${t.outcome}`);
    }
  }
  if (answers.screen && answers.screen !== "perfect") issues.push(`Screen: ${answers.screen}`);
  if (answers.body && !["excellent", "good"].includes(answers.body)) issues.push(`Body: ${answers.body}`);
  if (answers.camera === "not_working") issues.push("Camera not working");
  if (answers.camera === "glass") issues.push("Camera glass damaged");
  if (answers.water === "Yes") issues.push("Possible water damage");
  if (answers.repaired === "Yes") issues.push("Previously repaired");
  if (ai?.notes?.length) issues.push(...ai.notes.map((n) => `Photo check: ${n}`));
  return issues;
}

export function maskImei(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length < 4) return digits ? "****" : "";
  return `${"*".repeat(Math.max(0, digits.length - 4))}${digits.slice(-4)}`;
}

export function last4(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.slice(-4);
}
