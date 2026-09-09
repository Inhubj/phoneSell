import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const auth = await requireAdmin();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const format = new URL(req.url).searchParams.get("format") || "xlsx";
  const orders = await prisma.order.findMany({
    include: {
      customer: true,
      device: { include: { brand: true } },
      variant: true,
      address: true,
      assignment: { include: { executive: true } },
      inspection: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const rows = orders.map((o) => ({
    "Order ID": o.orderNumber,
    "Customer Name": o.customer.fullName,
    Mobile: o.customer.mobile,
    Email: o.customer.email || "",
    Brand: o.device?.brand.name || "",
    Model: o.device?.name || "",
    RAM: o.variant?.ramGb ?? "",
    Storage: o.variant?.storageGb ?? "",
    IMEI: o.inspection?.imei1 || "",
    Condition: o.conditionSummary,
    "Estimated Price": o.estimatedPrice,
    "Final Price": o.finalPrice ?? "",
    "Pickup Address": o.address
      ? `${o.address.flatNumber}, ${o.address.building}, ${o.address.street}, ${o.address.area}, ${o.address.city} ${o.address.pincode}`
      : "",
    Area: o.address?.area || "",
    Executive: o.assignment?.executive.name || "",
    "Order Status": o.status,
    "Payment Status": o.paymentStatus,
    "Created Date": o.createdAt.toISOString(),
    "Completed Date": o.completedAt?.toISOString() || "",
  }));

  const headers = Object.keys(rows[0] || {
    "Order ID": "",
  });

  if (format === "csv") {
    const csv = [
      headers.join(","),
      ...rows.map((r) => headers.map((h) => `"${String((r as Record<string, unknown>)[h] ?? "").replace(/"/g, '""')}"`).join(",")),
    ].join("\n");
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=phonesell-leads.csv",
      },
    });
  }

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Leads");
  sheet.columns = headers.map((h) => ({ header: h, key: h, width: 22 }));
  rows.forEach((r) => sheet.addRow(r));
  const buffer = await workbook.xlsx.writeBuffer();
  return new NextResponse(Buffer.from(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": "attachment; filename=phonesell-leads.xlsx",
    },
  });
}
