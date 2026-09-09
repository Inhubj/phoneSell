import { prisma } from "@/lib/prisma";
import { adminPage } from "@/lib/guard";

export default async function AuditPage() {
  await adminPage("audit");
  const logs = await prisma.auditLog.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return (
    <div>
      <h1 className="font-display text-3xl">Audit logs</h1>
      <div className="mt-4 overflow-x-auto rounded-2xl bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted">
              <th className="p-3">Time</th>
              <th>User</th>
              <th>Action</th>
              <th>Entity</th>
              <th>IP</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id} className="border-t">
                <td className="p-3">{l.createdAt.toLocaleString("en-IN")}</td>
                <td>{l.user?.name || "system"}</td>
                <td>{l.action}</td>
                <td>{l.entity} {l.entityId}</td>
                <td>{l.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
