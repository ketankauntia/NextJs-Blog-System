import "server-only";
import { readPostSources } from "./source.mjs";
import { canMutateStudio } from "@/lib/studio-access";
import { estimateReadingMinutes } from "@/lib/blog/parse";
import { DEFAULT_AUTHOR_SLUG, getAuthor } from "@/lib/blog/authors";
import { runSeoChecks, seoScore } from "@/lib/editor/seo-checks";
import type { Post } from "@/lib/blog/types";

export type PostStatus = "published" | "draft" | "scheduled";

export type PostRow = {
  slug: string;
  title: string;
  category: string;
  author: string;
  authorName: string;
  status: PostStatus;
  publishedAt: string;
  updatedAt: string;
  featured: boolean;
  cornerstone: boolean;
  noindex: boolean;
  words: number;
  readingMinutes: number;
  /** Percentage of local editorial SEO checks currently passing. */
  seoScore: number;
  coverTone: Post["coverTone"];
  coverImage?: string;
  coverAlt?: string;
  ogImage?: string;
};

/** Calendar day only — the dashboard lists and compares days, not times of day. */
function toIso(v: unknown): string {
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return String(v ?? "").slice(0, 10);
}

/** Reads every post (drafts + scheduled included) with the metrics a writer / owner / SEO would want. */
export function loadPostRows(): PostRow[] {
  const today = new Date().toISOString().slice(0, 10);

  return readPostSources({ localAuthoring: canMutateStudio() })
    .map(({ slug, data, content }): PostRow => {
      const publishedAt = toIso(data.publishedAt);
      const updatedAt = data.updatedAt ? toIso(data.updatedAt) : "";
      const words = content.split(/\s+/).filter(Boolean).length;
      const description = typeof data.description === "string" ? data.description : "";
      const keyphrase = typeof data.keyphrase === "string" ? data.keyphrase : "";
      const tldr = typeof data.tldr === "string" ? data.tldr : "";
      const keyTakeaways = Array.isArray(data.keyTakeaways)
        ? data.keyTakeaways.filter((value): value is string => typeof value === "string")
        : [];
      const faqs = Array.isArray(data.faqs)
        ? data.faqs.flatMap(value => {
            if (!value || typeof value !== "object") return [];
            const faq = value as { q?: unknown; question?: unknown; a?: unknown; answer?: unknown };
            const q = typeof faq.q === "string" ? faq.q : typeof faq.question === "string" ? faq.question : "";
            const a = typeof faq.a === "string" ? faq.a : typeof faq.answer === "string" ? faq.answer : "";
            return [{ q, a }];
          })
        : [];
      const tags = Array.isArray(data.tags)
        ? data.tags.filter((value): value is string => typeof value === "string")
        : [];
      const title = typeof data.title === "string" ? data.title : slug;
      const seoChecks = runSeoChecks({
        title,
        description,
        slug,
        keyphrase,
        tldr,
        keyTakeaways,
        faqs,
        tags,
        body: content,
        updatedAt: updatedAt || publishedAt,
        cornerstone: Boolean(data.cornerstone),
      });

      const status: PostStatus = data.draft
        ? "draft"
        : publishedAt > today
          ? "scheduled"
          : "published";

      return {
        slug,
        title,
        category: (data.category as string) ?? "Not set",
        author: (data.author as string) ?? DEFAULT_AUTHOR_SLUG,
        authorName: getAuthor((data.author as string) ?? DEFAULT_AUTHOR_SLUG).name,
        status,
        publishedAt,
        updatedAt,
        featured: Boolean(data.featured),
        cornerstone: Boolean(data.cornerstone),
        noindex: Boolean(data.noindex),
        words,
        readingMinutes: estimateReadingMinutes(content),
        seoScore: seoScore(seoChecks),
        coverTone: (["primary", "chart-2", "chart-3", "chart-5"].includes(String(data.coverTone)) ? data.coverTone : "primary") as Post["coverTone"],
        coverImage: typeof data.coverImage === "string" ? data.coverImage : undefined,
        coverAlt: typeof data.coverAlt === "string" ? data.coverAlt : undefined,
        ogImage: typeof data.ogImage === "string" ? data.ogImage : undefined,
      };
    })
    .sort((a, b) => (b.updatedAt || b.publishedAt).localeCompare(a.updatedAt || a.publishedAt));
}
