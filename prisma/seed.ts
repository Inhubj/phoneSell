import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { CATALOG } from "./catalog";

const prisma = new PrismaClient();

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const AREAS = [
  "Mumbai",
  "Mira Road",
  "Bhayandar",
  "Thane",
  "Borivali",
  "Kandivali",
  "Malad",
  "Goregaon",
  "Andheri",
  "Jogeshwari",
  "Vile Parle",
  "Santacruz",
  "Bandra",
  "Kurla",
  "Ghatkopar",
  "Mulund",
  "Bhandup",
  "Powai",
  "Vikhroli",
  "Dahisar",
  "Vasai",
  "Virar",
  "Navi Mumbai",
];

const PRICING_RULES = [
  { category: "SCREEN", key: "screen_perfect", label: "Screen perfect", amount: 0 },
  { category: "SCREEN", key: "screen_minor", label: "Screen minor scratches", amount: -500 },
  { category: "SCREEN", key: "screen_visible", label: "Screen visible scratches", amount: -1500 },
  { category: "SCREEN", key: "screen_cracked", label: "Screen cracked", amount: -5000 },
  { category: "SCREEN", key: "screen_broken", label: "Screen broken", amount: -8000 },
  { category: "BODY", key: "body_excellent", label: "Excellent body condition", amount: 1500 },
  { category: "BODY", key: "body_good", label: "Good body condition", amount: 0 },
  { category: "BODY", key: "body_minor", label: "Body minor scratches", amount: -800 },
  { category: "BODY", key: "body_heavy", label: "Body heavy scratches/dents", amount: -1500 },
  { category: "BODY", key: "body_damaged", label: "Body damaged", amount: -3000 },
  { category: "DISPLAY", key: "display_working", label: "Display fully working", amount: 0 },
  { category: "DISPLAY", key: "display_minor", label: "Display minor issue", amount: -1500 },
  { category: "DISPLAY", key: "display_pixels", label: "Dead pixels", amount: -2500 },
  { category: "DISPLAY", key: "display_lines", label: "Lines on display", amount: -4000 },
  { category: "DISPLAY", key: "display_touch", label: "Touch issue", amount: -4500 },
  { category: "DISPLAY", key: "display_dead", label: "Display not working", amount: -7000 },
  { category: "POWER", key: "power_working", label: "Phone fully working", amount: 0 },
  { category: "POWER", key: "power_restarts", label: "Sometimes restarts", amount: -2500 },
  { category: "POWER", key: "power_no_switch", label: "Does not switch on", amount: -8000 },
  { category: "POWER", key: "power_dead", label: "Completely dead", amount: -10000 },
  { category: "BATTERY", key: "battery_95", label: "Battery 95–100%", amount: 800 },
  { category: "BATTERY", key: "battery_90", label: "Battery 90–94%", amount: 0 },
  { category: "BATTERY", key: "battery_85", label: "Battery 85–89%", amount: -800 },
  { category: "BATTERY", key: "battery_80", label: "Battery 80–84%", amount: -1500 },
  { category: "BATTERY", key: "battery_below_80", label: "Battery below 80%", amount: -2000 },
  { category: "BATTERY", key: "battery_android_excellent", label: "Android battery excellent", amount: 500 },
  { category: "BATTERY", key: "battery_android_good", label: "Android battery good", amount: 0 },
  { category: "BATTERY", key: "battery_android_average", label: "Android battery average", amount: -800 },
  { category: "BATTERY", key: "battery_android_poor", label: "Android battery poor", amount: -1500 },
  { category: "BATTERY", key: "battery_android_replace", label: "Battery needs replacement", amount: -2500 },
  { category: "COMPONENT", key: "charging_ok", label: "Charging port working", amount: 0 },
  { category: "COMPONENT", key: "charging_intermittent", label: "Charging intermittent", amount: -1200 },
  { category: "COMPONENT", key: "charging_dead", label: "Charging port not working", amount: -2500 },
  { category: "COMPONENT", key: "camera_front_dead", label: "Front camera not working", amount: -1500 },
  { category: "COMPONENT", key: "camera_rear_dead", label: "Rear camera not working", amount: -2500 },
  { category: "COMPONENT", key: "speaker_dead", label: "Speaker not working", amount: -1000 },
  { category: "COMPONENT", key: "mic_dead", label: "Microphone not working", amount: -1000 },
  { category: "COMPONENT", key: "biometric_dead", label: "Face ID / fingerprint not working", amount: -2000 },
  { category: "COMPONENT", key: "network_dead", label: "Network/SIM not working", amount: -3000 },
  { category: "COMPONENT", key: "wifi_dead", label: "Wi-Fi not working", amount: -800 },
  { category: "COMPONENT", key: "bt_dead", label: "Bluetooth not working", amount: -500 },
  { category: "ACCESSORY", key: "has_bill", label: "Original bill available", amount: 500 },
  { category: "ACCESSORY", key: "has_box", label: "Original box available", amount: 300 },
  { category: "ACCESSORY", key: "has_warranty", label: "Under warranty", amount: 800 },
  { category: "ACCESSORY", key: "was_repaired", label: "Previously repaired", amount: -1500 },
  { category: "ACCESSORY", key: "display_replaced", label: "Display replaced", amount: -2000 },
  { category: "ACCESSORY", key: "battery_replaced", label: "Battery replaced", amount: -800 },
  { category: "ACCESSORY", key: "network_locked", label: "Carrier/network locked", amount: -2500 },
  { category: "COMPONENT", key: "water_damage", label: "Possible water damage", amount: -4000 },
  { category: "COMPONENT", key: "camera_glass_damaged", label: "Camera glass damaged", amount: -1200 },
  { category: "CONDITION", key: "cond_excellent", label: "Overall excellent", amount: 1500 },
  { category: "CONDITION", key: "cond_good", label: "Overall good", amount: 0 },
  { category: "CONDITION", key: "cond_average", label: "Overall average", amount: -1500 },
  { category: "CONDITION", key: "cond_poor", label: "Overall poor", amount: -3500 },
  { category: "CONDITION", key: "cond_broken", label: "Overall broken", amount: -7000 },
  { category: "CONDITION", key: "cond_not_working", label: "Overall not working", amount: -10000 },
];

async function main() {
  const password = await bcrypt.hash("RoyalAdmin@2026", 12);
  const execPassword = await bcrypt.hash("Pickup@2026", 12);

  await prisma.user.upsert({
    where: { email: "nathan.k@example.net" },
    update: { passwordHash: password, isActive: true, role: "SUPER_ADMIN", phone: "7068867486", name: "PhoneSell Admin" },
    create: {
      email: "nathan.k@example.net",
      username: "admin",
      passwordHash: password,
      name: "PhoneSell Admin",
      phone: "7068867486",
      role: "SUPER_ADMIN",
    },
  });

  await prisma.user.upsert({
    where: { email: "samuel.w@example.com" },
    update: {},
    create: {
      email: "samuel.w@example.com",
      username: "manager",
      passwordHash: password,
      name: "Operations Manager",
      phone: "7068867486",
      role: "MANAGER",
    },
  });

  await prisma.user.upsert({
    where: { email: "yosef.c@example.com" },
    update: { role: "OPERATIONS" },
    create: {
      email: "yosef.c@example.com",
      username: "operations",
      passwordHash: password,
      name: "Operations Admin",
      role: "OPERATIONS",
    },
  });
  await prisma.user.upsert({
    where: { email: "tom.h@example.org" },
    update: { role: "CATALOGUE" },
    create: {
      email: "tom.h@example.org",
      username: "catalogue",
      passwordHash: password,
      name: "Catalogue Admin",
      role: "CATALOGUE",
    },
  });
  await prisma.user.upsert({
    where: { email: "olivia.t@example.org" },
    update: { role: "REPORTING" },
    create: {
      email: "olivia.t@example.org",
      username: "reporting",
      passwordHash: password,
      name: "Reporting Admin",
      role: "REPORTING",
    },
  });

  await prisma.user.upsert({
    where: { email: "ivan.p@example.net" },
    update: { role: "ADMIN", phone: "7068867487" },
    create: {
      email: "ivan.p@example.net",
      username: "staffadmin",
      passwordHash: password,
      name: "Staff Admin",
      phone: "7068867487",
      role: "ADMIN",
    },
  });

  await prisma.systemSetting.upsert({
    where: { key: "loginRetentionMonths" },
    update: {},
    create: { key: "loginRetentionMonths", value: "3" },
  });

  for (const [index, brand] of CATALOG.entries()) {
    const created = await prisma.brand.upsert({
      where: { slug: brand.slug },
      update: { name: brand.name, isActive: true, sortOrder: index },
      create: { name: brand.name, slug: brand.slug, isActive: true, sortOrder: index },
    });

    for (const device of brand.devices) {
      const d = await prisma.device.upsert({
        where: { brandId_slug: { brandId: created.id, slug: slugify(device.name) } },
        update: {
          name: device.name,
          series: device.series,
          launchYear: device.year,
          originalPrice: device.original,
          isIos: Boolean(device.ios),
          deviceType: device.deviceType || "PHONE",
          processor: device.processor || null,
          isActive: true,
        },
        create: {
          brandId: created.id,
          name: device.name,
          slug: slugify(device.name),
          series: device.series,
          launchYear: device.year,
          originalPrice: device.original,
          isIos: Boolean(device.ios),
          deviceType: device.deviceType || "PHONE",
          processor: device.processor || null,
          isActive: true,
        },
      });

      for (const variant of device.variants) {
        const row = await prisma.deviceVariant.upsert({
          where: {
            deviceId_ramGb_storageGb_colour: {
              deviceId: d.id,
              ramGb: variant.ram,
              storageGb: variant.storage,
              colour: "Standard",
            },
          },
          update: { isActive: true, originalPrice: variant.original ?? device.original, processor: device.processor || null },
          create: {
            deviceId: d.id,
            ramGb: variant.ram,
            storageGb: variant.storage,
            colour: "Standard",
            processor: device.processor || null,
            originalPrice: variant.original ?? device.original,
            isActive: true,
          },
        });
        await prisma.devicePricing.upsert({
          where: { variantId: row.id },
          update: { basePrice: variant.price },
          create: { variantId: row.id, basePrice: variant.price },
        });
      }
    }
  }

  for (const rule of PRICING_RULES) {
    await prisma.pricingRule.upsert({
      where: { key: rule.key },
      update: { label: rule.label, amount: rule.amount, category: rule.category, isActive: true },
      create: rule,
    });
  }

  const conditions = [
    ["screen", "perfect", "Perfect / No scratches"],
    ["screen", "minor", "Minor scratches"],
    ["body", "excellent", "Excellent"],
    ["body", "good", "Good"],
  ];
  for (const [i, [category, key, label]] of conditions.entries()) {
    await prisma.deviceCondition.upsert({
      where: { key: `${category}_${key}` },
      update: { label },
      create: { category, key: `${category}_${key}`, label, sortOrder: i },
    });
  }

  for (const [i, name] of AREAS.entries()) {
    await prisma.serviceArea.upsert({
      where: { slug: slugify(name) },
      update: { isActive: true, city: name === "Thane" || name === "Navi Mumbai" || name === "Vasai" || name === "Virar" ? name : "Mumbai" },
      create: {
        name,
        slug: slugify(name),
        city: ["Thane", "Navi Mumbai", "Vasai", "Virar"].includes(name) ? name : name === "Mira Road" || name === "Bhayandar" ? "Thane" : "Mumbai",
        pickupCharge: i === 0 ? 0 : name === "Virar" || name === "Vasai" ? 150 : 0,
        etaHours: name === "Virar" || name === "Vasai" ? 36 : 24,
        isActive: true,
      },
    });
  }

  const slots = [
    { label: "9 AM – 12 PM", startTime: "09:00", endTime: "12:00", sortOrder: 1 },
    { label: "12 PM – 3 PM", startTime: "12:00", endTime: "15:00", sortOrder: 2 },
    { label: "3 PM – 6 PM", startTime: "15:00", endTime: "18:00", sortOrder: 3 },
    { label: "6 PM – 9 PM", startTime: "18:00", endTime: "21:00", sortOrder: 4 },
  ];
  for (const slot of slots) {
    const existing = await prisma.pickupSlot.findFirst({ where: { label: slot.label } });
    if (existing) {
      await prisma.pickupSlot.update({ where: { id: existing.id }, data: { isActive: true, ...slot } });
    } else {
      await prisma.pickupSlot.create({ data: slot });
    }
  }

  const mira = await prisma.serviceArea.findUnique({ where: { slug: "mira-road" } });
  await prisma.pickupExecutive.upsert({
    where: { employeeId: "RMT-EXE-001" },
    update: { passwordHash: execPassword, isActive: true },
    create: {
      name: "Rahul Sharma",
      mobile: "9876543210",
      email: "aaron.s@example.org",
      employeeId: "RMT-EXE-001",
      passwordHash: execPassword,
      areaId: mira?.id,
      isActive: true,
    },
  });
  await prisma.pickupExecutive.upsert({
    where: { employeeId: "RMT-EXE-002" },
    update: { passwordHash: execPassword, isActive: true },
    create: {
      name: "Priya Nair",
      mobile: "9876543211",
      email: "xavier.y@example.org",
      employeeId: "RMT-EXE-002",
      passwordHash: execPassword,
      areaId: mira?.id,
      isActive: true,
    },
  });

  for (const channel of ["SMS", "WHATSAPP", "EMAIL"] as const) {
    await prisma.notificationConfig.upsert({
      where: { channel },
      update: {},
      create: {
        channel,
        provider: channel === "EMAIL" ? "smtp" : channel === "WHATSAPP" ? "whatsapp_cloud" : "sms_gateway",
        isEnabled: false,
        configJson: JSON.stringify({ from: "PhoneSell", businessPhone: "7068867486" }),
      },
    });
  }

  const deviceCount = await prisma.device.count();
  const variantCount = await prisma.deviceVariant.count();
  console.log(`Seed complete. Devices: ${deviceCount}, variants: ${variantCount}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
