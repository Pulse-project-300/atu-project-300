"use client";

import { ImportHevyCard } from "@/components/settings/import-hevy-card";
import { ExportDataCard } from "@/components/settings/export-data-card";
import { DeleteAccountCard } from "@/components/settings/delete-account-card";

export default function SettingsPage() {
  return (
    <div className="flex-1 w-full flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account, import workout history, and export your data
        </p>
      </div>

      <ImportHevyCard />
      <ExportDataCard />
      <DeleteAccountCard />
    </div>
  );
}
