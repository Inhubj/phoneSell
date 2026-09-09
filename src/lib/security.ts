const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || current.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1 };
  }
  if (current.count >= limit) {
    return { ok: false, remaining: 0, retryAt: current.resetAt };
  }
  current.count += 1;
  return { ok: true, remaining: limit - current.count };
}

export function clientIp(req: Request) {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") || "unknown";
}

export function assertSameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  try {
    const originUrl = new URL(origin);
    if (originUrl.hostname === "localhost" || originUrl.hostname === "127.0.0.1") return true;

    const forwardedHost = (req.headers.get("x-forwarded-host") || req.headers.get("host") || "")
      .split(",")[0]
      ?.trim();
    if (forwardedHost && originUrl.host === forwardedHost) return true;

    const extra = [process.env.APP_URL, process.env.VERCEL_PROJECT_PRODUCTION_URL, process.env.VERCEL_URL]
      .filter(Boolean)
      .map((value) => (value!.startsWith("http") ? value! : `https://${value}`));
    return extra.some((allowed) => originUrl.origin === new URL(allowed).origin);
  } catch {
    return false;
  }
}
