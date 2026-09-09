import type { AdminRole } from "./auth";

export type AdminSection =
  | "dashboard"
  | "orders"
  | "customers"
  | "pickup"
  | "catalog"
  | "pricing"
  | "analytics"
  | "export"
  | "notifications"
  | "audit"
  | "roles"
  | "custom_devices"
  | "users"
  | "settings"
  | "tracking";

const ALL: AdminSection[] = [
  "dashboard",
  "orders",
  "customers",
  "pickup",
  "catalog",
  "pricing",
  "analytics",
  "export",
  "notifications",
  "audit",
  "roles",
  "custom_devices",
  "users",
  "settings",
  "tracking",
];

const ROLE_PERMS: Record<AdminRole, AdminSection[] | "*"> = {
  SUPER_ADMIN: "*",
  ADMIN: ["dashboard", "orders", "customers", "pickup", "analytics", "export", "tracking"],
  MANAGER: ["dashboard", "orders", "customers", "pickup", "analytics", "export"],
  OPERATIONS: ["dashboard", "orders", "customers", "pickup", "tracking"],
  CATALOGUE: ["dashboard", "catalog", "pricing", "custom_devices"],
  REPORTING: ["dashboard", "analytics", "export"],
  EXECUTIVE: ["orders", "pickup"],
};

export function parsePermissions(json?: string | null): AdminSection[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed.filter((x) => ALL.includes(x)) : [];
  } catch {
    return [];
  }
}

export function canAccess(role: AdminRole, section: AdminSection, extra?: AdminSection[]) {
  if (role === "SUPER_ADMIN") return true;
  if (extra?.length) return extra.includes(section);
  const perms = ROLE_PERMS[role] || [];
  return perms === "*" || perms.includes(section);
}

export function allowedSections(role: AdminRole, extra?: AdminSection[]): AdminSection[] {
  if (role === "SUPER_ADMIN") return ALL;
  if (extra?.length) return extra;
  const perms = ROLE_PERMS[role] || [];
  return perms === "*" ? ALL : perms;
}

export const ALL_ADMIN_SECTIONS = ALL;
