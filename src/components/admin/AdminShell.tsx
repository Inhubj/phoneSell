"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/layout/Logo";
import type { AdminRole } from "@/lib/auth";
import { canAccess, type AdminSection } from "@/lib/roles";

const LINKS: { href: string; label: string; section: AdminSection }[] = [
  { href: "/admin", label: "Dashboard", section: "dashboard" },
  { href: "/admin/orders", label: "Orders", section: "orders" },
  { href: "/admin/customers", label: "Customers", section: "customers" },
  { href: "/admin/logins", label: "Login analytics", section: "analytics" },
  { href: "/admin/analytics", label: "Website visitors", section: "analytics" },
  { href: "/admin/devices", label: "Device catalogue", section: "catalog" },
  { href: "/admin/others", label: "Others requests", section: "custom_devices" },
  { href: "/admin/pricing", label: "Pricing", section: "pricing" },
  { href: "/admin/areas", label: "Service areas", section: "pickup" },
  { href: "/admin/executives", label: "Executives", section: "pickup" },
  { href: "/admin/tracking", label: "Live tracking", section: "tracking" },
  { href: "/admin/reports", label: "Reports", section: "export" },
  { href: "/admin/users", label: "Admin users", section: "users" },
  { href: "/admin/notifications", label: "Notifications", section: "notifications" },
  { href: "/admin/settings", label: "System settings", section: "settings" },
  { href: "/admin/audit", label: "Audit logs", section: "audit" },
];

export function AdminShell({
  children,
  name,
  role,
  permissions,
}: {
  children: React.ReactNode;
  name: string;
  role: AdminRole;
  permissions?: AdminSection[];
}) {
  const path = usePathname();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<{ orders: any[]; customers: any[] } | null>(null);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  async function search(value: string) {
    setQ(value);
    if (value.trim().length < 3) {
      setHits(null);
      return;
    }
    const res = await fetch(`/api/admin/search?q=${encodeURIComponent(value)}`);
    setHits(await res.json());
  }

  return (
    <div className="min-h-screen bg-[#eef1f6] text-ink">
      <div className="grid lg:grid-cols-[240px_1fr]">
        <aside className="bg-navy p-5 text-white lg:min-h-screen">
          <Logo light compact />
          <p className="mt-3 text-xs text-white/50">{role.replaceAll("_", " ")}</p>
          <nav className="mt-8 grid gap-1">
            {LINKS.filter((l) => canAccess(role, l.section, permissions)).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-xl px-3 py-2 text-sm ${path === item.href ? "bg-white/15" : "text-white/70 hover:text-white"}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <button onClick={logout} className="mt-8 text-sm text-gold">
            Sign out
          </button>
        </aside>
        <div className="p-4 lg:p-8">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-muted">Signed in as {name}</p>
            <div className="relative w-full md:w-[420px]">
              <input
                value={q}
                onChange={(e) => search(e.target.value)}
                placeholder="Search Order ID / Mobile / Email / Customer ID / Model"
                className="w-full rounded-xl border bg-white/80 px-4 py-2 text-sm backdrop-blur"
              />
              {hits && (
                <div className="absolute z-20 mt-1 max-h-80 w-full overflow-auto rounded-xl bg-white p-3 text-sm shadow">
                  {hits.orders.map((o) => (
                    <Link key={o.id} href={`/admin/orders/${o.id}`} className="block py-1" onClick={() => setHits(null)}>
                      {o.orderNumber} · {o.customer?.mobile} · {o.device?.name || o.customDevice?.model}
                    </Link>
                  ))}
                  {hits.customers.map((c) => (
                    <Link key={c.id} href={`/admin/customers/${c.id}`} className="block py-1" onClick={() => setHits(null)}>
                      Customer · {c.fullName || c.mobile || c.email}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            {canAccess(role, "export", permissions) && (
              <a href="/api/admin/reports?kind=orders&format=xlsx" className="text-sm font-semibold text-royal">
                Export Excel
              </a>
            )}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
