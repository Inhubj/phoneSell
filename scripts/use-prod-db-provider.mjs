import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const file = join(process.cwd(), "prisma", "schema.prisma");
const url = process.env.DATABASE_URL || "";
const usePostgres = process.env.VERCEL === "1" || process.env.USE_POSTGRES === "1";

if (usePostgres && !url.startsWith("postgres")) {
  console.error(`
PhoneSell on Vercel needs a hosted Postgres database.

SQLite (file:./dev.db) does not work on Vercel.

1. Create a free Neon database: https://console.neon.tech
   or Vercel Dashboard → Storage → Create Database.
2. Copy the connection string (starts with postgresql://).
3. Vercel → Settings → Environment Variables → add:

   DATABASE_URL   postgresql://...
   AUTH_SECRET    a long random string
   APP_URL        https://your-domain.vercel.app
   OTP_BYPASS_DEV false

4. Redeploy the project.
`);
  process.exit(1);
}

if (!usePostgres) {
  console.log("Prisma datasource: sqlite (local)");
  process.exit(0);
}

const schema = readFileSync(file, "utf8");
if (schema.includes('provider = "sqlite"')) {
  writeFileSync(file, schema.replace('provider = "sqlite"', 'provider = "postgresql"'));
}
console.log("Prisma datasource: postgresql");
