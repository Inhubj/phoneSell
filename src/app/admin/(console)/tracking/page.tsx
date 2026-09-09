import { adminPage } from "@/lib/guard";
import { prisma } from "@/lib/prisma";

export default async function TrackingPage() {
  await adminPage("tracking");
  const executives = await prisma.pickupExecutive.findMany({
    where: { isActive: true },
    include: { assignments: { include: { order: true }, take: 1, orderBy: { assignedAt: "desc" } } },
    orderBy: { name: "asc" },
  });
  const withGps = executives.filter((e) => e.locationPermission === "GRANTED" && e.lat && e.lng);
  const center = withGps[0];
  const mapSrc = center
    ? `https://maps.google.com/maps?q=${center.lat},${center.lng}&z=11&output=embed`
    : "https://maps.google.com/maps?q=Mumbai&z=11&output=embed";

  return (
    <div>
      <h1 className="font-display text-3xl">Live executive tracking</h1>
      <p className="mt-2 text-sm text-muted">
        Location is shown only when the executive grants permission in the executive app. Nothing is tracked secretly.
      </p>
      <iframe title="Executive map" className="mt-6 h-80 w-full rounded-2xl border-0" src={mapSrc} />
      <div className="mt-6 space-y-3">
        {executives.map((e) => {
          const current = e.assignments[0]?.order;
          const online = e.lastSeenAt && Date.now() - e.lastSeenAt.getTime() < 15 * 60_000;
          return (
            <article key={e.id} className="glass rounded-2xl p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="font-semibold">{e.name} — {e.employeeId}</div>
                <span className={`text-xs font-semibold ${online ? "pulse-marker rounded-full bg-green-600 px-2 py-1 text-white" : "text-muted"}`}>
                  {online ? "Online" : "Offline"}
                </span>
              </div>
              <p className="text-sm">{e.mobile} · {e.email}</p>
              <p className="text-sm">Location permission: {e.locationPermission}</p>
              <p className="text-sm">Last seen {e.lastSeenAt?.toLocaleString("en-IN") || "—"}</p>
              <p className="text-sm">Current order: {current?.orderNumber || "None"} · Pickup {current?.pickupStatus || "—"}</p>
              {e.lat && e.lng && (
                <a className="text-sm font-semibold text-royal" href={`https://www.google.com/maps?q=${e.lat},${e.lng}`} target="_blank" rel="noreferrer">
                  Open map · updated {e.locationUpdatedAt?.toLocaleString("en-IN")}
                </a>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
