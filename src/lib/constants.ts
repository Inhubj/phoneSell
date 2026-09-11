export const BUSINESS = {
  name: "PhoneSell",
  legalName: "PhoneSell",
  tagline: "Sell Your Phone, Get the Best Value",
  phone: "7068867486",
  phoneDisplay: "7068867486",
  telHref: "tel:7068867486",
  whatsapp: "917068867486",
  email: "Phone0Sell@gmail.com",
  mailto: "mailto:Phone0Sell@gmail.com",
  addressLine1: "Singapore Plaza, Opp. Razzas Mall",
  addressLine2: "Mira Road East, Thane, Maharashtra – 401107",
  area: "Mira Road East",
  city: "Thane",
  state: "Maharashtra",
  pincode: "401107",
  country: "IN",
  hours: "Mon–Sun, 10:00 AM – 10:00 PM",
  geo: { lat: 19.2865, lng: 72.8691 },
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=Singapore+Plaza+Mira+Road+East+Thane",
  embedMaps:
    "https://maps.google.com/maps?q=Singapore%20Plaza%20Opp.%20Razzas%20Mall%20Mira%20Road%20East%20Thane%20401107&t=&z=15&ie=UTF8&iwloc=&output=embed",
  social: {
    instagram: "https://www.instagram.com/phonesell0",
    instagramHandle: "phonesell0",
    facebook: "https://www.facebook.com/",
    youtube: "https://www.youtube.com/",
    whatsapp: "https://wa.me/917068867486",
  },
} as const;

export const WHATSAPP_MESSAGE =
  "Hi PhoneSell, I want to sell my phone. Please help me get a valuation.";

export const PRICE_DISCLAIMER =
  "The online value is an estimated price based on the information provided. Final purchase value may change after physical inspection and verification of the device.";

export const SHORT_DISCLAIMER =
  "Final price is subject to physical inspection and device verification at pickup.";

export const ORDER_STATUSES = [
  "NEW_LEAD",
  "QUOTE_GENERATED",
  "CONTACTED",
  "PICKUP_PENDING",
  "PICKUP_ASSIGNED",
  "EXECUTIVE_ON_THE_WAY",
  "DEVICE_COLLECTED",
  "UNDER_INSPECTION",
  "PRICE_REVISED",
  "CUSTOMER_ACCEPTED",
  "PAYMENT_PENDING",
  "PAYMENT_COMPLETED",
  "PURCHASE_COMPLETED",
  "CANCELLED",
  "REJECTED",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const STATUS_LABELS: Record<OrderStatus, string> = {
  NEW_LEAD: "New",
  QUOTE_GENERATED: "Quote Generated",
  CONTACTED: "Contacted",
  PICKUP_PENDING: "Pickup Scheduled",
  PICKUP_ASSIGNED: "Pickup Assigned",
  EXECUTIVE_ON_THE_WAY: "Executive On The Way",
  DEVICE_COLLECTED: "Picked Up",
  UNDER_INSPECTION: "Inspection Pending",
  PRICE_REVISED: "Inspection Completed",
  CUSTOMER_ACCEPTED: "Price Confirmed",
  PAYMENT_PENDING: "Payment Pending",
  PAYMENT_COMPLETED: "Payment Completed",
  PURCHASE_COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  REJECTED: "Cancelled",
};

export const DEVICE_TYPES = [
  { key: "PHONE", label: "Mobile" },
  { key: "LAPTOP", label: "Laptop" },
  { key: "TABLET", label: "Tablet" },
  { key: "OTHER", label: "Other" },
] as const;

export const PICKUP_ACTIONS = [
  { action: "REACHED", status: "EXECUTIVE_ON_THE_WAY", pickup: "REACHED", label: "Reached customer" },
  { action: "STARTED", status: "EXECUTIVE_ON_THE_WAY", pickup: "STARTED", label: "Pickup started" },
  { action: "COLLECTED", status: "DEVICE_COLLECTED", pickup: "COLLECTED", label: "Device collected" },
  { action: "COMPLETED", status: "UNDER_INSPECTION", pickup: "COMPLETED", label: "Pickup completed" },
  { action: "UNAVAILABLE", status: "PICKUP_PENDING", pickup: "CUSTOMER_UNAVAILABLE", label: "Customer not available" },
  { action: "RESCHEDULED", status: "PICKUP_PENDING", pickup: "RESCHEDULED", label: "Pickup rescheduled" },
  { action: "CANCELLED", status: "CANCELLED", pickup: "CANCELLED", label: "Cancelled" },
] as const;

export const TRACK_STEPS = [
  { key: "received", label: "Order Received", statuses: ["NEW_LEAD", "QUOTE_GENERATED", "CONTACTED", "PICKUP_PENDING"] },
  { key: "assigned", label: "Pickup Assigned", statuses: ["PICKUP_ASSIGNED"] },
  { key: "executive", label: "Executive Assigned", statuses: ["EXECUTIVE_ON_THE_WAY"] },
  { key: "collected", label: "Pickup Completed", statuses: ["DEVICE_COLLECTED"] },
  { key: "inspection", label: "Inspection Completed", statuses: ["UNDER_INSPECTION", "PRICE_REVISED"] },
  { key: "price", label: "Final Price", statuses: ["CUSTOMER_ACCEPTED", "PAYMENT_PENDING"] },
  { key: "paid", label: "Payment Completed", statuses: ["PAYMENT_COMPLETED", "PURCHASE_COMPLETED"] },
] as const;

export const PHOTO_KINDS = [
  { key: "front", label: "Front", required: true },
  { key: "back", label: "Back", required: true },
  { key: "left", label: "Left side", required: false },
  { key: "right", label: "Right side", required: false },
  { key: "screen", label: "Screen", required: true },
  { key: "damage", label: "Damage area", required: false },
] as const;

export const NAV = [
  { href: "/", label: "Home" },
  { href: "/sell", label: "Sell Your Phone" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/why-us", label: "Why Us" },
  { href: "/faq", label: "FAQ" },
  { href: "/track", label: "Track Order" },
  { href: "/login", label: "Login" },
] as const;
