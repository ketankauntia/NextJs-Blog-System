/** Client-safe settings constants/types. fs-backed reading lives in lib/settings.ts (server-only). */

export const BLOG_TEMPLATES = ["classic", "magazine", "minimal"] as const;
export const POST_TEMPLATES = ["standard", "centered", "hero"] as const;
export const FONT_PAIRINGS = ["editorial", "classic", "modern", "technical", "literary"] as const;

export type BlogTemplate = (typeof BLOG_TEMPLATES)[number];
export type PostTemplate = (typeof POST_TEMPLATES)[number];
export type FontPairing = (typeof FONT_PAIRINGS)[number];

export type SiteSettings = {
  /** Layout of /blog (and its pagination pages). */
  blogTemplate: BlogTemplate;
  /** Layout of individual post pages. */
  postTemplate: PostTemplate;
  /** Heading + body typeface pairing, applied on <body> as data-font. */
  fontPairing: FontPairing;
};

export const DEFAULT_SETTINGS: SiteSettings = {
  blogTemplate: "classic",
  postTemplate: "standard",
  fontPairing: "modern",
};

/** Display copy for the font picker. Kept beside the ids so the two cannot drift. */
export const FONT_PAIRING_META: Record<
  FontPairing,
  { name: string; heading: string; body: string; blurb: string }
> = {
  editorial: {
    name: "Editorial",
    heading: "Fraunces",
    body: "Geist Sans",
    blurb:
      "Soft, high-contrast serif headlines against a neutral grotesk. Reads like a magazine feature.",
  },
  classic: {
    name: "Classic",
    heading: "Instrument Serif",
    body: "Inter",
    blurb:
      "Tall, sharp didone headlines. The most traditionally bookish of the five, and the highest contrast.",
  },
  modern: {
    name: "Modern",
    heading: "Bricolage Grotesque",
    body: "Inter",
    blurb:
      "Characterful contemporary display sans. No serifs anywhere — confident rather than literary.",
  },
  technical: {
    name: "Technical",
    heading: "Space Grotesk",
    body: "IBM Plex Sans",
    blurb:
      "Engineered, slightly squared letterforms. Looks like developer tooling, in a good way.",
  },
  literary: {
    name: "Literary",
    heading: "Newsreader",
    body: "Newsreader",
    blurb:
      "Serif for headings and body alike. The quietest option and the easiest on a long article.",
  },
};
