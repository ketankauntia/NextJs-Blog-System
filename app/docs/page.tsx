import type { Metadata } from "next";
import Link from "next/link";
import {
  IconArrowRight,
  IconExternalLink,
  IconShieldLock,
  IconSparkles,
} from "@tabler/icons-react";
import { BlogSiteFooter } from "@/components/blog-site-footer";
import { BlogSiteHeader } from "@/components/blog-site-header";
import { Button } from "@/components/blog-ui/button";
import { SetupGuide } from "@/components/docs/setup-guide";
import { buildPageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { productConfig } from "@/lib/product";

export const metadata: Metadata = buildPageMetadata({
  title: "Documentation",
  description:
    `Install, configure, write, and deploy the repository-native ${productConfig.name}.`,
  path: "/docs",
});

const generatedRoutes = [
  ["/blog", "Paginated article archive"],
  ["/blog/post/[slug]", "Static article and generated social card"],
  ["/blog/category/[slug]", "Paginated category archive"],
  ["/blog/tag/[slug]", "Tag archive"],
  ["/blog/author/[slug]", "Author profile and archive"],
  ["/rss.xml", "Full-content RSS feed"],
  ["/llms.txt", "Machine-readable article index"],
  ["/search-index.json", "Client search document"],
  ["/docs.md", "Documentation in copyable Markdown"],
  ["/agent-setup.md", "Machine-readable setup contract"],
] as const;

export default function DocsPage() {
  return (
    <div className="docs-surface flex min-h-screen flex-col bg-background text-foreground">
      <BlogSiteHeader />
      <main id="main-content" className="flex-1">
        <header className="border-b">
          <div className="mx-auto max-w-shell px-5 py-12 sm:px-6 sm:py-16">
            <p className="eyebrow">DOCUMENTATION</p>
            <h1 className="text-balance mt-5 max-w-3xl font-heading text-4xl font-semibold tracking-[-0.045em] sm:text-6xl">
              Set up your blog, your way.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
              Choose where you write and where your content lives. Let an AI agent handle the setup, or follow a guide tailored to the same choices.
            </p>

          </div>
        </header>

        <div className="mx-auto grid max-w-shell gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[13rem_1fr] lg:py-20">
          <aside className="hidden lg:block">
            <nav aria-label="Documentation sections" className="sticky top-24 text-sm">
              <p className="font-semibold">On this page</p>
              <ul className="mt-4 space-y-3 border-l pl-4 text-muted-foreground">
                <li><a href="#get-started" className="hover:text-foreground">Choose your setup</a></li>
                <li><a href="#agent-setup" className="hover:text-foreground">Set up with AI</a></li>
                <li><a href="#manual-setup" className="hover:text-foreground">Set up manually</a></li>
                <li><a href="#architecture" className="hover:text-foreground">Architecture</a></li>
                <li><a href="#studio" className="hover:text-foreground">Studio safety</a></li>

                <li><a href="#routes" className="hover:text-foreground">Generated routes</a></li>
              </ul>
            </nav>
          </aside>

          <div className="min-w-0 max-w-4xl">
            <SetupGuide />

            <section id="architecture" className="mt-20 scroll-mt-24 border-t pt-16" aria-labelledby="architecture-title">
              <p className="font-mono text-xs tracking-[0.16em] text-primary">ARCHITECTURE</p>
              <h2 id="architecture-title" className="mt-3 font-heading text-3xl font-semibold tracking-tight">One typed source, many deterministic outputs.</h2>
              <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">
                The parser turns frontmatter and Markdown into typed sections. Server Components use that model directly, while route handlers and metadata functions produce feeds, indexes, schema, and social assets. Public pages remain static. The Studio writes files locally and becomes a safe read-only product tour in production.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {[
                  ["Content", "Markdown, frontmatter, authors, and settings live in the repository."],
                  ["Build", "Next.js generates routes, metadata, images, feeds, and structured data."],
                  ["Delivery", "Static HTML reaches readers first, with client code loaded only for interaction."],
                ].map(([title, body]) => (
                  <article key={title} className="rounded-xl border bg-card p-5"><h3 className="font-heading font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p></article>
                ))}
              </div>
            </section>

            <section id="studio" className="mt-20 scroll-mt-24 border-t pt-16" aria-labelledby="studio-title">
              <p className="font-mono text-xs tracking-[0.16em] text-primary">STUDIO SAFETY</p>
              <h2 id="studio-title" className="mt-3 font-heading text-3xl font-semibold tracking-tight">Visible in production. Writable only in development.</h2>
              <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">
                Visitors can inspect the dashboard, filter content, open the editor, adjust previews, and understand the workflow. Their changes remain in their browser. Post saves, settings saves, and file uploads are rejected by the server outside local development.
              </p>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                If a downstream repository contains private drafts, set <code className="rounded bg-muted px-1.5 py-0.5 text-foreground">STUDIO_DEMO_ENABLED=false</code> before building. Production Studio pages will return 404 while local authoring remains available.
              </p>
              <div className="mt-7 grid gap-4 sm:grid-cols-2">
                <article className="rounded-2xl border bg-card p-5">
                  <IconSparkles className="size-5 text-primary" aria-hidden />
                  <h3 className="mt-4 font-heading text-lg font-semibold">Public product tour</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">Every important workflow remains discoverable, including the editor, SEO checks, structured content blocks, themes, and typography.</p>
                  <Button variant="outline" size="sm" asChild className="mt-5"><Link href="/dashboard">Explore Studio<IconArrowRight className="size-4" /></Link></Button>
                </article>
                <article className="rounded-2xl border bg-card p-5">
                  <IconShieldLock className="size-5 text-primary" aria-hidden />
                  <h3 className="mt-4 font-heading text-lg font-semibold">Server-enforced read-only mode</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">Disabled buttons improve clarity, while HTTP 403 responses at every mutation endpoint provide the actual production boundary.</p>
                </article>
              </div>
            </section>

<section id="routes" className="mt-20 scroll-mt-24 border-t pt-16" aria-labelledby="routes-title">
              <p className="font-mono text-xs tracking-[0.16em] text-primary">PUBLIC OUTPUT</p>
              <h2 id="routes-title" className="mt-3 font-heading text-3xl font-semibold tracking-tight">Routes you can inspect right now.</h2>
              <div className="mt-7 overflow-hidden rounded-2xl border bg-card">
                <ul className="divide-y">
                  {generatedRoutes.map(([route, description]) => (
                    <li key={route} className="grid gap-1 px-5 py-4 sm:grid-cols-[14rem_1fr] sm:gap-4">
                      <code className="text-xs font-medium text-primary">{route}</code>
                      <span className="text-sm text-muted-foreground">{description}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section className="mt-16 rounded-2xl bg-muted/55 p-6 sm:p-8">
              <h2 className="font-heading text-2xl font-semibold tracking-tight">Go deeper</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">The repository README covers configuration and commands. The content contract documents every supported block and frontmatter field.</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button variant="outline" asChild><a href={`${siteConfig.social.github}#readme`} target="_blank" rel="noreferrer">Read the README<IconExternalLink className="size-4" aria-hidden /></a></Button>
                <Button variant="outline" asChild><a href={`${siteConfig.social.github}/blob/main/docs/content-format.md`} target="_blank" rel="noreferrer">Content format<IconExternalLink className="size-4" aria-hidden /></a></Button>
                <Button variant="ghost" asChild><Link href="/blog">Explore the live blog</Link></Button>
              </div>
            </section>
          </div>
        </div>
      </main>
      <BlogSiteFooter />
    </div>
  );
}
