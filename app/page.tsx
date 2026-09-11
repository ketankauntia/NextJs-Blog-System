import type { Metadata } from "next";
import Link from "next/link";
import {
  IconArrowRight,
  IconArrowUpRight,
  IconBrandNextjs,
  IconCheck,
  IconCode,
  IconFileText,
  IconGitBranch,
  IconLayout,
  IconRss,
  IconSearch,
} from "@tabler/icons-react";
import { BlogSiteFooter } from "@/components/blog-site-footer";
import { BlogSiteHeader } from "@/components/blog-site-header";
import { Button } from "@/components/blog-ui/button";
import { SiteJsonLd } from "@/components/blog/site-json-ld";
import { ProductPreview } from "@/components/marketing/product-preview";
import { GrowthButtonLabel } from "@/components/blog/growth-button-label";
import { ConversionExample } from "@/components/blog/conversion-example";
import { PostCard } from "@/components/blog/post-card";
import { getAllPosts } from "@/lib/blog/content";
import { buildPageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { isStudioVisible } from "@/lib/studio-access";

export const revalidate = 3600;
export const metadata: Metadata = buildPageMetadata({
  title: "The publishing layer Next.js projects are missing",
  description:
    "A source-available CMS and publishing layer for Next.js with an editorial Studio, practical SEO guidance, and content your team owns.",
  path: "/",
});

const workflow = [
  {
    icon: IconFileText,
    title: "A place to publish.",
    body: "Draft, edit, review, schedule, and publish from a visual Studio or your favorite editor. The source stays portable.",
    detail: "Familiar workflow. Developer-owned content.",
  },
  {
    icon: IconLayout,
    title: "SEO by default.",
    body: "Consistent metadata, canonical URLs, social cards, structured data, feeds, and factual checks are part of the publishing path.",
    detail: "Fewer omissions. No score theater.",
  },
  {
    icon: IconGitBranch,
    title: "One source. Every surface.",
    body: "Article pages, search, social cards, structured data, RSS, and AI-readable output stay connected to the same content model.",
    detail: "Write once. Let the system do the rest.",
  },
];

export default function HomePage() {
  const posts = getAllPosts();
  const lead = posts.find((post) => post.featured) ?? posts[0];
  const showStudio = isStudioVisible();

  return (
    <div className="product-site flex min-h-screen flex-col bg-background text-foreground">
      <BlogSiteHeader />
      <SiteJsonLd />
      <main id="main-content" className="flex-1">
        <section className="landing-hero">
          <div className="page-shell">
            <div className="hero-copy">
              <a
                href={siteConfig.social.github}
                target="_blank"
                rel="noreferrer"
                className="hero-announcement"
              >
                <span className="status-dot" aria-hidden /> Source available. The
                Next.js publishing layer.
                <IconArrowUpRight className="size-3.5" aria-hidden />
              </a>
              <h1>
                Next.js powers the product.
                <br />
                <span className="editorial-accent">
                  We’re building what it doesn’t ship.
                </span>
              </h1>
              <p>
                A source-available, plug-and-play blog and CMS. Integrates in just 10 seconds.
                <br className="hidden sm:block" />
                {" "}Editorial workflow, SEO guidance, and content ownership in one
                system.
              </p>
              <div className="hero-actions">
                <Button
                  size="lg"
                  asChild
                  className="button-ink h-11 gap-3 px-5"
                >
                  <Link href="/docs#get-started">
                    Start building
                    <IconArrowRight className="size-4" aria-hidden />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  asChild
                  className="h-11 gap-3 px-5"
                >
                  <Link href={showStudio ? "/dashboard" : "/blog"}>
                    {showStudio ? "Explore the Studio" : "Explore the blog"}
                    <IconArrowUpRight className="size-4" aria-hidden />
                  </Link>
                </Button>
              </div>
              <p className="hero-footnote">
                Early-stage <span aria-hidden>·</span> Attribution required{" "}
                <span aria-hidden>·</span> Built for Next.js teams
              </p>
            </div>
            {lead ? (
              <ProductPreview
                post={{
                  title: lead.title,
                  slug: lead.slug,
                  category: lead.category,
                  description: lead.description,
                  tldr: lead.tldr,
                  readingMinutes: lead.readingMinutes,
                  headings: lead.sections
                    .map((section) => section.heading)
                    .filter(Boolean)
                    .slice(0, 4),
                }}
              />
            ) : null}
            <div className="stack-strip">
              <p>Right at home in your stack.</p>
              <div>
                <span>
                  <IconBrandNextjs aria-hidden />
                  Next.js
                </span>
                <span>
                  <IconCode aria-hidden />
                  TypeScript
                </span>
                <span>
                  <IconGitBranch aria-hidden />
                  Git
                </span>
                <span>
                  <IconFileText aria-hidden />
                  Markdown
                </span>
                <span className="stack-shadcn">shadcn/ui</span>
              </div>
            </div>
          </div>
        </section>

        <section
          id="problem"
          className="page-shell marketing-section problem-section scroll-mt-24"
        >
          <div className="section-split-heading">
            <div>
              <p className="eyebrow">THE GAP</p>
              <h2>
                Next.js gives you the app.
                <br />
                <span className="text-muted-foreground">
                  Not the publishing system.
                </span>
              </h2>
            </div>
            <p>
              Next.js gives teams powerful application and delivery primitives.
              Content-driven products still have to assemble the layer that
              turns ideas into durable, discoverable pages.
            </p>
          </div>
          <div className="problem-grid">
            <article>
              <div className="problem-number">01</div>
              <h3>The content layer is missing</h3>
              <p>
                Docs, changelogs, case studies, landing pages, newsletters, and
                a blog need somewhere coherent to live. Many teams end up
                building each surface separately.
              </p>
            </article>
            <article>
              <div className="problem-number">02</div>
              <h3>SEO is a collection of primitives</h3>
              <p>
                Titles, descriptions, canonicals, social cards, structured
                data, sitemaps, robots, feeds, and internal links need shared
                defaults and checks. The framework does not provide that
                editorial contract for you.
              </p>
            </article>
            <article>
              <div className="problem-number">03</div>
              <h3>The stack drifts apart</h3>
              <p>
                WordPress offers a familiar publishing workflow. Yoast adds
                inline guidance. Headless CMS tools add remote content. In a
                Next.js app, those layers can become a second system to sync,
                host, and maintain.
              </p>
            </article>
          </div>
        </section>

        <section
          id="product"
          className="page-shell marketing-section scroll-mt-24"
        >
          <div className="section-intro">
            <p className="eyebrow">THE PRODUCT</p>
            <h2>
              WordPress-like publishing.
              <br />
              <span className="text-muted-foreground">
                Next.js-native delivery.
              </span>
            </h2>
            <p>
              A familiar place for writers and marketers to work, with content,
              code, and generated output kept in sync.
            </p>
          </div>
          <div className="workflow-grid">
            {workflow.map(({ icon: Icon, title, body, detail }, index) => (
              <article key={title}>
                <div className="workflow-number">
                  <Icon className="size-5" aria-hidden />
                  <span>0{index + 1}</span>
                </div>
                <h3>{title}</h3>
                <p>{body}</p>
                <span className="workflow-detail">{detail}</span>
              </article>
            ))}
          </div>
        </section>

        <section id="reader-experience" className="reader-section scroll-mt-24">
          <div className="page-shell marketing-section">
            <div className="section-split-heading">
              <div>
                <p className="eyebrow">MADE FOR THE READER</p>
                <h2>
                  Good ideas deserve
                  <br />a great place to land.
                </h2>
              </div>
              <p>
                Help readers find the answer, follow the details, and discover
                what comes next. This is the blog your project ships with.
              </p>
            </div>
            <div className="reader-benefits">
              {[
                [
                  "01",
                  "Get to the point",
                  "Answer-first summaries and key takeaways.",
                ],
                [
                  "02",
                  "Keep your place",
                  "Contents, reading progress, and clear hierarchy.",
                ],
                [
                  "03",
                  "Follow your curiosity",
                  "Search, topic archives, and related reading.",
                ],
              ].map(([number, title, body]) => (
                <div key={number}>
                  <span>{number}</span>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </div>
              ))}
            </div>
            <div className="publication-preview">
              <div className="publication-masthead">
                <span>
                  The journal<span className="text-primary">.</span>
                </span>
                <Link href="/blog" className="text-link">
                  Explore the live blog
                  <IconArrowUpRight className="size-4" aria-hidden />
                </Link>
              </div>
              <div className="publication-grid">
                {posts.slice(0, 3).map((post) => (
                  <PostCard post={post} key={post.slug} />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section
          id="features"
          className="page-shell marketing-section architecture-section scroll-mt-24"
        >
          <div className="architecture-copy">
            <p className="eyebrow">YOUR REPOSITORY IS THE CMS</p>
            <h2>
              Fits your stack.
              <br />
              <span className="text-muted-foreground">
                Stays out of your way.
              </span>
            </h2>
            <p>
              Content lives beside your components. Review it in a pull request.
              Deploy it with your app. Keep the entire system when your needs
              change.
            </p>
            <ul>
              {[
                "App Router and Server Components",
                "Static pages with incremental regeneration",
                "Typed content and configuration",
                "Visual editing that saves plain Markdown",
              ].map((item) => (
                <li key={item}>
                  <IconCheck className="size-4 text-primary" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/docs#architecture" className="text-link">
              Explore the architecture
              <IconArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          <div className="source-window">
            <div className="source-window-header">
              <IconFileText className="size-4" aria-hidden />
              <span>content/posts/hello-world.md</span>
              <span className="ml-auto text-xs">Markdown</span>
            </div>
            <pre aria-label="Example Markdown content">
              <code>
                <span className="code-muted">---</span>
                {"\n"}
                <span className="code-key">title:</span>
                {' "Your next great idea"\n'}
                <span className="code-key">category:</span>
                {" Engineering\n"}
                <span className="code-key">publishedAt:</span>
                {' "2026-09-05"\n'}
                <span className="code-key">tldr:</span>
                {' "Start with the useful part."\n'}
                <span className="code-muted">---</span>
                {"\n\n"}
                <span className="code-key">## A little context</span>
                {"\n\nYour words go here. The rest\nis already taken care of."}
              </code>
            </pre>
            <div className="output-list">
              <p>ONE SOURCE. CONNECTED OUTPUTS.</p>
              <div>
                {[
                  { icon: IconLayout, label: "Article", href: "/blog" },
                  {
                    icon: IconSearch,
                    label: "Search index",
                    href: "/search-index.json",
                  },
                  { icon: IconRss, label: "RSS feed", href: "/rss.xml" },
                  { icon: IconFileText, label: "llms.txt", href: "/llms.txt" },
                ].map(({ icon: Icon, label, href }) => (
                  <a href={href} key={label}>
                    <Icon className="size-4" aria-hidden />
                    {label}
                    <IconArrowUpRight
                      className="ml-auto size-3.5"
                      aria-hidden
                    />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="growth-section" aria-labelledby="growth-title">
          <div className="page-shell growth-inner">
            <div className="growth-heading">
              <p className="eyebrow">CONTENT THAT WORKS FOR YOUR BUSINESS</p>
              <h2 id="growth-title">
                Turn &quot;FREE&quot; search traffic<br />
                <span className="editorial-accent">into your next &quot;customer&quot;.</span>
              </h2>
              <ConversionExample />
            </div>
            <ol className="growth-path" aria-label="How your blog can grow your business">
              {[
                { label: "Get discovered", title: "SEO", body: "Search-ready pages. Built-in SEO guidance.", points: ["Target questions your buyers search for", "Fine-tune titles and descriptions", "Publish with structured data included"] },
                { label: "Bring people in", title: "Traffic", body: "Useful answers attract interested visitors.", points: ["Bring readers in through helpful guides", "Link related posts to keep them exploring", "Refresh useful posts to stay relevant"] },
                { label: "Grow your business", title: "Revenue", body: "Turn reader interest into signups and sales.", points: ["Connect each post to a relevant offer", "Give readers a clear next step", "Measure signups and sales from content"] },
              ].map(({ label, title, body, points }, index) => (
                <li key={title}>
                  <span className="growth-step-label"><span>0{index + 1}</span>{label}</span>
                  <h3>{title}<IconArrowRight className="growth-path-arrow" aria-hidden /></h3>
                  <p>{body}</p>
                  <ul className="growth-bullets">
                    {points.map((point) => (
                      <li key={point}><IconCheck aria-hidden /><span>{point}</span></li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
            <p className="growth-proof">
              <IconCheck className="size-4" aria-hidden />
              Metadata, sitemaps &amp; structured data included.
            </p>
          </div>
        </section>
        <section className="page-shell final-cta">
          <p className="eyebrow">START PUBLISHING</p>
          <h2>
            Build the publishing layer
            <br />
            <span className="editorial-accent">your Next.js project deserves.</span>
          </h2>
          <p className="growth-cta-copy">
            Your next post has the potential. Start with a blog. Build with SEO in place.
          </p>
          <div className="hero-actions">
            <Button size="lg" asChild className="button-ink setup-cta h-auto min-h-11 gap-3 px-5 py-3 whitespace-normal">
              <Link href="/docs#get-started">
                <GrowthButtonLabel />
                <IconArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
          </div>
          <span className="final-note">
            Use it for your blog. Keep the credit. No resale.
          </span>
        </section>
      </main>
      <BlogSiteFooter />
    </div>
  );
}
