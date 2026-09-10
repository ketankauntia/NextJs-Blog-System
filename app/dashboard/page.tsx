import type { Metadata } from "next";
import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { loadPostRows } from "@/lib/blog/dashboard";
import { canMutateStudio } from "@/lib/studio-access";
import { readContentReviews } from "@/lib/blog/reviews.mjs";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Content",
  robots: { index: false, follow: false },
};

export default function DashboardPage() {
  const local = canMutateStudio();
  return <DashboardClient rows={loadPostRows()} readOnly={!local} initialReviews={local ? readContentReviews() : {}} today={new Date().toISOString().slice(0, 10)} seoThresholds={getSettings().seoScoreThresholds} />;
}
