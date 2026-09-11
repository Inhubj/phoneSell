import { PrismaClient } from "@prisma/client";
import { CATALOG } from "../prisma/catalog";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function syncCatalogPrices(prisma: PrismaClient) {
  let updated = 0;
  for (const brand of CATALOG) {
    const b = await prisma.brand.findUnique({ where: { slug: brand.slug } });
    if (!b) continue;
    for (const device of brand.devices) {
      const d = await prisma.device.findUnique({
        where: { brandId_slug: { brandId: b.id, slug: slugify(device.name) } },
      });
      if (!d) continue;
      for (const variant of device.variants) {
        const row = await prisma.deviceVariant.findUnique({
          where: {
            deviceId_ramGb_storageGb_colour: {
              deviceId: d.id,
              ramGb: variant.ram,
              storageGb: variant.storage,
              colour: "Standard",
            },
          },
        });
        if (!row) continue;
        await prisma.devicePricing.upsert({
          where: { variantId: row.id },
          update: { basePrice: variant.price },
          create: { variantId: row.id, basePrice: variant.price },
        });
        updated += 1;
      }
    }
  }
  return updated;
}

async function main() {
  const prisma = new PrismaClient();
  try {
    const updated = await syncCatalogPrices(prisma);
    console.log(`Updated ${updated} variant prices (15% lower).`);
  } finally {
    await prisma.$disconnect();
  }
}

const invoked = process.argv[1]?.replaceAll("\\", "/");
if (invoked?.includes("sync-catalog-prices")) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
