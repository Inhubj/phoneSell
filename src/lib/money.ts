export function formatInr(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function orderValue(order: {
  currentPrice?: number | null;
  finalPrice?: number | null;
  estimatedPrice: number;
}) {
  if (order.currentPrice && order.currentPrice > 0) return order.currentPrice;
  if (order.finalPrice && order.finalPrice > 0) return order.finalPrice;
  return order.estimatedPrice;
}
