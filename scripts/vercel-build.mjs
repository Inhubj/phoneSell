import { spawnSync } from "node:child_process";

if (!process.env.DATABASE_URL || process.env.DATABASE_URL.startsWith("file:")) {
  process.env.DATABASE_URL = "file:./dev.db";
}

process.env.SEED_ON_BUILD = process.env.SEED_ON_BUILD || (process.env.VERCEL === "1" ? "1" : "");

function run(command, args) {
  const result = spawnSync(command, args, { stdio: "inherit", env: process.env, shell: true });
  if (result.status) process.exit(result.status);
}

console.log("Prisma datasource: sqlite");
run("npx", ["prisma", "generate"]);
run("npx", ["prisma", "db", "push"]);
if (process.env.VERCEL === "1" || process.env.SEED_ON_BUILD === "1") {
  run("npx", ["tsx", "scripts/ensure-prod-seed.ts"]);
}
run("npx", ["next", "build"]);
