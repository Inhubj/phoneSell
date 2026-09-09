import { PrismaClient } from "@prisma/client";
import { spawn } from "node:child_process";

async function run() {
  if (process.env.VERCEL !== "1" && process.env.SEED_ON_BUILD !== "1") {
    return;
  }
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is missing. Add it in Vercel → Settings → Environment Variables.");
    process.exit(1);
  }

  const prisma = new PrismaClient();
  try {
    const brands = await prisma.brand.count();
    if (brands > 0) {
      console.log(`Catalogue already present (${brands} brands). Skipping seed.`);
      return;
    }
  } finally {
    await prisma.$disconnect();
  }

  console.log("Empty database — running seed…");
  await new Promise<void>((resolve, reject) => {
    const child = spawn("npx", ["tsx", "prisma/seed.ts"], {
      stdio: "inherit",
      shell: true,
      env: process.env,
    });
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Seed exited with code ${code}`));
    });
  });
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
