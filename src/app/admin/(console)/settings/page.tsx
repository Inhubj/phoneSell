import { adminPage } from "@/lib/guard";
import { prisma } from "@/lib/prisma";

export default async function SettingsPage() {
  await adminPage("settings");
  const settings = await prisma.systemSetting.findMany();
  return (
    <div>
      <h1 className="font-display text-3xl">System settings</h1>
      <p className="mt-2 text-sm text-muted">Login analytics retention defaults to 3 months and can be increased.</p>
      <form
        className="mt-6 max-w-md rounded-2xl bg-white p-5"
        action={async (formData) => {
          "use server";
          const { adminPage } = await import("@/lib/guard");
          const { prisma } = await import("@/lib/prisma");
          await adminPage("settings");
          const months = String(formData.get("loginRetentionMonths") || "3");
          await prisma.systemSetting.upsert({
            where: { key: "loginRetentionMonths" },
            update: { value: months },
            create: { key: "loginRetentionMonths", value: months },
          });
        }}
      >
        <label className="text-sm font-medium">
          Login data retention (months)
          <input
            name="loginRetentionMonths"
            defaultValue={settings.find((s) => s.key === "loginRetentionMonths")?.value || "3"}
            className="mt-1 w-full rounded-xl border px-3 py-2"
          />
        </label>
        <button className="mt-4 rounded-xl bg-navy px-4 py-2 text-white">Save</button>
      </form>
    </div>
  );
}
