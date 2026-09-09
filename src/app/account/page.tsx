import { customerPage } from "@/lib/guard";
import { prisma } from "@/lib/prisma";
import { AccountHome } from "@/components/account/AccountHome";

export default async function AccountPage() {
  const { customer } = await customerPage();
  const orders = await prisma.order.findMany({
    where: { customerId: customer.id },
    include: {
      device: { include: { brand: true } },
      variant: true,
      customDevice: true,
      pickupSlot: true,
      statusHistory: { orderBy: { createdAt: "desc" }, take: 8 },
    },
    orderBy: { createdAt: "desc" },
  });
  return (
    <AccountHome
      customer={JSON.parse(JSON.stringify(customer))}
      orders={JSON.parse(JSON.stringify(orders))}
    />
  );
}
