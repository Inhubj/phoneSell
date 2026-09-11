import { prisma } from "@/lib/prisma";
import { NotifyConfigForm } from "@/components/admin/NotifyConfigForm";
import { adminPage } from "@/lib/guard";

export default async function NotificationsPage() {
  await adminPage("notifications");
  const configs = await prisma.notificationConfig.findMany();
  const recent = await prisma.notification.findMany({ orderBy: { createdAt: "desc" }, take: 30 });
  return (
    <div>
      <h1 className="font-display text-3xl">Notification integrations</h1>
      <p className="mt-2 text-sm text-muted">
        Email uses SMTP. Add host, username and password here, or set SMTP_* environment variables. SMS and WhatsApp stay logged until a provider is connected.
      </p>
      <div className="mt-6 space-y-4">
        {configs.map((c) => (
          <NotifyConfigForm key={c.id} config={c} />
        ))}
      </div>
      <h2 className="mt-8 font-semibold">Recent notification log</h2>
      <ul className="mt-3 space-y-2 text-sm">
        {recent.map((n) => (
          <li key={n.id} className="rounded-xl bg-white p-3">
            {n.channel} · {n.eventType} · {n.recipient} · {n.status}
          </li>
        ))}
      </ul>
    </div>
  );
}
