import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const resolved =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.DATABASE_URL_UNPOOLED ||
  "";

if (resolved) process.env.DATABASE_URL = resolved;

const isPostgres = /^(postgres|postgresql|prisma\+postgres):\/\//i.test(resolved);
const onVercel = process.env.VERCEL === "1" || process.env.USE_POSTGRES === "1";

if (onVercel && !isPostgres) {
  console.error(`
PhoneSell on Vercel needs a hosted Postgres DATABASE_URL.

1. Vercel → Storage → Create Database (Neon) and connect it to this project.
2. Set AUTH_SECRET and APP_URL=https://phone-sell-lake.vercel.app
3. Redeploy.

npm install can succeed without this; the build cannot.
`);
  process.exit(1);
}

if (onVercel && isPostgres) {
  const file = join(process.cwd(), "prisma", "schema.prisma");
  const schema = readFileSync(file, "utf8");
  if (schema.includes('provider = "sqlite"')) {
    writeFileSync(file, schema.replace('provider = "sqlite"', 'provider = "postgresql"'));
  }
  console.log("Prisma datasource: postgresql");
}

function run(command, args) {
  const result = spawnSync(command, args, { stdio: "inherit", env: process.env, shell: true });
  if (result.status) process.exit(result.status);
}

run("npx", ["prisma", "generate"]);
run("npx", ["prisma", "db", "push"]);
run("npx", ["tsx", "scripts/ensure-prod-seed.ts"]);
run("npx", ["next", "build"]);
