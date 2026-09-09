import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { nextOrderNumber, writeAudit } from "@/lib/orders";
import { canAccess } from "@/lib/roles";
import { indianMobile } from "@/lib/validations";
import { clientIp, assertSameOrigin } from "@/lib/security";
import { recordStatusChange } from "@/lib/analytics";

export async function POST(req: Request) {
  if (!assertSameOrigin(req)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const auth = await requireAdmin();
  if (!auth || !canAccess(auth.session.role, "orders", auth.permissions)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const mobile = indianMobile.safeParse(String(body.mobile || "").replace(/\D/g, ""));
  const email = String(body.email || "").trim().toLowerCase();
  const name = String(body.fullName || "").trim();
  if (!mobile.success) return NextResponse.json({ error: "Valid mobile number is mandatory" }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Valid email is mandatory" }, { status: 400 });
  if (name.length < 2) return NextResponse.json({ error: "Customer name is required" }, { status: 400 });

  const price = Number(body.price || 0);
  if (!Number.isFinite(price) || price < 0) return NextResponse.json({ error: "Enter a valid price" }, { status: 400 });

  const area = await prisma.serviceArea.findUnique({ where: { id: body.areaId } });
  if (!area?.isActive) return NextResponse.json({ error: "Select an active service area" }, { status: 400 });
  const slot = await prisma.pickupSlot.findUnique({ where: { id: body.pickupSlotId } });
  if (!slot?.isActive) return NextResponse.json({ error: "Select a pickup slot" }, { status: 400 });

  let customer =
    (await prisma.customer.findFirst({ where: { mobile: mobile.data } })) ||
    (await prisma.customer.findFirst({ where: { email } }));
  if (!customer) {
    customer = await prisma.customer.create({
      data: {
        fullName: name,
        mobile: mobile.data,
        email,
        loginMethod: "MANUAL",
        firstLoginAt: new Date(),
        lastLoginAt: new Date(),
        loginCount: 0,
        status: "ACTIVE",
      },
    });
  } else {
    customer = await prisma.customer.update({
      where: { id: customer.id },
      data: {
        fullName: customer.fullName || name,
        mobile: customer.mobile || mobile.data,
        email: customer.email || email,
      },
    });
  }

  const orderNumber = await nextOrderNumber();
  const pickupDate = body.pickupDate ? new Date(`${body.pickupDate}T12:00:00`) : null;
  const order = await prisma.order.create({
    data: {
      orderNumber,
      customerId: customer.id,
      deviceType: body.deviceType || "PHONE",
      status: body.status || "PICKUP_PENDING",
      pickupStatus: "SCHEDULED",
      estimatedPrice: price,
      currentPrice: price,
      finalPrice: price,
      source: "MANUAL",
      conditionSummary: body.condition || "Manual order",
      conditionJson: "{}",
      extrasJson: "{}",
      notes: body.notes || "",
      pickupDate,
      pickupSlotId: slot.id,
      items: { create: { label: `${body.brand || ""} ${body.model || "Manual device"}`.trim(), unitPrice: price } },
      address: {
        create: {
          building: body.building || "—",
          flatNumber: body.flatNumber || "—",
          street: body.street || "—",
          area: area.name,
          city: body.city || area.city,
          pincode: body.pincode || area.pincode || "000000",
          landmark: body.landmark || null,
          areaId: area.id,
        },
      },
    },
  });

  if (body.brand || body.model) {
    await prisma.customDevice.create({
      data: {
        customerId: customer.id,
        orderId: order.id,
        brand: body.brand || "",
        model: body.model || "",
        deviceType: body.deviceType || "PHONE",
        ram: body.ram || "",
        storage: body.storage || "",
        processor: body.processor || "",
        colour: body.colour || "",
        conditionNote: body.condition || "",
        imeiOrSerial: body.imei || "",
        description: body.notes || "",
        approvalStatus: "PENDING",
      },
    });
  }

  if (body.executiveId) {
    await prisma.executiveAssignment.create({
      data: { orderId: order.id, executiveId: body.executiveId, assignedById: auth.user.id },
    });
    await prisma.order.update({ where: { id: order.id }, data: { status: "PICKUP_ASSIGNED" } });
  }

  await recordStatusChange({
    orderId: order.id,
    oldStatus: "NEW",
    newStatus: body.executiveId ? "PICKUP_ASSIGNED" : "PICKUP_PENDING",
    changedBy: `admin:${auth.user.id}`,
    notes: "Manual order created",
  });
  await writeAudit({
    userId: auth.user.id,
    action: "ORDER_CREATED_MANUAL",
    entity: "Order",
    entityId: order.id,
    meta: { orderNumber },
    ip: clientIp(req),
  });

  return NextResponse.json({ ok: true, orderId: order.id, orderNumber });
}
