import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const parsed = Object.fromEntries(
  readFileSync(join(process.cwd(), ".env"), "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const i = line.indexOf("=");
      const key = line.slice(0, i).trim();
      let value = line.slice(i + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      return [key, value];
    }),
);

const vars = {
  SMTP_HOST: "smtp.gmail.com",
  SMTP_PORT: "587",
  SMTP_SECURE: "false",
  SMTP_USER: parsed.SMTP_USER,
  SMTP_PASS: String(parsed.SMTP_PASS || "").replace(/\s/g, ""),
  SMTP_FROM: parsed.SMTP_USER,
  OTP_BYPASS_DEV: "false",
};

if (!vars.SMTP_USER || !vars.SMTP_PASS) {
  console.error("SMTP_USER / SMTP_PASS missing in local .env");
  process.exit(1);
}

for (const [key, value] of Object.entries(vars)) {
  const result = spawnSync(
    "npx",
    ["vercel", "env", "add", key, "production,preview", "--value", value, "--yes", "--force", "--sensitive"],
    { stdio: ["ignore", "pipe", "pipe"], shell: true, encoding: "utf8" },
  );
  if (result.status !== 0) {
    console.error(`Failed to set ${key}`);
    process.exit(result.status || 1);
  }
  console.log(`Set ${key} for production and preview`);
}
