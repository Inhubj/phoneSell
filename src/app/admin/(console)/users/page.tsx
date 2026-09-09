import { adminPage } from "@/lib/guard";
import { AdminUsersManager } from "@/components/admin/AdminUsersManager";

export default async function UsersPage() {
  await adminPage("users");
  return (
    <div>
      <h1 className="font-display text-3xl">Admin users</h1>
      <p className="mt-2 text-sm text-muted">Super Admin assigns module access. Passwords are hashed and never displayed.</p>
      <AdminUsersManager />
    </div>
  );
}
