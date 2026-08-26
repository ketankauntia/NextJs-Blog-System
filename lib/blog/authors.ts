import type { Author } from "./types";

/**
 * Authors are code, not content — a post's `author` frontmatter field points at a
 * slug listed here. Add an entry per writer; the first entry is the fallback.
 */
export const authors: Author[] = [
  {
    slug: "ketan",
    name: "Ketan",
    role: "Maintainer",
    initials: "K",
    bio: "Builds web products and writes about the parts that are usually left undocumented.",
    websiteUrl: "/",
    twitterUrl: "https://x.com/kauntiaketan",
    followLinks: true,
  },
];

export const DEFAULT_AUTHOR_SLUG = authors[0].slug;

export function getAuthor(slug: string): Author {
  return authors.find((a) => a.slug === slug) ?? authors[0];
}
