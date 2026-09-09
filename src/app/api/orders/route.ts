import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { orderSchema } from "@/lib/validations";
import { calculateQuote } from "@/lib/pricing";
import { nextOrderNumber, writeAudit } from "@/lib/orders";
import { notifyOrderEvent } from "@/lib/notifications";
import { CONDITION_STEPS, ANDROID_BATTERY, IOS_BATTERY } from "@/lib/conditions";
import { clientIp, assertSameOrigin, rateLimit } from "@/lib/security";
import { requireCustomer } from "@/lib/auth";
import { recordStatusChange, recordVisitorEvent } from "@/lib/analytics";

function labelFor(map: { key: string; label: string }[], key: string) {
  return map.find((m) => m.key === key)?.label || key;
}

export async function POST(req: Request) {
  if (!assertSameOrigin(req)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const auth = await requireCustomer();
  if (!auth) return NextResponse.json({ error: "Please log in to create an order" }, { status: 401 });

  const limited = rateLimit(`order:${clientIp(req)}`, 8, 60 * 60_000);
  if (!limited.ok) return NextResponse.json({ error: "Too many orders from this device" }, { status: 429 });

  const body = await req.json().catch(() => null);
  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please complete all required fields" }, { status: 400 });
  }

  const area = await prisma.serviceArea.findUnique({ where: { id: parsed.data.address.areaId } });
  if (!area?.isActive) return NextResponse.json({ error: "This pickup area is not serviceable" }, { status: 400 });

  const slot = await prisma.pickupSlot.findUnique({ where: { id: parsed.data.pickupSlotId } });
  if (!slot?.isActive) return NextResponse.json({ error: "Invalid pickup slot" }, { status: 400 });

  const isCustom = Boolean(parsed.data.custom);
  let variant = null;
  if (!isCustom && parsed.data.variantId) {
    variant = await prisma.deviceVariant.findUnique({
      where: { id: parsed.data.variantId },
      include: { device: { include: { brand: true } }, pricing: true },
    });
    if (!variant?.pricing) return NextResponse.json({ error: "Unknown device variant" }, { status: 404 });
  }

  let estimatedPrice = 0;
  let summary = parsed.data.custom
    ? `Custom ${parsed.data.custom.deviceType}: ${parsed.data.custom.brand} ${parsed.data.custom.model}`
    : "";

  if (variant) {
    const quote = await calculateQuote({
      variantId: variant.id,
      isIos: variant.device.isIos,
      condition: parsed.data.condition,
      extras: parsed.data.extras,
      battery: parsed.data.battery,
    });
    estimatedPrice = quote.estimatedPrice;
    const batteryOptions = variant.device.isIos ? IOS_BATTERY : ANDROID_BATTERY;
    summary = [
      `Screen: ${labelFor([...CONDITION_STEPS[0].options], parsed.data.condition.screen)}`,
      `Body: ${labelFor([...CONDITION_STEPS[1].options], parsed.data.condition.body)}`,
      `Battery: ${labelFor([...batteryOptions], parsed.data.battery)}`,
    ].join(" · ");
  }

  const orderNumber = await nextOrderNumber();
  const pickupDate = new Date(`${parsed.data.pickupDate}T12:00:00`);
  const deviceType = parsed.data.deviceType || parsed.data.custom?.deviceType || variant?.device.deviceType || "PHONE";

  await prisma.customer.update({
    where: { id: auth.customer.id },
    data: {
      fullName: parsed.data.customer.fullName,
      alternate: parsed.data.customer.alternate || auth.customer.alternate,
      email: parsed.data.customer.email || auth.customer.email,
      mobile: parsed.data.customer.mobile || auth.customer.mobile,
    },
  });

  const customer = await prisma.customer.findUnique({ where: { id: auth.customer.id } });
  if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

  const label = variant
    ? `${variant.device.brand.name} ${variant.device.name} ${variant.ramGb}/${variant.storageGb}`
    : `${parsed.data.custom?.brand} ${parsed.data.custom?.model}`;

  const order = await prisma.order.create({
    data: {
      orderNumber,
      customerId: customer.id,
      brandId: variant?.device.brandId,
      deviceId: variant?.deviceId,
      variantId: variant?.id,
      deviceType,
      status: isCustom ? "NEW_LEAD" : "QUOTE_GENERATED",
      pickupStatus: "SCHEDULED",
      estimatedPrice,
      currentPrice: estimatedPrice,
      source: parsed.data.diagnosis ? "DIAGNOSIS" : parsed.data.source || "WEBSITE",
      conditionSummary: summary,
      conditionJson: JSON.stringify(parsed.data.condition),
      extrasJson: JSON.stringify(parsed.data.extras),
      batteryNote: parsed.data.battery,
      pickupDate,
      pickupSlotId: slot.id,
      items: {
        create: { label, unitPrice: estimatedPrice },
      },
      address: {
        create: {
          building: parsed.data.address.building,
          flatNumber: parsed.data.address.flatNumber,
          street: parsed.data.address.street,
          area: area.name,
          city: parsed.data.address.city,
          pincode: parsed.data.address.pincode,
          landmark: parsed.data.address.landmark || null,
          areaId: area.id,
        },
      },
      photos: {
        create: parsed.data.photos.map((p) => ({ kind: p.kind, url: p.url })),
      },
      ...(parsed.data.diagnosis
        ? {
            diagnosis: {
              create: {
                customerId: customer.id,
                status: "COMPLETED",
                consentJson: JSON.stringify(parsed.data.diagnosis.consent || {}),
                detectionJson: JSON.stringify(parsed.data.diagnosis.detection || {}),
                capabilitiesJson: JSON.stringify(parsed.data.diagnosis.capabilities || {}),
                testsJson: JSON.stringify(parsed.data.diagnosis.tests || []),
                conditionJson: JSON.stringify(parsed.data.condition),
                extrasJson: JSON.stringify(parsed.data.extras),
                batteryJson: JSON.stringify(parsed.data.diagnosis.battery || { healthBand: parsed.data.battery }),
                imei: parsed.data.diagnosis.imei || "",
                imeiLast4: (parsed.data.diagnosis.imei || "").replace(/\D/g, "").slice(-4),
                serialNumber: parsed.data.diagnosis.serialNumber || "",
                aiAssessmentJson: JSON.stringify(parsed.data.diagnosis.aiAssessment || {}),
                quoteJson: JSON.stringify(parsed.data.diagnosis.quote || {}),
                issuesJson: JSON.stringify(parsed.data.diagnosis.issues || []),
                completedAt: new Date(),
                events: {
                  create: (parsed.data.diagnosis.events || []).map((e) => ({
                    step: e.step,
                    source: e.source,
                    label: e.label,
                    detailJson: JSON.stringify(e.detail ? { detail: e.detail } : {}),
                  })),
                },
              },
            },
          }
        : {}),
    },
    include: {
      customer: true,
      pickupSlot: true,
      device: { include: { brand: true } },
    },
  });

  if (parsed.data.custom) {
    await prisma.customDevice.create({
      data: {
        customerId: customer.id,
        orderId: order.id,
        brand: parsed.data.custom.brand,
        model: parsed.data.custom.model,
        deviceType: parsed.data.custom.deviceType,
        ram: parsed.data.custom.ram || "",
        storage: parsed.data.custom.storage || "",
        processor: parsed.data.custom.processor || "",
        configuration: parsed.data.custom.configuration || "",
        colour: parsed.data.custom.colour || "",
        purchaseYear: parsed.data.custom.purchaseYear || "",
        conditionNote: parsed.data.custom.conditionNote || "",
        imeiOrSerial: parsed.data.custom.imeiOrSerial || "",
        description: parsed.data.custom.description || "",
        photosJson: JSON.stringify(parsed.data.photos),
        approvalStatus: "PENDING",
      },
    });
  }

  await prisma.order.update({
    where: { id: order.id },
    data: { status: "PICKUP_PENDING" },
  });

  await recordStatusChange({
    orderId: order.id,
    oldStatus: "NEW",
    newStatus: "PICKUP_PENDING",
    changedBy: `customer:${customer.id}`,
    notes: "Order created and pickup scheduled",
  });

  await writeAudit({
    action: "ORDER_CREATED",
    entity: "Order",
    entityId: order.id,
    ip: clientIp(req),
    meta: { orderNumber },
  });

  if (parsed.data.diagnosis) {
    const diag = await prisma.deviceDiagnosis.findUnique({ where: { orderId: order.id } });
    if (diag) {
      await prisma.diagnosisEvent.create({
        data: {
          diagnosisId: diag.id,
          step: "ORDER",
          source: "CUSTOMER",
          label: `Order created ${orderNumber}`,
        },
      });
    }
  }

  await notifyOrderEvent("ORDER_CONFIRMATION", { ...order, pickupSlot: slot });
  await notifyOrderEvent("PICKUP_SCHEDULED", { ...order, pickupSlot: slot });
  const jar = await cookies();
  await recordVisitorEvent({
    visitorId: jar.get("rmt_vid")?.value || customer.id,
    customerId: customer.id,
    eventType: "ORDER_COMPLETED",
    path: "/sell",
    ip: clientIp(req),
    userAgent: req.headers.get("user-agent") || "",
  });

  return NextResponse.json({
    orderNumber: order.orderNumber,
    estimatedPrice: order.estimatedPrice,
    pickupDate: pickupDate.toLocaleDateString("en-IN"),
    slot: slot.label,
  });
}
