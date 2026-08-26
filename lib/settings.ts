import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import {
  BLOG_TEMPLATES,
  POST_TEMPLATES,
  FONT_PAIRINGS,
  DEFAULT_SETTINGS,
  type BlogTemplate,
  type FontPairing,
  type PostTemplate,
  type SiteSettings,
} from "./settings-shared";

/**
 * Site settings — persisted in content/settings.json (same repo-is-the-CMS ethos as posts).
 * Edited from /dashboard/settings (dev-only writes); read server-side at render/ISR time.
 * Client components must import from lib/settings-shared.ts instead (this module uses fs).
 */

export * from "./settings-shared";

const SETTINGS_FILE = path.join(process.cwd(), "content", "settings.json");

/** Falls back to the default whenever the stored value is missing or unrecognised. */
function pick<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

export const getSettings = cache((): SiteSettings => {
  try {
    const raw = JSON.parse(fs.readFileSync(SETTINGS_FILE, "utf8")) as Partial<SiteSettings>;
    return {
      blogTemplate: pick<BlogTemplate>(raw.blogTemplate, BLOG_TEMPLATES, DEFAULT_SETTINGS.blogTemplate),
      postTemplate: pick<PostTemplate>(raw.postTemplate, POST_TEMPLATES, DEFAULT_SETTINGS.postTemplate),
      fontPairing: pick<FontPairing>(raw.fontPairing, FONT_PAIRINGS, DEFAULT_SETTINGS.fontPairing),
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
});
