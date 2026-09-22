import { StudioShell } from "@/components/dashboard/studio-shell";
import { notFound } from "next/navigation";
import { canMutateStudio, isStudioVisible } from "@/lib/studio-access";
import {getSettings} from '@/lib/settings';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  if (!isStudioVisible()) notFound();
  const readOnly = !canMutateStudio();

  return <StudioShell readOnly={readOnly} publicationName={getSettings().publicationName || undefined}>{children}</StudioShell>;
}
