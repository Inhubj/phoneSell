"use client";

import { useEffect, useState } from "react";
import { ALL_ADMIN_SECTIONS, type AdminSection } from "@/lib/roles";

export function AdminUsersManager() {
  const [users, setUsers] = useState<any[]>([]);
  const [form, setForm] = useState({ name: "", email: "", phone: "", username: "", password: "", role: "ADMIN" });
  const [perms, setPerms] = useState<AdminSection[]>(["dashboard", "orders", "customers", "pickup"]);

  async function load() {
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    setUsers(data.users || []);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <form
        className="mt-4 grid gap-3 rounded-2xl bg-white p-4 md:grid-cols-3"
        onSubmit={async (e) => {
          e.preventDefault();
          await fetch("/api/admin/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...form, permissions: perms }),
          });
          setForm({ name: "", email: "", phone: "", username: "", password: "", role: "ADMIN" });
          load();
        }}
      >
        <input className="rounded-xl border px-3 py-2" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className="rounded-xl border px-3 py-2" placeholder="Email (mandatory)" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input className="rounded-xl border px-3 py-2" placeholder="Mobile (mandatory)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <input className="rounded-xl border px-3 py-2" placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
        <input className="rounded-xl border px-3 py-2" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <select className="rounded-xl border px-3 py-2" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
          <option value="ADMIN">Admin</option>
          <option value="OPERATIONS">Operations</option>
          <option value="CATALOGUE">Catalogue</option>
          <option value="REPORTING">Reporting</option>
        </select>
        <div className="md:col-span-3 flex flex-wrap gap-2 text-xs">
          {ALL_ADMIN_SECTIONS.filter((s) => s !== "users" && s !== "settings").map((s) => (
            <label key={s} className="flex items-center gap-1 rounded-full bg-cream px-2 py-1">
              <input
                type="checkbox"
                checked={perms.includes(s)}
                onChange={(e) => setPerms(e.target.checked ? [...perms, s] : perms.filter((x) => x !== s))}
              />
              {s}
            </label>
          ))}
        </div>
        <button className="rounded-xl bg-navy px-4 py-2 text-white">Add admin</button>
      </form>
      <div className="mt-6 overflow-x-auto rounded-2xl bg-white">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-muted"><th className="p-3">Name</th><th>Email</th><th>Mobile</th><th>Role</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="p-3">{u.name}</td>
                <td>{u.email}</td>
                <td>{u.phone || "—"}</td>
                <td>{u.role}</td>
                <td>{u.isActive ? "Active" : "Inactive"}</td>
                <td>
                  {u.role !== "SUPER_ADMIN" && (
                    <button
                      className="text-royal"
                      onClick={async () => {
                        await fetch("/api/admin/users", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ id: u.id, name: u.name, email: u.email, phone: u.phone, role: u.role, isActive: !u.isActive, permissions: JSON.parse(u.permissionsJson || "[]") }),
                        });
                        load();
                      }}
                    >
                      {u.isActive ? "Deactivate" : "Activate"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
