import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { canAccess, parsePermissions, type AdminSection } from "./roles";

const COOKIE = "rmt_session";
const CUSTOMER_COOKIE = "rmt_customer";
const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET || "royal-mobile-tech-dev-secret-change-in-production",
);

export type AdminRole = "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "OPERATIONS" | "CATALOGUE" | "REPORTING" | "EXECUTIVE";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  kind: "admin" | "executive";
  sv?: number;
};

export type CustomerSession = {
  id: string;
  name: string;
  mobile: string;
  email: string;
  kind: "customer";
};

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(user: SessionUser) {
  const token = await new SignJWT(user)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secret);

  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function createCustomerSession(user: CustomerSession) {
  const token = await new SignJWT(user)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);

  const jar = await cookies();
  jar.set(CUSTOMER_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function destroySession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function destroyCustomerSession() {
  const jar = await cookies();
  jar.delete(CUSTOMER_COOKIE);
}

export async function getSession(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as SessionUser;
  } catch {
    return null;
  }
}

export async function getCustomerSession(): Promise<CustomerSession | null> {
  const jar = await cookies();
  const token = jar.get(CUSTOMER_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    if (payload.kind !== "customer") return null;
    return payload as unknown as CustomerSession;
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session || session.kind !== "admin") {
    return null;
  }
  const user = await prisma.user.findUnique({ where: { id: session.id } });
  if (!user?.isActive) return null;
  if ((session.sv ?? 0) !== (user.sessionVersion ?? 0)) return null;
  const permissions = parsePermissions(user.permissionsJson);
  return {
    session: { ...session, role: user.role as AdminRole, sv: user.sessionVersion },
    user,
    permissions,
  };
}

export async function requireCustomer() {
  const session = await getCustomerSession();
  if (!session) return null;
  const customer = await prisma.customer.findUnique({ where: { id: session.id } });
  if (!customer || customer.status !== "ACTIVE") return null;
  return { session, customer };
}

export async function requireStaff() {
  const session = await getSession();
  if (!session) return null;
  if (session.kind === "admin") {
    const user = await prisma.user.findUnique({ where: { id: session.id } });
    if (!user?.isActive) return null;
    if ((session.sv ?? 0) !== (user.sessionVersion ?? 0)) return null;
    return { session, user, executive: null };
  }
  const executive = await prisma.pickupExecutive.findUnique({
    where: { id: session.id },
  });
  if (!executive?.isActive) return null;
  if ((session.sv ?? 0) !== (executive.sessionVersion ?? 0)) return null;
  await prisma.pickupExecutive.update({
    where: { id: executive.id },
    data: { lastSeenAt: new Date() },
  }).catch(() => {});
  return { session, user: null, executive };
}

export function adminCan(auth: { session: SessionUser; permissions?: AdminSection[] }, section: AdminSection) {
  return canAccess(auth.session.role, section, auth.permissions);
}

export function hasRole(session: SessionUser, roles: SessionUser["role"][]) {
  return roles.includes(session.role);
}

export const CUSTOMER_COOKIE_NAME = CUSTOMER_COOKIE;
export const ADMIN_COOKIE_NAME = COOKIE;
