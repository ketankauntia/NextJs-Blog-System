import type { Metadata } from "next";
import Link from "next/link";
import {
  IconArrowRight,
  IconArrowUpRight,
  IconBrandGithub,
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
import { PostCard } from "@/components/blog/post-card";
import { getAllPosts } from "@/lib/blog/content";
import { buildPageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { isStudioVisible } from "@/lib/studio-access";

export const revalidate = 3600;
export const metadata: Metadata = buildPageMetadata({
  title: "A publishing system, native to Next.js",
  description:
    "Your content, in your codebase. A complete open-source Next.js publishing system with a visual Studio, thoughtful reader experience, and Markdown you own.",
  path: "/",
});

const workflow = [
  {
    icon: IconFileText,
    title: "A place to do your best writing.",
    body: "Start in the visual Studio or your favorite editor. Drafts, images, and structured content all come home to your repository.",
    detail: "Rich text. Plain Markdown. Your choice.",
  },
  {
    icon: IconLayout,
    title: "A publication with a point of view.",
    body: "Thoughtful article layouts, clear summaries, and a reading experience that makes the long version worth staying for.",
    detail: "Designed for the person on the other side.",
  },
  {
    icon: IconGitBranch,
    title: "One file. Every publishing surface.",
    body: "Your article, search index, social card, structured data, and RSS entry stay connected to the same source.",
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
                <span className="status-dot" aria-hidden /> Open source. Yours
                from the first commit.
                <IconArrowUpRight className="size-3.5" aria-hidden />
              </a>
              <h1>
                Great writing.
                <br />
                <span className="editorial-accent">Native to Next.js.</span>
              </h1>
              <p>
                A complete publishing system for your Next.js app.
                <br className="hidden sm:block" /> A visual Studio, a beautiful
                blog, and Markdown you own.
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
                MIT licensed <span aria-hidden>·</span> No content database{" "}
                <span aria-hidden>·</span> Built for your codebase
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
                showStudio={showStudio}
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
          id="product"
          className="page-shell marketing-section scroll-mt-24"
        >
          <div className="section-intro">
            <p className="eyebrow">THE WHOLE WORKFLOW</p>
            <h2>
              Less assembling.
              <br />
              <span className="text-muted-foreground">More publishing.</span>
            </h2>
            <p>
              You came to share an idea. The content infrastructure should
              already be there.
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
                <Link href="/blog">
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

        <section className="ownership-section">
          <div className="page-shell ownership-inner">
            <div className="ownership-label">
              <IconBrandGithub className="size-6" aria-hidden />
              <span>OPEN SOURCE, BY DESIGN</span>
            </div>
            <h2>
              Your content.
              <br />
              Your code. <span className="editorial-accent">Your call.</span>
            </h2>
            <div>
              <p>
                A complete starting point for developers who prefer content in
                Git. Fork it, make it yours, and build on a system you can
                inspect from end to end.
              </p>
              <p className="ownership-note">
                Need a shared cloud newsroom or real-time collaboration? Those
                workflows are outside this project’s scope.
              </p>
              <a
                href={siteConfig.social.github}
                target="_blank"
                rel="noreferrer"
                className="text-link"
              >
                Explore the source
                <IconArrowUpRight className="size-4" aria-hidden />
              </a>
            </div>
          </div>
        </section>

        <section className="page-shell final-cta">
          <p className="eyebrow">YOUR NEXT CHAPTER</p>
          <h2>
            Make room for
            <br />
            <span className="editorial-accent">something worth reading.</span>
          </h2>
          <p>The publishing system is ready. Bring your point of view.</p>
          <div className="hero-actions">
            <Button size="lg" asChild className="button-ink h-11 gap-3 px-5">
              <Link href="/docs#get-started">
                Build your publication
                <IconArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
            <Link href="/docs/agent-setup" className="text-link">
              Set up with your AI agent
              <IconArrowUpRight className="size-4" aria-hidden />
            </Link>
          </div>
          <span className="final-note">
            Free to use. Free to change. MIT licensed.
          </span>
        </section>
      </main>
      <BlogSiteFooter />
    </div>
  );
}
