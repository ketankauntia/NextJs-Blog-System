import { BlogSiteFooter } from "@/components/blog-site-footer";
import { BlogSiteHeader } from "@/components/blog-site-header";
import { StudioNavigation } from "@/components/dashboard/studio-navigation";
import { IconEye } from "@tabler/icons-react";
import { notFound } from "next/navigation";
import { canMutateStudio, isStudioVisible } from "@/lib/studio-access";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  if (!isStudioVisible()) notFound();
  const readOnly = !canMutateStudio();

  return (
    <div className="studio-surface flex min-h-screen flex-col bg-background text-foreground">
      <BlogSiteHeader />
      {readOnly ? (
        <div className="border-b border-primary/20 bg-primary/5">
          <div className="mx-auto flex max-w-shell items-start gap-3 px-4 py-3 text-sm sm:items-center sm:px-6">
            <IconEye className="mt-0.5 size-4 shrink-0 text-primary sm:mt-0" aria-hidden />
            <p>
              <span className="font-semibold">Public read-only demo.</span>{" "}
              Explore every workflow and preview local changes. Saving, uploading, and publishing are disabled on this deployment.
            </p>
          </div>
        </div>
      ) : null}
      <StudioNavigation />
      <div className="flex flex-1 flex-col">{children}</div>
      <BlogSiteFooter />
    </div>
  );
}
