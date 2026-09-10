import type { Metadata } from "next";
import { readPostSources } from "@/lib/blog/source.mjs";
import { PostEditor, type EditablePost } from "@/components/editor/post-editor";
import { authors, DEFAULT_AUTHOR_SLUG } from "@/lib/blog/authors";
import { canMutateStudio } from "@/lib/studio-access";

export const metadata: Metadata = {
  title: "Post editor",
  robots: { index: false, follow: false },
};

function loadEditablePosts(): EditablePost[] {
  return readPostSources({ localAuthoring: canMutateStudio() })
    .map(({ slug, data, content }) => {
      return {
        slug,
        title: (data.title as string) ?? "",
        description: (data.description as string) ?? "",
        category: (data.category as string) ?? "",
        tags: (data.tags as string[]) ?? [],
        publishedAt: normalizeDate(data.publishedAt),
        updatedAt: data.updatedAt ? normalizeDate(data.updatedAt) : "",
        author: (data.author as string) ?? DEFAULT_AUTHOR_SLUG,
        featured: Boolean(data.featured),
        draft: Boolean(data.draft),
        cornerstone: Boolean(data.cornerstone),
        noindex: Boolean(data.noindex),
        canonical: (data.canonical as string) ?? "",
        coverTone: (data.coverTone as string) ?? "primary",
        coverImage: (data.coverImage as string) ?? "",
        coverAlt: (data.coverAlt as string) ?? "",
        ogImage: (data.ogImage as string) ?? "",
        keyphrase: (data.keyphrase as string) ?? "",
        tldr: ((data.tldr as string) ?? "").trim(),
        keyTakeaways: (data.keyTakeaways as string[]) ?? [],
        faqs: (data.faqs as { q: string; a: string }[]) ?? [],
        body: content.trim(),
      };
    })
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

function normalizeDate(value: unknown): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value ?? "");
}

export default async function EditorPage({
  searchParams,
}: {
  searchParams: Promise<{ slug?: string; new?: string }>;
}) {
  const { slug, new: newPost } = await searchParams;
  return (
    <PostEditor
      posts={loadEditablePosts()}
      authorSlugs={authors.map((a) => a.slug)}
      canSave={canMutateStudio()}
      initialSlug={newPost === "1" ? "__new__" : slug}
    />
  );
}
