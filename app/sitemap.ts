import type { MetadataRoute } from "next";
import {
  categoryToSlug,
  getAllTags,
  getCategories,
  getIndexablePosts,
  paginate,
  tagToSlug,
} from "@/lib/blog/content";
import { authors } from "@/lib/blog/authors";
import { features } from "@/lib/features";
import { absoluteUrl } from "@/lib/site";

// Regenerated on the same hourly cadence as the listings it mirrors.
export const revalidate = 3600;

/**
 * Every indexable URL the site produces. Anything excluded here is either
 * `noindex` (per-post frontmatter), a draft, scheduled for a future date, or a
 * machine endpoint (RSS, llms.txt, raw markdown) that crawlers reach another way.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getIndexablePosts();
  const newest = posts[0]?.updatedAt ?? posts[0]?.publishedAt ?? new Date().toISOString();

  const entries: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: newest, changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/blog"), lastModified: newest, changeFrequency: "daily", priority: 0.9 },
  ];

  // Paginated archive pages 2..N (page 1 is /blog and is already listed).
  const rest = posts.filter((p) => !p.featured).length;
  const { totalPages } = paginate(new Array(rest), 1);
  for (let page = 2; page <= totalPages; page += 1) {
    entries.push({
      url: absoluteUrl(`/blog/page/${page}`),
      lastModified: newest,
      changeFrequency: "weekly",
      priority: 0.4,
    });
  }

  for (const post of posts) {
    entries.push({
      url: absoluteUrl(`/blog/post/${post.slug}`),
      lastModified: post.updatedAt ?? post.publishedAt,
      changeFrequency: "monthly",
      // Pillar articles are the pages worth recrawling first.
      priority: post.cornerstone ? 0.9 : 0.7,
    });
  }

  if (features.categoryPages) {
    for (const category of getCategories()) {
      entries.push({
        url: absoluteUrl(`/blog/category/${categoryToSlug(category)}`),
        lastModified: newest,
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }
  }

  if (features.tagPages) {
    for (const tag of getAllTags()) {
      entries.push({
        url: absoluteUrl(`/blog/tag/${tagToSlug(tag)}`),
        lastModified: newest,
        changeFrequency: "weekly",
        priority: 0.4,
      });
    }
  }

  if (features.authorPages) {
    for (const author of authors) {
      entries.push({
        url: absoluteUrl(`/blog/author/${author.slug}`),
        lastModified: newest,
        changeFrequency: "weekly",
        priority: 0.4,
      });
    }
  }

  return entries;
}
