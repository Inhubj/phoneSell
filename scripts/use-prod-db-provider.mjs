import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const strict = process.argv.includes("--strict");
const file = join(process.cwd(), "prisma", "schema.prisma");

const resolved =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.DATABASE_URL_UNPOOLED ||
  "";

if (resolved && !process.env.DATABASE_URL) {
  process.env.DATABASE_URL = resolved;
}

const isPostgres = /^(postgres|postgresql|prisma\+postgres):\/\//i.test(resolved);
const onVercel = process.env.VERCEL === "1" || process.env.USE_POSTGRES === "1";

if (strict && onVercel && !isPostgres) {
  console.error(`
PhoneSell on Vercel needs a hosted Postgres DATABASE_URL.

1. Vercel → Storage → Create Database (Neon) and connect it to this project,
   or add DATABASE_URL yourself (postgresql://...).
2. Also set AUTH_SECRET and APP_URL.
3. Redeploy.

Current DATABASE_URL is missing or is not a Postgres URL.
`);
  process.exit(1);
}

if (!onVercel || !isPostgres) {
  console.log("Prisma datasource: sqlite (generate)");
  process.exit(0);
}

const schema = readFileSync(file, "utf8");
if (schema.includes('provider = "sqlite"')) {
  writeFileSync(file, schema.replace('provider = "sqlite"', 'provider = "postgresql"'));
}
console.log("Prisma datasource: postgresql");
