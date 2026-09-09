import type { BrowserSignals } from "./diagnosis";

export async function collectBrowserSignals(): Promise<BrowserSignals> {
  const nav = navigator as Navigator & {
    userAgentData?: {
      brands: { brand: string; version: string }[];
      mobile: boolean;
      platform: string;
      getHighEntropyValues: (hints: string[]) => Promise<Record<string, unknown>>;
    };
    connection?: { type?: string; effectiveType?: string; downlink?: number; rtt?: number };
    mozConnection?: { type?: string; effectiveType?: string; downlink?: number; rtt?: number };
    getBattery?: () => Promise<{ level: number; charging: boolean }>;
  };

  let hints: BrowserSignals["hints"] = null;
  if (nav.userAgentData?.getHighEntropyValues) {
    try {
      const values = await nav.userAgentData.getHighEntropyValues([
        "model",
        "platformVersion",
        "uaFullVersion",
        "architecture",
        "fullVersionList",
      ]);
      hints = {
        model: String(values.model || ""),
        platformVersion: String(values.platformVersion || ""),
        uaFullVersion: String(values.uaFullVersion || ""),
        architecture: String(values.architecture || ""),
        fullVersionList: Array.isArray(values.fullVersionList)
          ? (values.fullVersionList as { brand: string; version: string }[])
          : undefined,
      };
    } catch {
      hints = null;
    }
  }

  let battery: BrowserSignals["battery"] = null;
  if (typeof nav.getBattery === "function") {
    try {
      const b = await nav.getBattery();
      battery = { level: Math.round(b.level * 100), charging: Boolean(b.charging) };
    } catch {
      battery = null;
    }
  }

  const connection = nav.connection || nav.mozConnection || null;
  let media = { enumerateSupported: false, videoInputs: 0, audioInputs: 0, audioOutputs: 0 };
  if (navigator.mediaDevices?.enumerateDevices) {
    media.enumerateSupported = true;
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      media = {
        enumerateSupported: true,
        videoInputs: devices.filter((d) => d.kind === "videoinput").length,
        audioInputs: devices.filter((d) => d.kind === "audioinput").length,
        audioOutputs: devices.filter((d) => d.kind === "audiooutput").length,
      };
    } catch {
      /* ignore */
    }
  }

  const orientation =
    screen.orientation?.type ||
    (window.innerWidth > window.innerHeight ? "landscape" : "portrait");

  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    vendor: navigator.vendor,
    uaBrands: nav.userAgentData?.brands || [],
    uaMobile: nav.userAgentData ? nav.userAgentData.mobile : /Mobi|Android/i.test(navigator.userAgent),
    uaPlatform: nav.userAgentData?.platform || navigator.platform,
    hints,
    screen: {
      width: window.screen.width,
      height: window.screen.height,
      availWidth: window.screen.availWidth,
      availHeight: window.screen.availHeight,
      dpr: window.devicePixelRatio || 1,
      orientation,
    },
    maxTouchPoints: navigator.maxTouchPoints || 0,
    cookiesEnabled: navigator.cookieEnabled,
    online: navigator.onLine,
    connection: connection
      ? {
          type: connection.type,
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
        }
      : null,
    battery,
    media,
    capabilities: {
      camera: Boolean(navigator.mediaDevices?.getUserMedia),
      microphone: Boolean(navigator.mediaDevices?.getUserMedia),
      geolocation: Boolean(navigator.geolocation),
      vibration: typeof navigator.vibrate === "function",
      bluetoothApi: "bluetooth" in navigator,
      nfcApi: "NDEFReader" in window,
      batteryApi: typeof nav.getBattery === "function",
      networkApi: Boolean(connection),
      mediaDevices: Boolean(navigator.mediaDevices),
      torchHint: /Android/i.test(navigator.userAgent),
    },
  };
}
