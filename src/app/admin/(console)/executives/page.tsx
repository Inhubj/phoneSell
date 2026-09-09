import { prisma } from "@/lib/prisma";
import { ManageForm } from "@/components/admin/ManageForm";
import { ToggleActive } from "@/components/admin/ToggleActive";
import { adminPage } from "@/lib/guard";

export default async function ExecutivesPage() {
  await adminPage("pickup");
  const executives = await prisma.pickupExecutive.findMany({ include: { area: true }, orderBy: { name: "asc" } });
  return (
    <div>
      <h1 className="font-display text-3xl">Pickup executives</h1>
      <ManageForm
        type="executive"
        fields={[
          { name: "name", label: "Executive name" },
          { name: "mobile", label: "Mobile (mandatory)" },
          { name: "email", label: "Email (mandatory)" },
          { name: "employeeId", label: "Employee ID" },
          { name: "password", label: "Password" },
        ]}
      />
      <div className="mt-6 overflow-x-auto rounded-2xl bg-white">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-muted"><th className="p-3">Name</th><th>Mobile</th><th>Email</th><th>ID</th><th>Area</th><th>GPS</th><th>Status</th></tr></thead>
          <tbody>
            {executives.map((e) => (
              <tr key={e.id} className="border-t">
                <td className="p-3">{e.name}</td>
                <td>{e.mobile}</td>
                <td>{e.email}</td>
                <td>{e.employeeId}</td>
                <td>{e.area?.name || "—"}</td>
                <td>{e.locationPermission}</td>
                <td><ToggleActive type="executive" id={e.id} isActive={e.isActive} extra={{ name: e.name, mobile: e.mobile, employeeId: e.employeeId, email: e.email }} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
