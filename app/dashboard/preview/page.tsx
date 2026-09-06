import type { Metadata } from "next";
import { PreviewThemesClient } from "@/components/dashboard/preview-themes-client";
import { getAllPosts } from "@/lib/blog/content";
import { getSettings } from "@/lib/settings";
import { canMutateStudio } from "@/lib/studio-access";

export const metadata: Metadata = {
  title: "Theme preview",
  robots: { index: false, follow: false },
};

export default function ThemePreviewPage() {
  const posts = getAllPosts().map((p) => ({ slug: p.slug, title: p.title }));
  return (
    <PreviewThemesClient
      initial={getSettings()}
      posts={posts}
      canSave={canMutateStudio()}
    />
  );
}
