import fs from "node:fs";
import { resolveLocalContent } from "./publishing/local-content.mjs";
import { cache } from "react";
import {
  BLOG_TEMPLATES,
  POST_TEMPLATES,
  FONT_PAIRINGS,
  DEFAULT_SETTINGS,
  DEFAULT_SEO_SCORE_THRESHOLDS,
  type BlogTemplate,
  type FontPairing,
  type PostTemplate,
  type SeoScoreThresholds,
  type SiteSettings,
} from "./settings-shared";

/**
 * Site settings — persisted in content/settings.json (same repo-is-the-CMS ethos as posts).
 * Edited from /dashboard/settings (dev-only writes); read server-side at render/ISR time.
 * Client components must import from lib/settings-shared.ts instead (this module uses fs).
 */

export * from "./settings-shared";

/** Falls back to the default whenever the stored value is missing or unrecognised. */
function pick<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

function pickSeoScoreThresholds(value: unknown): SeoScoreThresholds {
  if (!value || typeof value !== "object") return DEFAULT_SEO_SCORE_THRESHOLDS;
  const thresholds = value as Partial<SeoScoreThresholds>;
  const redMax = thresholds.redMax;
  const yellowMax = thresholds.yellowMax;
  if (
    typeof redMax === "number" &&
    typeof yellowMax === "number" &&
    Number.isInteger(redMax) &&
    Number.isInteger(yellowMax) &&
    redMax >= 0 &&
    redMax < yellowMax &&
    yellowMax <= 100
  ) {
    return { redMax, yellowMax };
  }
  return DEFAULT_SEO_SCORE_THRESHOLDS;
}

export const getSettings = cache((): SiteSettings => {
  const settingsFile = resolveLocalContent("settings.json");
  try {
    const raw = JSON.parse(fs.readFileSync(settingsFile, "utf8")) as Partial<SiteSettings>;
    return {
      blogTemplate: pick<BlogTemplate>(raw.blogTemplate, BLOG_TEMPLATES, DEFAULT_SETTINGS.blogTemplate),
      postTemplate: pick<PostTemplate>(raw.postTemplate, POST_TEMPLATES, DEFAULT_SETTINGS.postTemplate),
      fontPairing: pick<FontPairing>(raw.fontPairing, FONT_PAIRINGS, DEFAULT_SETTINGS.fontPairing),
      seoScoreThresholds: pickSeoScoreThresholds(raw.seoScoreThresholds),
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
});
