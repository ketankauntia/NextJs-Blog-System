import {
  IconArticle,
  IconChartBar,
  IconFileText,
  IconLayoutGrid,
  IconRobot,
  IconSearch,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";

type Feature = {
  icon: Icon;
  title: string;
  body: string;
  /** Concrete, checkable claims. Vague benefits belong in the body, not here. */
  points: string[];
};

const FEATURES: Feature[] = [
  {
    icon: IconFileText,
    title: "Markdown is the database",
    body: "A post is a file. It reviews in a pull request, diffs like code, and has no admin panel that can go down.",
    points: ["YAML frontmatter", "Drafts and scheduled publishing", "Categories, tags, authors"],
  },
  {
    icon: IconSearch,
    title: "SEO that is actually wired up",
    body: "Length-checked titles and descriptions, self-referencing canonicals, and a sitemap that respects noindex and lifts pillar content.",
    points: ["BlogPosting, FAQPage, Breadcrumb", "Open Graph and Twitter cards", "Generated social images"],
  },
  {
    icon: IconRobot,
    title: "Readable by machines",
    body: "Answer-first summaries and structured sections give crawlers and language models something to lift verbatim.",
    points: ["llms.txt index", "Raw markdown per post", "RSS with full content"],
  },
  {
    icon: IconArticle,
    title: "Built for long reads",
    body: "The parser emits typed blocks, so the body, table of contents, search index and structured data all derive from one source.",
    points: ["Scroll-spy contents", "Callouts, stats, tables, code", "Reading progress and time"],
  },
  {
    icon: IconChartBar,
    title: "An editor that scores you",
    body: "The studio runs the same SEO and readability checks live while you type, and shows the result as a search listing.",
    points: ["Live SEO scoring", "Internal-link suggestions", "SERP preview"],
  },
  {
    icon: IconLayoutGrid,
    title: "Switchable, not hard-coded",
    body: "Three listing layouts, three post layouts and five typeface pairings, changed from settings rather than from components.",
    points: ["No component edits", "Preview before applying", "Feature flags for every surface"],
  },
];

/** What the system does, on the home page, for a reader who has not seen the repo. */
export function FeatureGrid() {
  return (
    <section aria-labelledby="features-heading">
      <h2
        id="features-heading"
        className="font-heading text-2xl font-bold tracking-tight sm:text-3xl"
      >
        What runs underneath
      </h2>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Every article on this site is rendered by the system described below. It is open source, and
        the whole of it is markdown files plus a Next.js app.
      </p>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
    </section>
  );
}
