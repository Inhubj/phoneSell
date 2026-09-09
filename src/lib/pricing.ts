import { prisma } from "./prisma";

export type QuoteInput = {
  variantId: string;
  isIos: boolean;
  condition: Record<string, string>;
  extras: Record<string, string>;
  battery: string;
};

export type QuoteResult = {
  basePrice: number;
  adjustments: { label: string; amount: number; key: string }[];
  estimatedPrice: number;
};

const CONDITION_RULE_MAP: Record<string, string> = {
  "screen:perfect": "screen_perfect",
  "screen:minor": "screen_minor",
  "screen:visible": "screen_visible",
  "screen:cracked": "screen_cracked",
  "screen:broken": "screen_broken",
  "body:excellent": "body_excellent",
  "body:good": "body_good",
  "body:minor": "body_minor",
  "body:heavy": "body_heavy",
  "body:damaged": "body_damaged",
  "display:working": "display_working",
  "display:minor": "display_minor",
  "display:pixels": "display_pixels",
  "display:lines": "display_lines",
  "display:touch": "display_touch",
  "display:dead": "display_dead",
  "power:working": "power_working",
  "power:restarts": "power_restarts",
  "power:no_switch": "power_no_switch",
  "power:dead": "power_dead",
  "charging:working": "charging_ok",
  "charging:intermittent": "charging_intermittent",
  "charging:not_working": "charging_dead",
  "cameraFront:not_working": "camera_front_dead",
  "cameraRear:not_working": "camera_rear_dead",
  "speaker:not_working": "speaker_dead",
  "microphone:not_working": "mic_dead",
  "biometric:not_working": "biometric_dead",
  "network:not_working": "network_dead",
  "wifi:not_working": "wifi_dead",
  "bluetooth:not_working": "bt_dead",
  "battery:95_100": "battery_95",
  "battery:90_94": "battery_90",
  "battery:85_89": "battery_85",
  "battery:80_84": "battery_80",
  "battery:below_80": "battery_below_80",
  "battery:excellent": "battery_android_excellent",
  "battery:good": "battery_android_good",
  "battery:average": "battery_android_average",
  "battery:poor": "battery_android_poor",
  "battery:replace": "battery_android_replace",
  "bill:Yes": "has_bill",
  "box:Yes": "has_box",
  "warranty:Yes": "has_warranty",
  "repaired:Yes": "was_repaired",
  "displayReplaced:Yes": "display_replaced",
  "batteryReplaced:Yes": "battery_replaced",
  "locked:Yes": "network_locked",
  "water:Yes": "water_damage",
  "cameraGlass:damaged": "camera_glass_damaged",
};

export async function calculateQuote(input: QuoteInput): Promise<QuoteResult> {
  const variant = await prisma.deviceVariant.findUnique({
    where: { id: input.variantId },
    include: { pricing: true, device: true },
  });
  if (!variant?.pricing?.isActive) {
    throw new Error("Variant pricing is not configured");
  }

  const rules = await prisma.pricingRule.findMany({ where: { isActive: true } });
  const ruleMap = new Map(rules.map((r) => [r.key, r]));

  const basePrice = variant.pricing.basePrice;
  const adjustments: QuoteResult["adjustments"] = [];

  const applyKey = (lookup: string) => {
    const ruleKey = CONDITION_RULE_MAP[lookup];
    if (!ruleKey) return;
    const rule = ruleMap.get(ruleKey);
    if (!rule || rule.amount === 0) return;
    const amount = rule.isPercent
      ? Math.round((basePrice * rule.amount) / 100)
      : rule.amount;
    adjustments.push({ label: rule.label, amount, key: rule.key });
  };

  for (const [k, v] of Object.entries(input.condition)) {
    applyKey(`${k}:${v}`);
  }
  applyKey(`battery:${input.battery}`);
  for (const [k, v] of Object.entries(input.extras)) {
    applyKey(`${k}:${v}`);
  }

  const totalAdj = adjustments.reduce((s, a) => s + a.amount, 0);
  const estimatedPrice = Math.max(500, basePrice + totalAdj);

  return { basePrice, adjustments, estimatedPrice };
}
