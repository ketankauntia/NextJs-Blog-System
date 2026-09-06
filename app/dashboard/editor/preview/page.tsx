import type { Metadata } from "next";
import { Suspense } from "react";
import { PreviewClient } from "@/components/editor/preview-client";

export const metadata: Metadata = {
  title: "Preview",
  robots: { index: false, follow: false },
};

export default function EditorPreviewPage() {
  return (
    <Suspense fallback={null}>
      <PreviewClient />
    </Suspense>
  );
}
