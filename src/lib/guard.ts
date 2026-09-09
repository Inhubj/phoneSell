import { redirect } from "next/navigation";
import { requireAdmin, requireCustomer, requireStaff } from "./auth";
import { canAccess, type AdminSection } from "./roles";

export async function adminPage(section?: AdminSection) {
  const auth = await requireAdmin();
  if (!auth) redirect("/admin/login");
  if (section && !canAccess(auth.session.role, section, auth.permissions)) redirect("/admin");
  return auth;
}

export async function customerPage(next = "/account") {
  const auth = await requireCustomer();
  if (!auth) redirect(`/login?next=${encodeURIComponent(next)}`);
  return auth;
}

export async function staffPage() {
  const auth = await requireStaff();
  if (!auth) redirect("/executive/login");
  if (auth.session.kind === "admin") redirect("/admin");
  return auth;
}
