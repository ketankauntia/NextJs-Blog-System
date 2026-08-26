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
  /** Absolute origin, no trailing slash. Set NEXT_PUBLIC_SITE_URL in every environment. */
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  /** Default social card. Generated on demand by app/opengraph-image.tsx. */
  ogImage: "/opengraph-image",
  /** Publisher used in Article/Organization JSON-LD. */
  organization: {
    name: "Ink",
    url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
    logo: "/icon.svg",
  },
  /** Optional profile links rendered in the footer. Empty entries are skipped. */
  social: {
    github: "https://github.com/",
    x: "",
  },
} as const;

export function absoluteUrl(path: string): string {
  return new URL(path, siteConfig.url).toString();
}
