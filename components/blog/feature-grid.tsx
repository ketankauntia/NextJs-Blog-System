import {
  IconArticle,
  IconChartBar,
  IconFileText,
  IconGauge,
  IconLayoutGrid,
  IconRobot,
  IconSearch,
  IconSchema,
  IconUserCircle,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";

type Feature = {
  icon: Icon;
  title: string;
  body: string;
  /** Concrete, checkable capabilities. Vague benefits belong in the body. */
  points: string[];
};

const FEATURES: Feature[] = [
  {
    icon: IconArticle,
    title: "The article page",
    body: "Built for something longer than a changelog entry. Every part below is generated from the markdown — nothing is assembled by hand per post.",
    points: [
      "Answer-first TL;DR and key takeaways",
      "Contents sidebar with scroll-spy",
      "Reading progress and reading time",
      "FAQ accordion, related posts, share row",
    ],
  },
  {
    icon: IconUserCircle,
    title: "Author blocks",
    body: "Authors are a typed list in code, not a free-text string per post. One entry gives a byline, an end-of-article card and an archive page.",
    points: [
      "Bio, role and initials avatar",
      "Per-author archive at /blog/author/…",
      "Person schema attached to every post",
      "Outbound links nofollow unless you opt in",
    ],
  },
  {
    icon: IconFileText,
    title: "Markdown is the database",
    body: "A post is a file. It reviews in a pull request, diffs like code, and there is no admin panel that can go down or get out of sync.",
    points: [
      "YAML frontmatter, typed on read",
      "Callouts, stats, tables, code, task lists",
      "Drafts and future-dated scheduling",
      "Categories, tags and related-post scoring",
    ],
  },
  {
    icon: IconChartBar,
    title: "A studio, not a CMS",
    body: "Runs in development only and writes the same markdown files. Every post in one table, so the thin and stale ones are obvious.",
    points: [
      "Word count, freshness and status",
      "Published, draft and scheduled at a glance",
      "Rich-text editing that round-trips to markdown",
      "Live preview in every template",
    ],
  },
  {
    icon: IconSearch,
    title: "SEO checks while you type",
    body: "The editor scores a draft on every keystroke and shows the result as a search listing, so problems surface before publishing rather than in an audit.",
    points: [
      "Title and description length limits",
      "Keyphrase placement and density",
      "Prompts for statistics and citations",
      "Internal-link suggestions from your own posts",
    ],
  },
  {
    icon: IconSchema,
    title: "Structured data, complete",
    body: "Not a JSON-LD snippet bolted on. One graph per page, generated from the same content the reader sees, so the two cannot disagree.",
    points: [
      "BlogPosting, FAQPage, BreadcrumbList",
      "WebSite and Organization publisher",
      "Canonicals that match og:url",
      "Social cards generated per post",
    ],
  },
  {
    icon: IconRobot,
    title: "Readable by machines",
    body: "Language models and crawlers get a clean path to the text instead of scraping it out of markup.",
    points: [
      "llms.txt index of every post",
      "Raw markdown at /blog/post/<slug>.md",
      "RSS carrying full article content",
      "Static search index, fetched on demand",
    ],
  },
  {
    icon: IconLayoutGrid,
    title: "Changed from settings",
    body: "Three listing layouts, three post layouts and five typeface pairings. Preview them against real posts, then save — no component edits.",
    points: [
      "Classic, magazine and minimal listings",
      "Standard, centered and hero posts",
      "Five heading and body pairings",
      "Light and dark, no flash on load",
    ],
  },
];

type PerfStat = { value: string; label: string; detail: string };

/**
 * Measured on the production build of this site, not estimated. Keeping the
 * honest framing matters more than a big number: the JS figure below is the
 * React and Next.js baseline, which no amount of blog code removes.
 */
function performanceStats(pageCount: number): PerfStat[] {
  return [
    {
      value: String(pageCount),
      label: "public pages in the sitemap",
      detail: "Each one is static HTML written at build time. Nothing renders on request.",
    },
    {
      value: "27 KB",
      label: "compressed article",
      detail: "The longest post here, gzipped, including its full text and structured data.",
    },
    {
      value: "0",
      label: "third-party requests on load",
      detail: "Fonts are self-hosted. No analytics, no CDN, no tracker, nothing to block.",
    },
    {
      value: "On open",
      label: "search and AI menu load",
      detail: "Both are separate chunks. Readers who never use them never download them.",
    },
  ];
}

/** What the system does, on the home page, for a reader who has not seen the repo. */
export function FeatureGrid({ pageCount }: { pageCount: number }) {
  const stats = performanceStats(pageCount);

  return (
    <section aria-labelledby="features-heading">
      <h2
        id="features-heading"
        className="font-heading text-2xl font-bold tracking-tight sm:text-3xl"
      >
        What you get
      </h2>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Every article on this site is rendered by the system below — the reading experience, the
        author blocks, the structured data and the editor that scored the drafts. It is open source,
        and all of it is markdown files plus a Next.js app.
      </p>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map(({ icon: Icon, title, body, points }) => (
          <li
            key={title}
            className="flex flex-col rounded-xl border bg-card p-5 transition-colors hover:border-primary/40"
          >
            <span
              aria-hidden
              className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary"
            >
              <Icon className="size-5" />
            </span>
            <h3 className="mt-4 font-heading text-lg font-semibold tracking-tight">{title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{body}</p>
            <ul className="mt-4 space-y-1.5 border-t pt-4 text-sm text-muted-foreground">
              {points.map((point) => (
                <li key={point} className="flex gap-2">
                  <span aria-hidden className="mt-1.5 size-1 shrink-0 rounded-full bg-primary" />
                  {point}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>

      {/* Performance, stated with numbers rather than adjectives. */}
      <div className="mt-6 rounded-xl border bg-card p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary"
          >
            <IconGauge className="size-5" />
          </span>
          <h3 className="font-heading text-lg font-semibold tracking-tight">
            Is it actually fast?
          </h3>
        </div>

        <dl className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label}>
              <dt className="sr-only">{stat.label}</dt>
              <dd>
                <span className="font-heading text-3xl font-bold tracking-tight">{stat.value}</span>
                <span className="mt-1 block text-sm font-medium text-foreground">{stat.label}</span>
                <span className="mt-1 block text-sm text-muted-foreground">{stat.detail}</span>
              </dd>
            </div>
          ))}
        </dl>

        <p className="mt-6 border-t pt-5 text-sm text-muted-foreground">
          The honest caveat: an article still ships around 200 KB of compressed JavaScript, and
          almost all of it is React and the Next.js runtime rather than anything here. What the blog
          controls is that the text does not wait for it — the words are in the HTML and paint
          before a single line of that JavaScript executes.
        </p>
      </div>
    </section>
  );
}
