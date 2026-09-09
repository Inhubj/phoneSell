import { prisma } from "@/lib/prisma";
import { ManageForm } from "@/components/admin/ManageForm";
import { adminPage } from "@/lib/guard";

export default async function DevicesPage() {
  await adminPage("catalog");
  const brands = await prisma.brand.findMany({
    where: { isActive: true },
    include: {
      devices: {
        where: { isActive: true },
        include: { variants: { include: { pricing: true } } },
        orderBy: { name: "asc" },
        take: 8,
      },
    },
    orderBy: { sortOrder: "asc" },
  });
  const counts = await prisma.device.groupBy({ by: ["brandId"], _count: { _all: true } });

  return (
    <div>
      <h1 className="font-display text-3xl">Device catalog</h1>
      <p className="mt-2 text-sm text-muted">Add brands, models and RAM/storage variants without changing website code.</p>
      <h2 className="mt-6 font-semibold">Add brand</h2>
      <ManageForm type="brand" fields={[{ name: "name", label: "Brand name" }]} />
      <h2 className="mt-6 font-semibold">Add model</h2>
      <ManageForm
        type="device"
        fields={[
          { name: "brandId", label: "Brand ID" },
          { name: "name", label: "Model name" },
          { name: "series", label: "Series" },
          { name: "launchYear", label: "Launch year" },
          { name: "originalPrice", label: "Original price" },
          { name: "deviceType", label: "Type PHONE/LAPTOP/TABLET" },
        ]}
      />
      <h2 className="mt-6 font-semibold">Add variant</h2>
      <ManageForm
        type="variant"
        fields={[
          { name: "deviceId", label: "Device ID" },
          { name: "ramGb", label: "RAM GB" },
          { name: "storageGb", label: "Storage GB" },
          { name: "basePrice", label: "Base resale price" },
        ]}
      />
      <div className="mt-8 space-y-6">
        {brands.map((b) => (
          <section key={b.id} className="rounded-2xl bg-white p-5">
            <h3 className="font-semibold">{b.name} <span className="text-xs text-muted">{b.id} · {counts.find((c) => c.brandId === b.id)?._count._all || 0} models</span></h3>
            <ul className="mt-3 grid gap-2 md:grid-cols-2">
              {b.devices.map((d) => (
                <li key={d.id} className="rounded-xl bg-cream p-3 text-sm">
                  <div className="font-semibold">{d.name}</div>
                  <div className="text-xs text-muted">{d.id}</div>
                  {d.variants.map((v) => (
                    <div key={v.id}>{v.ramGb}/{v.storageGb} · ₹{v.pricing?.basePrice}</div>
                  ))}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
