import type { Metadata } from "next";
import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { loadPostRows } from "@/lib/blog/dashboard";
import { canMutateStudio } from "@/lib/studio-access";

export const metadata: Metadata = { title: "Content board", robots: { index: false, follow: false } };

export default function BoardPage() {
  return <DashboardClient rows={loadPostRows()} readOnly={!canMutateStudio()} view="board" />;
}
