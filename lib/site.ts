/**
 * Resolves the absolute origin every crawler-visible URL is built from.
 *
 * Only `NEXT_PUBLIC_*` variables are read here, because this module is imported
 * by client components too — a server-only variable would be `undefined` in the
 * browser bundle and the two halves would disagree about the canonical host.
 */
function resolveSiteUrl(): string {
  const candidates = [
    process.env.NEXT_PUBLIC_SITE_URL,
    // Vercel exposes both of these to the browser bundle automatically.
    // The first is the stable production domain; the second is the
    // per-deployment host, which is what preview builds get.
    process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL,
    process.env.NEXT_PUBLIC_VERCEL_URL,
  ];

  for (const candidate of candidates) {
    const value = candidate?.trim();
    // A `NEXT_PUBLIC_*` variable that is declared but empty is inlined as ""
    // rather than left undefined, so this has to test truthiness and not
    // nullishness. Getting that wrong fails the build inside `new URL()`.
    if (!value) continue;

    // Vercel's host variables carry no scheme, and people routinely set
    // NEXT_PUBLIC_SITE_URL to a bare domain for the same reason.
    const withScheme = /^https?:\/\//i.test(value) ? value : `https://${value}`;

    try {
      // `.origin` also normalises away a trailing slash or a stray path.
      return new URL(withScheme).origin;
    } catch {
      // Try the next candidate rather than taking down the build.
    }
  }

  return "http://localhost:3000";
}

const SITE_URL = resolveSiteUrl();

/**
 * The single place a fork edits to make this blog its own.
 *
 * Everything crawler-visible — canonicals, Open Graph, RSS, JSON-LD, sitemap,
 * llms.txt — derives from these values, so there is no second copy to keep in sync.
 */
export const siteConfig = {
  /** Used as the RSS channel title and the Open Graph `site_name`. */
  name: "Ink",
  /** Short brand shown in the header. */
  shortName: "Ink",
  /** Feed description and the fallback meta description. */
  description:
    "A file-based blog system for Next.js: write markdown, get fast, structured, search-ready pages.",
  /** Absolute origin, no trailing slash. See {@link resolveSiteUrl}. */
  url: SITE_URL,
  /** Default social card. Generated on demand by app/opengraph-image.tsx. */
  ogImage: "/opengraph-image",
  /** Publisher used in Article/Organization JSON-LD. */
  organization: {
    name: "Ink",
    url: SITE_URL,
    logo: "/icon.svg",
  },
  /** Optional profile links rendered in the footer. Empty entries are skipped. */
  social: {
    github: "https://github.com/ketankauntia/NextJs-Blog-System",
    x: "",
  },
} as const;

export function absoluteUrl(path: string): string {
  return new URL(path, siteConfig.url).toString();
}
