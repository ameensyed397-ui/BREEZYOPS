import { SettingsPanel } from "@/components/settings/settings-panel";
import { fetchProfiles, fetchServiceCatalog, fetchActivityLog, fetchAllLocalities } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [profiles, catalog, activityLog, localities] = await Promise.all([
    fetchProfiles(),
    fetchServiceCatalog(),
    fetchActivityLog(),
    fetchAllLocalities(),
  ]);

  return (
    <div className="w-full px-6 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Users, catalog, localities, integrations, and audit trail.
        </p>
      </header>
      <SettingsPanel
        profiles={profiles}
        catalog={catalog}
        activityLog={activityLog}
        localities={localities}
      />
    </div>
  );
}
