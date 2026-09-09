import { prisma } from "@/lib/prisma";
import { ManageForm } from "@/components/admin/ManageForm";
import { ToggleActive } from "@/components/admin/ToggleActive";
import { adminPage } from "@/lib/guard";

export default async function AreasPage() {
  await adminPage("pickup");
  const [areas, slots] = await Promise.all([
    prisma.serviceArea.findMany({ orderBy: { name: "asc" } }),
    prisma.pickupSlot.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);
  return (
    <div>
      <h1 className="font-display text-3xl">Service areas & slots</h1>
      <ManageForm
        type="area"
        fields={[
          { name: "name", label: "Area name" },
          { name: "city", label: "City" },
          { name: "state", label: "State" },
          { name: "pincode", label: "Pincode" },
          { name: "pickupCharge", label: "Pickup charge" },
          { name: "serviceCharge", label: "Service charge" },
          { name: "etaHours", label: "ETA hours" },
          { name: "minOrderValue", label: "Min order value" },
        ]}
      />
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {areas.map((a) => (
          <article key={a.id} className="device-card glass rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">{a.name}</h2>
              <span className={`text-xs font-semibold ${a.isActive ? "text-green-700" : "text-red-700"}`}>
                {a.isActive ? "🟢 Active" : "🔴 Currently Unavailable"}
              </span>
            </div>
            <p className="mt-2 text-sm text-muted">{a.city} {a.pincode ? `· ${a.pincode}` : ""}</p>
            <p className="mt-1 text-sm">Pickup Charge: ₹{a.pickupCharge}</p>
            <p className="text-sm">ETA: {a.etaHours} Hours</p>
            <div className="mt-3">
              <ToggleActive type="area" id={a.id} isActive={a.isActive} extra={{ name: a.name, pickupCharge: a.pickupCharge, etaHours: a.etaHours, serviceCharge: a.serviceCharge }} />
            </div>
          </article>
        ))}
      </div>
      <div className="mt-6 overflow-x-auto rounded-2xl bg-white">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-muted"><th className="p-3">Area</th><th>City</th><th>Pincode</th><th>Pickup</th><th>Service</th><th>ETA</th><th>Active</th></tr></thead>
          <tbody>
            {areas.map((a) => (
              <tr key={a.id} className="border-t">
                <td className="p-3">{a.name}</td>
                <td>{a.city}</td>
                <td>{a.pincode || "—"}</td>
                <td>₹{a.pickupCharge}</td>
                <td>₹{a.serviceCharge}</td>
                <td>{a.etaHours}h</td>
                <td><ToggleActive type="area" id={a.id} isActive={a.isActive} extra={{ name: a.name, pickupCharge: a.pickupCharge, etaHours: a.etaHours, serviceCharge: a.serviceCharge }} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h2 className="mt-8 font-semibold">Pickup slots</h2>
      <div className="mt-3 grid gap-2 md:grid-cols-2">
        {slots.map((s) => (
          <div key={s.id} className="flex items-center justify-between rounded-2xl bg-white p-4">
            <span>{s.label}</span>
            <ToggleActive type="slot" id={s.id} isActive={s.isActive} extra={{ label: s.label }} />
          </div>
        ))}
      </div>
    </div>
  );
}
