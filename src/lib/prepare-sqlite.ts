import { copyFileSync, existsSync } from "node:fs";
import { join } from "node:path";

/** Vercel’s filesystem is read-only except /tmp. SQLite must live there at runtime. */
export function prepareSqliteUrl() {
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith("file:")) {
    return;
  }

  if (process.env.VERCEL) {
    const bundled = [join(process.cwd(), "prisma", "dev.db"), join(process.cwd(), "dev.db")].find((path) =>
      existsSync(path),
    );
    const dest = "/tmp/phonesell.db";
    if (bundled && !existsSync(dest)) {
      copyFileSync(bundled, dest);
    }
    process.env.DATABASE_URL = `file:${dest}`;
    return;
  }

  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = "file:./dev.db";
  }
}
