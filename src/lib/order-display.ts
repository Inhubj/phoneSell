export function orderDeviceLabel(order: {
  customDevice?: { brand: string; model: string; storage?: string } | null;
  device?: { name: string; brand?: { name: string } | null } | null;
  variant?: { storageGb?: number | null } | null;
}) {
  if (order.customDevice) {
    const name = `${order.customDevice.brand} ${order.customDevice.model}`.trim();
    const storage = order.customDevice.storage?.trim();
    return storage ? `${name} — ${storage}` : name || "Custom phone";
  }
  const name = `${order.device?.brand?.name || ""} ${order.device?.name || ""}`.trim() || "Phone";
  const gb = order.variant?.storageGb;
  return gb ? `${name} — ${gb} GB` : name;
}

export function paymentLabel(status?: string | null) {
  if (!status) return "—";
  const key = status.toUpperCase();
  if (key === "PENDING") return "Payment pending";
  if (key === "PAID" || key === "COMPLETED" || key === "SUCCESS") return "Paid";
  if (key === "FAILED") return "Payment failed";
  return status.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}
