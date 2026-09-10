import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { resolveLocalContent } from "../publishing/local-content.mjs";

/** Public visibility never depends on development mode. */
export function isPublished(data, now = Date.now()) {
  if (data.draft !== undefined && data.draft !== false) return false;
  const value = data.publishedAt;
  if (!(value instanceof Date) && typeof value !== "string") return false;
  if (typeof value === "string" && !/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2}))?$/.test(value)) return false;
  const timestamp = value instanceof Date ? value.getTime() : Date.parse(value);
  return Number.isFinite(timestamp) && timestamp <= now;
}

export function isContentSlug(slug) {
  return typeof slug === "string" && slug.length <= 160 && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug);
}

/** Filesystem source shared by public readers and explicitly local authoring. */
export function readPostSources({ localAuthoring = false, now = Date.now() } = {}) {
  const directory = resolveLocalContent("posts");
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory)
    .filter(file => file.endsWith(".md") && isContentSlug(file.slice(0, -3)))
    .filter(file => !fs.lstatSync(path.join(directory, file)).isSymbolicLink())
    .map(file => {
      const { data, content } = matter(fs.readFileSync(path.join(directory, file), "utf8"));
      return { slug: file.slice(0, -3), data, content };
    })
    .filter(post => localAuthoring || isPublished(post.data, now));
}
