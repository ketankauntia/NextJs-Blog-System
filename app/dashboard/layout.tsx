import { StudioShell } from "@/components/dashboard/studio-shell";
import { notFound } from "next/navigation";
import { canMutateStudio, isStudioVisible } from "@/lib/studio-access";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  if (!isStudioVisible()) notFound();
  const readOnly = !canMutateStudio();

  return <StudioShell readOnly={readOnly}>{children}</StudioShell>;
}
