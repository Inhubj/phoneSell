import { adminPage } from "@/lib/guard";
import { AdminShell } from "@/components/admin/AdminShell";
import type { AdminRole } from "@/lib/auth";

export default async function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const { user, permissions } = await adminPage();
  return (
    <AdminShell name={user.name} role={user.role as AdminRole} permissions={permissions}>
      {children}
    </AdminShell>
  );
}
