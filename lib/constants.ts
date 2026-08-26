import { siteConfig } from "@/lib/site";

/** Absolute site origin. Re-exported from siteConfig so there is one source of truth. */
export const SITE_URL = siteConfig.url;

/** Absolute URL for a site-relative path. */
export function getFullUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
