import type { Metadata } from "next";
import { SettingsClient } from "@/components/dashboard/settings-client";
import { getSettings } from "@/lib/settings";
import { canMutateStudio } from "@/lib/studio-access";

export const metadata: Metadata = {
  title: "Settings",
  robots: { index: false, follow: false },
};

export default function SettingsPage() {
  return (
    <SettingsClient
      initial={getSettings()}
      canSave={canMutateStudio()}
    />
  );
}
