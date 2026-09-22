import { load, JSON_SCHEMA } from "js-yaml";
import { parseSections, estimateReadingMinutes } from "./parse.js";
import { safeUrl } from "./config.js";
export { parseSections, slugify, estimateReadingMinutes } from "./parse.js";
export type { PostSection, PostBlock } from "./types.js";

export const MAX_POST_BYTES = 512 * 1024;
export function validSlug(value: unknown): value is string {
  return typeof value === "string" && value.length <= 120 && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(value) && !/^(con|prn|aux|nul|com[0-9]|lpt[0-9])$/i.test(value);
}

function text(value: unknown, field: string, fallback?: string): string {
  if (value === undefined && fallback !== undefined) return fallback;
  if (typeof value !== "string" || !value.trim() || value.length > 4000) throw new Error(`Invalid ${field}.`);
  return value.trim();
}

function iso(value: unknown): string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2}))?$/.test(value) || !Number.isFinite(Date.parse(value))) throw new Error("publishedAt/updatedAt must be an ISO date or timestamp with timezone.");
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  const calendar = new Date(Date.UTC(year, month - 1, day));
  if (calendar.getUTCFullYear() !== year || calendar.getUTCMonth() !== month - 1 || calendar.getUTCDate() !== day) throw new Error("Invalid calendar date.");
  return value;
}

export function parsePost(slug: string, source: string, defaultAuthor = "Author") {
  if (!validSlug(slug)) throw new Error("Invalid post slug.");
  if (new TextEncoder().encode(source).length > MAX_POST_BYTES) throw new Error("Post exceeds 512 KiB.");
  const normalized = source.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");
  const match = normalized.match(/^---\n([\s\S]*?)\n---(?:\n|$)/);
  if (!match || match[1].length > 32768) throw new Error("A YAML frontmatter block (maximum 32 KiB) is required.");
  // Fixed JSON schema: no language selection, executable tags, timestamps or custom constructors.
  const data = load(match[1], { schema: JSON_SCHEMA });
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("Frontmatter must be an object.");
  const v = data as Record<string, unknown>;
  for (const key of ["draft", "noindex", "featured", "cornerstone"]) if (v[key] !== undefined && typeof v[key] !== "boolean") throw new Error(`${key} must be a boolean.`);
  const list = (value: unknown, field: string): string[] => {
    if (value === undefined) return [];
    if (!Array.isArray(value) || value.length > 100) throw new Error(`Invalid ${field}.`);
    return value.map(item => text(item, field));
  };
  const body = normalized.slice(match[0].length);
  const image = (value: unknown) => { if (value === undefined) return undefined; const url = text(value, "image"); if (!safeUrl(url, true)) throw new Error("Unsafe image URL."); return url; };
  let canonical: string | undefined;
  if (v.canonical !== undefined) { canonical = text(v.canonical, "canonical"); if (!safeUrl(canonical, true)) throw new Error("Unsafe canonical URL."); }
  const faqs = v.faqs === undefined ? [] : v.faqs;
  if (!Array.isArray(faqs) || faqs.length > 100) throw new Error("Invalid FAQs.");
  return {
    slug, title: text(v.title, "title"), description: v.description === undefined || v.description === "" ? "" : text(v.description, "description"),
    author: text(v.author, "author", defaultAuthor), category: text(v.category, "category", "General"),
    tags: list(v.tags, "tags"), publishedAt: iso(v.publishedAt), updatedAt: v.updatedAt === undefined ? undefined : iso(v.updatedAt),
    draft: v.draft === true, noindex: v.noindex === true, featured: v.featured === true, cornerstone:v.cornerstone===true,
    coverTone:typeof v.coverTone==='string'?v.coverTone:'primary', keyphrase:typeof v.keyphrase==='string'?v.keyphrase:'', ogImage:image(v.ogImage),
    canonical, coverImage: image(v.coverImage), coverAlt: typeof v.coverAlt === "string" ? v.coverAlt : "",
    tldr: v.tldr === undefined ? "" : text(v.tldr, "tldr"), keyTakeaways: list(v.keyTakeaways, "keyTakeaways"),
    faqs: faqs.map(f => { if (!f || typeof f !== "object") throw new Error("Invalid FAQ."); return { question: text(f.q, "FAQ question"), answer: text(f.a, "FAQ answer") }; }),
    body, sections: parseSections(body), readingMinutes: estimateReadingMinutes(body),
  };
}
export type BlogPost = ReturnType<typeof parsePost>;
export function isPublished(post: BlogPost, now = Date.now()): boolean { return !post.draft && Date.parse(post.publishedAt) <= now; }

/** Structured editing preserves existing frontmatter fields the simple form does not expose. */
export function editPostSource(slug: string, fields: unknown, existingSource?: string): string {
  if (!fields || typeof fields !== "object" || Array.isArray(fields)) throw new Error("Invalid post fields.");
  const values = fields as Record<string, unknown>;
  if (Object.keys(values).some(key => !["title", "description", "publishedAt", "author", "draft", "body"].includes(key)) || typeof values.body !== "string" || typeof values.draft !== "boolean" || typeof values.author !== "string") throw new Error("Invalid post fields.");
  if (!values.body.trim()) throw new Error("Write some content before saving.");
  let metadata: Record<string, unknown> = {};
  if (existingSource) {
    parsePost(slug, existingSource);
    const match = existingSource.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").match(/^---\n([\s\S]*?)\n---(?:\n|$)/)!;
    metadata = load(match[1], { schema: JSON_SCHEMA }) as Record<string, unknown>;
  }
  const { body, ...frontmatter } = values;
  metadata = { ...metadata, ...frontmatter };
  if (!values.author.trim()) delete metadata.author;
  const source = `---\n${JSON.stringify(metadata, null, 2)}\n---\n\n${body.trim()}\n`;
  parsePost(slug, source);
  return source;
}
