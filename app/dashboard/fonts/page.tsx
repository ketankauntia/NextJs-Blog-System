import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FontPickerClient } from "@/components/dashboard/font-picker-client";
import { getAllPosts } from "@/lib/blog/content";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Typography",
  robots: { index: false, follow: false },
};

/** Fallback specimen for a site with no posts yet. */
const PLACEHOLDER = {
  title: "The quick brown fox jumps over the lazy dog",
  description:
    "A subheading sets the tone for the article and runs to roughly the length of two lines.",
  category: "Sample",
  body: "Reading comfort is decided by a short list of choices, and the typeface is not the first of them. Measure, leading and size at the smallest breakpoint all matter more. But the face still sets the voice, and a body text that fatigues at 17px will not be rescued by anything else on this page.",
};

export default function FontsPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  // Preview against real writing — lorem ipsum hides the awkward letter pairs.
  const post = getAllPosts()[0];
  const firstParagraph = post?.sections
    .flatMap((s) => s.blocks)
    .find((b) => b.type === "paragraph");

  const sample = post
    ? {
        title: post.title,
        description: post.description,
        category: post.category,
        body:
          firstParagraph && firstParagraph.type === "paragraph"
            ? firstParagraph.text
            : PLACEHOLDER.body,
      }
    : PLACEHOLDER;

  return (
    <FontPickerClient
      initial={getSettings()}
      sample={sample}
      canSave={process.env.NODE_ENV === "development"}
    />
  );
}
