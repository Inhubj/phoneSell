export const CONDITION_STEPS = [
  {
    key: "screen",
    title: "Screen Condition",
    options: [
      { key: "perfect", label: "Perfect / No scratches" },
      { key: "minor", label: "Minor scratches" },
      { key: "visible", label: "Visible scratches" },
      { key: "cracked", label: "Cracked" },
      { key: "broken", label: "Broken / Damaged" },
    ],
  },
  {
    key: "body",
    title: "Body Condition",
    options: [
      { key: "excellent", label: "Excellent" },
      { key: "good", label: "Good" },
      { key: "minor", label: "Minor scratches" },
      { key: "heavy", label: "Heavy scratches/dents" },
      { key: "damaged", label: "Damaged" },
    ],
  },
  {
    key: "display",
    title: "Display",
    options: [
      { key: "working", label: "Fully working" },
      { key: "minor", label: "Minor issue" },
      { key: "pixels", label: "Dead pixels" },
      { key: "lines", label: "Lines on display" },
      { key: "touch", label: "Touch issue" },
      { key: "dead", label: "Display not working" },
    ],
  },
  {
    key: "cameraFront",
    title: "Front Camera",
    options: [
      { key: "working", label: "Working" },
      { key: "not_working", label: "Not working" },
    ],
  },
  {
    key: "cameraRear",
    title: "Rear Camera",
    options: [
      { key: "working", label: "Working" },
      { key: "not_working", label: "Not working" },
    ],
  },
  {
    key: "speaker",
    title: "Speaker",
    options: [
      { key: "working", label: "Working" },
      { key: "not_working", label: "Not working" },
    ],
  },
  {
    key: "microphone",
    title: "Microphone",
    options: [
      { key: "working", label: "Working" },
      { key: "not_working", label: "Not working" },
    ],
  },
  {
    key: "charging",
    title: "Charging Port",
    options: [
      { key: "working", label: "Working" },
      { key: "intermittent", label: "Intermittent" },
      { key: "not_working", label: "Not working" },
    ],
  },
  {
    key: "biometric",
    title: "Face ID / Touch ID / Fingerprint",
    options: [
      { key: "working", label: "Working" },
      { key: "not_working", label: "Not working" },
    ],
  },
  {
    key: "network",
    title: "Network / SIM",
    options: [
      { key: "working", label: "Working" },
      { key: "not_working", label: "Not working" },
    ],
  },
  {
    key: "wifi",
    title: "Wi-Fi",
    options: [
      { key: "working", label: "Working" },
      { key: "not_working", label: "Not working" },
    ],
  },
  {
    key: "bluetooth",
    title: "Bluetooth",
    options: [
      { key: "working", label: "Working" },
      { key: "not_working", label: "Not working" },
    ],
  },
  {
    key: "power",
    title: "Phone Power",
    options: [
      { key: "working", label: "Fully working" },
      { key: "restarts", label: "Sometimes restarts" },
      { key: "no_switch", label: "Does not switch on" },
      { key: "dead", label: "Completely dead" },
    ],
  },
] as const;

export const IOS_BATTERY = [
  { key: "95_100", label: "95–100%" },
  { key: "90_94", label: "90–94%" },
  { key: "85_89", label: "85–89%" },
  { key: "80_84", label: "80–84%" },
  { key: "below_80", label: "Below 80%" },
] as const;

export const ANDROID_BATTERY = [
  { key: "excellent", label: "Excellent" },
  { key: "good", label: "Good" },
  { key: "average", label: "Average" },
  { key: "poor", label: "Poor" },
  { key: "replace", label: "Battery needs replacement" },
] as const;

export const EXTRA_QUESTIONS = [
  { key: "bill", title: "Do you have the original bill?", options: ["Yes", "No"] },
  { key: "box", title: "Do you have the original box?", options: ["Yes", "No"] },
  { key: "warranty", title: "Is the phone under warranty?", options: ["Yes", "No"] },
  { key: "repaired", title: "Is the phone repaired previously?", options: ["Yes", "No", "Don't Know"] },
  { key: "displayReplaced", title: "Has the display been replaced?", options: ["Yes", "No", "Don't Know"] },
  { key: "batteryReplaced", title: "Has the battery been replaced?", options: ["Yes", "No", "Don't Know"] },
  { key: "locked", title: "Is the device carrier/network locked?", options: ["Yes", "No", "Don't Know"] },
] as const;

export type ConditionAnswers = Record<string, string>;
export type ExtraAnswers = Record<string, string>;
