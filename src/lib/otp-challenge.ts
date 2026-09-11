import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE = "rmt_otp";
const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET || "royal-mobile-tech-dev-secret-change-in-production",
);

export type OtpChallenge = {
  identifier: string;
  channel: string;
  purpose: string;
  codeHash: string;
  attempts: number;
};

export async function setOtpChallenge(challenge: OtpChallenge) {
  const token = await new SignJWT({ ...challenge, kind: "otp" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("10m")
    .sign(secret);

  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 10 * 60,
  });
}

export async function getOtpChallenge(): Promise<OtpChallenge | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    if (payload.kind !== "otp") return null;
    return {
      identifier: String(payload.identifier || ""),
      channel: String(payload.channel || ""),
      purpose: String(payload.purpose || "LOGIN"),
      codeHash: String(payload.codeHash || ""),
      attempts: Number(payload.attempts || 0),
    };
  } catch {
    return null;
  }
}

export async function clearOtpChallenge() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export function normalizeOtpCode(code: unknown) {
  return String(code || "").replace(/\s/g, "");
}
