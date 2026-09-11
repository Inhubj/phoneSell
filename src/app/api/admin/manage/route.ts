import { NextResponse } from "next/server";
import { hashPassword, requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify, writeAudit } from "@/lib/orders";
import { canAccess, type AdminSection } from "@/lib/roles";
import { assertSameOrigin, clientIp } from "@/lib/security";

const TYPE_SECTION: Record<string, AdminSection> = {
  brand: "catalog",
  device: "catalog",
  variant: "catalog",
  pricing: "pricing",
  pricingBand: "pricing",
  rule: "pricing",
  area: "pickup",
  slot: "pickup",
  executive: "pickup",
  notify: "notifications",
  customDevice: "custom_devices",
};

export async function POST(req: Request) {
  if (!assertSameOrigin(req)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const auth = await requireAdmin();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const type = body.type as string;
  const section = TYPE_SECTION[type];
  if (!section || !canAccess(auth.session.role, section)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (type === "brand") {
    const brand = await prisma.brand.create({
      data: { name: body.name, slug: slugify(body.name), isActive: true, sortOrder: 99 },
    });
    return NextResponse.json({ brand });
  }

  if (type === "device") {
    const device = await prisma.device.create({
      data: {
        brandId: body.brandId,
        name: body.name,
        slug: slugify(body.name),
        series: body.series || null,
        launchYear: body.launchYear ? Number(body.launchYear) : null,
        originalPrice: body.originalPrice ? Number(body.originalPrice) : null,
        isIos: Boolean(body.isIos),
        deviceType: body.deviceType || "PHONE",
        processor: body.processor || null,
        isActive: true,
      },
    });
    return NextResponse.json({ device });
  }

  if (type === "variant") {
    const variant = await prisma.deviceVariant.create({
      data: {
        deviceId: body.deviceId,
        ramGb: Number(body.ramGb),
        storageGb: Number(body.storageGb),
        colour: body.colour || "Standard",
        originalPrice: body.originalPrice ? Number(body.originalPrice) : null,
        pricing: { create: { basePrice: Number(body.basePrice) } },
      },
    });
    return NextResponse.json({ variant });
  }

  if (type === "pricing") {
    const existing = await prisma.devicePricing.findUnique({
      where: { id: body.id },
      include: { variant: { include: { device: { include: { brand: true } } } } },
    });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const newPrice = Number(body.basePrice);
    await prisma.devicePricing.update({
      where: { id: body.id },
      data: {
        basePrice: newPrice,
        isActive: body.isActive ?? existing.isActive,
        isPromotional: body.isPromotional ?? existing.isPromotional,
      },
    });
    await prisma.pricingHistory.create({
      data: {
        entityType: "VARIANT",
        entityId: existing.variantId,
        deviceLabel: `${existing.variant.device.brand.name} ${existing.variant.device.name}`,
        configuration: `${existing.variant.ramGb}/${existing.variant.storageGb}`,
        conditionLabel: "BASE",
        oldPrice: existing.basePrice,
        newPrice,
        changedBy: `${auth.user.role}:${auth.user.name}`,
        reason: body.reason || "Catalogue price update",
      },
    });
    await writeAudit({
      userId: auth.user.id,
      action: "PRICING_UPDATED",
      entity: "DevicePricing",
      entityId: existing.id,
      meta: { oldPrice: existing.basePrice, newPrice, previous: existing.basePrice, next: newPrice },
      ip: clientIp(req),
    });
    return NextResponse.json({ ok: true });
  }

  if (type === "pricingBand") {
    const variant = await prisma.deviceVariant.findUnique({
      where: { id: body.variantId },
      include: { device: { include: { brand: true } } },
    });
    if (!variant) return NextResponse.json({ error: "Unknown variant" }, { status: 404 });
    const band = await prisma.pricingBand.upsert({
      where: { variantId_conditionLabel: { variantId: variant.id, conditionLabel: body.conditionLabel } },
      update: {
        price: Number(body.price),
        isActive: body.isActive ?? true,
        isPromotional: Boolean(body.isPromotional),
      },
      create: {
        variantId: variant.id,
        conditionLabel: body.conditionLabel,
        price: Number(body.price),
        isActive: true,
        isPromotional: Boolean(body.isPromotional),
      },
    });
    await prisma.pricingHistory.create({
      data: {
        entityType: "BAND",
        entityId: band.id,
        deviceLabel: `${variant.device.brand.name} ${variant.device.name}`,
        configuration: `${variant.ramGb}/${variant.storageGb}`,
        conditionLabel: body.conditionLabel,
        oldPrice: 0,
        newPrice: Number(body.price),
        changedBy: `${auth.user.role}:${auth.user.name}`,
        reason: body.reason || "Condition pricing",
      },
    });
    return NextResponse.json({ ok: true });
  }

  if (type === "rule") {
    await prisma.pricingRule.update({
      where: { id: body.id },
      data: { amount: Number(body.amount), isActive: body.isActive ?? true },
    });
    return NextResponse.json({ ok: true });
  }

  if (type === "area") {
    if (body.id) {
      await prisma.serviceArea.update({
        where: { id: body.id },
        data: {
          name: body.name,
          isActive: body.isActive,
          pickupCharge: Number(body.pickupCharge || 0),
          serviceCharge: Number(body.serviceCharge || 0),
          minOrderValue: Number(body.minOrderValue || 0),
          etaHours: Number(body.etaHours || 24),
          city: body.city || undefined,
          state: body.state || undefined,
          pincode: body.pincode || undefined,
        },
      });
      await writeAudit({
        userId: auth.user.id,
        action: body.isActive === false ? "SERVICE_AREA_DEACTIVATED" : "SERVICE_AREA_UPDATED",
        entity: "ServiceArea",
        entityId: body.id,
        meta: { name: body.name, isActive: body.isActive, previous: body.isActive, next: body.isActive },
        ip: clientIp(req),
      });
    } else {
      await prisma.serviceArea.create({
        data: {
          name: body.name,
          slug: slugify(body.name),
          city: body.city || body.name,
          state: body.state || "Maharashtra",
          pincode: body.pincode || "",
          pickupCharge: Number(body.pickupCharge || 0),
          serviceCharge: Number(body.serviceCharge || 0),
          minOrderValue: Number(body.minOrderValue || 0),
          etaHours: Number(body.etaHours || 24),
        },
      });
    }
    return NextResponse.json({ ok: true });
  }

  if (type === "slot") {
    if (body.id) {
      await prisma.pickupSlot.update({
        where: { id: body.id },
        data: { isActive: body.isActive, label: body.label },
      });
    } else {
      await prisma.pickupSlot.create({
        data: { label: body.label, startTime: body.startTime, endTime: body.endTime, sortOrder: 9 },
      });
    }
    return NextResponse.json({ ok: true });
  }

  if (type === "executive") {
    const passwordHash = body.password ? await hashPassword(body.password) : undefined;
    if (body.id) {
      const prev = await prisma.pickupExecutive.findUnique({ where: { id: body.id } });
      const deactivating = body.isActive === false && prev?.isActive;
      await prisma.pickupExecutive.update({
        where: { id: body.id },
        data: {
          name: body.name,
          mobile: body.mobile,
          email: body.email || prev?.email,
          employeeId: body.employeeId,
          areaId: body.areaId || null,
          isActive: body.isActive,
          ...(passwordHash ? { passwordHash } : {}),
          ...(deactivating ? { sessionVersion: { increment: 1 } } : {}),
        },
      });
      await writeAudit({
        userId: auth.user.id,
        action: deactivating ? "EXECUTIVE_DEACTIVATED" : "EXECUTIVE_UPDATED",
        entity: "PickupExecutive",
        entityId: body.id,
        meta: { previous: prev?.isActive, next: body.isActive },
        ip: clientIp(req),
      });
    } else {
      if (!body.mobile || !body.email) {
        return NextResponse.json({ error: "Mobile and email are mandatory" }, { status: 400 });
      }
      await prisma.pickupExecutive.create({
        data: {
          name: body.name,
          mobile: body.mobile,
          email: body.email,
          employeeId: body.employeeId,
          areaId: body.areaId || null,
          passwordHash: passwordHash || (await hashPassword("Pickup@2026")),
        },
      });
    }
    return NextResponse.json({ ok: true });
  }

  if (type === "notify") {
    const incoming = (body.config || {}) as Record<string, unknown>;
    if (body.provider === "smtp" || incoming.host) {
      const existing = await prisma.notificationConfig.findUnique({ where: { id: body.id } });
      let prev: Record<string, unknown> = {};
      try {
        prev = existing?.configJson ? JSON.parse(existing.configJson) : {};
      } catch {
        prev = {};
      }
      if (!incoming.pass && prev.pass) incoming.pass = prev.pass;
    }
    await prisma.notificationConfig.update({
      where: { id: body.id },
      data: { isEnabled: Boolean(body.isEnabled), provider: body.provider, configJson: JSON.stringify(incoming) },
    });
    return NextResponse.json({ ok: true });
  }

  if (type === "customDevice") {
    const row = await prisma.customDevice.update({
      where: { id: body.id },
      data: { approvalStatus: body.approvalStatus || "APPROVED" },
    });
    if (body.addToCatalog) {
      const brand = await prisma.brand.upsert({
        where: { slug: slugify(row.brand) },
        update: {},
        create: { name: row.brand, slug: slugify(row.brand), isActive: true, sortOrder: 80 },
      });
      const device = await prisma.device.create({
        data: {
          brandId: brand.id,
          name: row.model,
          slug: slugify(`${row.brand}-${row.model}-${Date.now()}`),
          deviceType: row.deviceType,
          processor: row.processor || null,
          isActive: true,
        },
      });
      const ram = parseInt(row.ram, 10) || 0;
      const storage = parseInt(row.storage, 10) || 0;
      await prisma.deviceVariant.create({
        data: {
          deviceId: device.id,
          ramGb: ram,
          storageGb: storage,
          processor: row.processor || null,
          pricing: { create: { basePrice: 5000 } },
        },
      });
      await prisma.customDevice.update({
        where: { id: row.id },
        data: { catalogDeviceId: device.id },
      });
    }
    await writeAudit({
      userId: auth.user.id,
      action: body.addToCatalog ? "CUSTOM_DEVICE_CATALOGUED" : "CUSTOM_DEVICE_REVIEWED",
      entity: "CustomDevice",
      entityId: row.id,
      meta: { approvalStatus: body.approvalStatus, addToCatalog: Boolean(body.addToCatalog) },
      ip: clientIp(req),
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown type" }, { status: 400 });
}
