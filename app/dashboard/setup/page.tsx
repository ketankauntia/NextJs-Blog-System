import type { Metadata } from "next";
import { PublishingSetupPanel } from "@/components/dashboard/publishing-setup";

export const metadata: Metadata = { title: "Publishing setup", robots: { index: false, follow: false } };
export default function PublishingSetupPage() {
  return <PublishingSetupPanel />;
}
