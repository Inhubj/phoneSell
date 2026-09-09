import { adminPage } from "@/lib/guard";
import { ManualOrderForm } from "@/components/admin/ManualOrderForm";
import Link from "next/link";

export default async function NewOrderPage() {
  await adminPage("orders");
  return (
    <div>
      <Link href="/admin/orders" className="text-sm font-semibold text-royal">← Orders</Link>
      <h1 className="font-display mt-3 text-3xl">Add manual order</h1>
      <p className="mt-2 text-sm text-muted">Creates the same Order ID sequence used by the customer website.</p>
      <ManualOrderForm />
    </div>
  );
}
