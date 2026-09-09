import { copyFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "prisma", "dev.db");
const dir = join(root, "prisma", "backups");
if (!existsSync(src)) {
  console.error("No prisma/dev.db found to back up.");
  process.exit(1);
}
mkdirSync(dir, { recursive: true });
const dest = join(dir, `dev-${new Date().toISOString().replace(/[:.]/g, "-")}.db`);
copyFileSync(src, dest);
console.log(`Database backup written to ${dest}`);
