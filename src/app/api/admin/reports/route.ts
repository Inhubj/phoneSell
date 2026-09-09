import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccess } from "@/lib/roles";

function dateWhere(from?: string | null, to?: string | null) {
  if (!from && !to) return {};
  return {
    createdAt: {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to ? { lte: new Date(to) } : {}),
    },
  };
}

export async function GET(req: Request) {
  const auth = await requireAdmin();
  if (!auth || !canAccess(auth.session.role, "export")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = new URL(req.url);
  const kind = url.searchParams.get("kind") || "orders";
  const format = url.searchParams.get("format") || "xlsx";
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const where = dateWhere(from, to);

  let rows: Record<string, unknown>[] = [];
  if (kind === "customers") {
    const data = await prisma.customer.findMany({ where, orderBy: { createdAt: "desc" } });
    rows = data.map((c) => ({
      "Customer ID": c.id,
      Mobile: c.mobile,
      Email: c.email,
      "Login Method": c.loginMethod,
      "First Login": c.firstLoginAt?.toISOString() || "",
      "Last Login": c.lastLoginAt?.toISOString() || "",
      "Total Logins": c.loginCount,
      Status: c.status,
    }));
  } else if (kind === "logins") {
    const data = await prisma.loginEvent.findMany({ where, include: { customer: true }, orderBy: { createdAt: "desc" } });
    rows = data.map((e) => ({
      Time: e.createdAt.toISOString(),
      Method: e.loginMethod,
      Status: e.loginStatus,
      Mobile: e.customer?.mobile || "",
      Email: e.customer?.email || "",
    }));
  } else if (kind === "devices") {
    const data = await prisma.device.findMany({ include: { brand: true, variants: { include: { pricing: true } } } });
    rows = data.flatMap((d) =>
      d.variants.map((v) => ({
        Brand: d.brand.name,
        Model: d.name,
        Type: d.deviceType,
        RAM: v.ramGb,
        Storage: v.storageGb,
        Processor: d.processor || v.processor || "",
        "Base Price": v.pricing?.basePrice || "",
      })),
    );
  } else if (kind === "pickups") {
    const data = await prisma.order.findMany({
      where,
      include: { customer: true, address: true, pickupSlot: true, assignment: { include: { executive: true } } },
    });
    rows = data.map((o) => ({
      "Order ID": o.orderNumber,
      Customer: o.customer.fullName,
      Mobile: o.customer.mobile,
      Area: o.address?.area || "",
      Date: o.pickupDate?.toISOString() || "",
      Slot: o.pickupSlot?.label || "",
      Executive: o.assignment?.executive.name || "",
      "Pickup Status": o.pickupStatus,
    }));
  } else if (kind === "payments") {
    const data = await prisma.payment.findMany({ include: { order: { include: { customer: true } } } });
    rows = data.map((p) => ({
      "Order ID": p.order.orderNumber,
      Customer: p.order.customer.fullName,
      Method: p.method,
      Amount: p.amount,
      Status: p.status,
      Reference: p.reference || "",
    }));
  } else {
    const data = await prisma.order.findMany({
      where,
      include: {
        customer: true,
        device: { include: { brand: true } },
        variant: true,
        customDevice: true,
        address: true,
        assignment: { include: { executive: true } },
      },
    });
    rows = data.map((o) => ({
      "Order ID": o.orderNumber,
      "Customer ID": o.customerId,
      "Customer Name": o.customer.fullName,
      Mobile: o.customer.mobile,
      Email: o.customer.email,
      "Device Type": o.deviceType,
      Brand: o.device?.brand.name || o.customDevice?.brand || "",
      Model: o.device?.name || o.customDevice?.model || "",
      RAM: o.variant?.ramGb ?? o.customDevice?.ram ?? "",
      Storage: o.variant?.storageGb ?? o.customDevice?.storage ?? "",
      "Estimated Price": o.estimatedPrice,
      "Final Price": o.finalPrice ?? "",
      Status: o.status,
      "Pickup Status": o.pickupStatus,
      "Payment Status": o.paymentStatus,
      Created: o.createdAt.toISOString(),
    }));
  }

  const headers = Object.keys(rows[0] || { Result: "" });
  if (format === "csv") {
    const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => `"${String(r[h] ?? "").replace(/"/g, '""')}"`).join(","))].join("\n");
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename=royal-${kind}.csv`,
      },
    });
  }
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(kind);
  sheet.columns = headers.map((h) => ({ header: h, key: h, width: 22 }));
  rows.forEach((r) => sheet.addRow(r));
  const buffer = await workbook.xlsx.writeBuffer();
  return new NextResponse(Buffer.from(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename=royal-${kind}.xlsx`,
    },
  });
}
