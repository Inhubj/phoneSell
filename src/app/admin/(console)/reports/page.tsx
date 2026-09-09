import { adminPage } from "@/lib/guard";
import { ReportsExport } from "@/components/admin/ReportsExport";

export default async function ReportsPage() {
  await adminPage("export");
  return (
    <div>
      <h1 className="font-display text-3xl">Reports & export</h1>
      <p className="mt-2 text-sm text-muted">Choose a date range, then download CSV or Excel. Device catalogue export ignores dates.</p>
      <ReportsExport />
    </div>
  );
}
