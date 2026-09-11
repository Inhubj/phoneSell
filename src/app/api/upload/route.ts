import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { rateLimit, clientIp, assertSameOrigin } from "@/lib/security";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);

export async function POST(req: Request) {
  if (!assertSameOrigin(req)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const limited = rateLimit(`upload:${clientIp(req)}`, 20, 10 * 60_000);
  if (!limited.ok) return NextResponse.json({ error: "Too many uploads" }, { status: 429 });

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Missing file" }, { status: 400 });
  if (file.size > 12 * 1024 * 1024) return NextResponse.json({ error: "File too large (max 12MB)" }, { status: 400 });
  const type = (file.type || "").toLowerCase();
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  const allowedExt = ["jpg", "jpeg", "png", "webp", "heic", "heif", ""];
  if (type && !type.startsWith("image/") && !ALLOWED.has(type)) {
    return NextResponse.json({ error: "Only images are allowed" }, { status: 400 });
  }
  if (!type && ext && !allowedExt.includes(ext)) {
    return NextResponse.json({ error: "Only images are allowed" }, { status: 400 });
  }

  const safeExt = ["jpg", "jpeg", "png", "webp", "heic", "heif"].includes(ext) ? ext : "jpg";
  const filename = `${Date.now()}-${randomUUID()}.${safeExt}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), buffer);
  return NextResponse.json({ url: `/uploads/${filename}` });
}
