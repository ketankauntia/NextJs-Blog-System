import type { Metadata } from "next";
import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { loadPostRows } from "@/lib/blog/dashboard";
import { canMutateStudio } from "@/lib/studio-access";

export const metadata: Metadata = {
  title: "Studio",
  robots: { index: false, follow: false },
};

export default function DashboardPage() {
  return <DashboardClient rows={loadPostRows()} readOnly={!canMutateStudio()} />;
}
