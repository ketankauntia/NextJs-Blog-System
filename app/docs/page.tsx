import type { Metadata } from "next";
import Link from "next/link";
import {
  IconArrowRight,
  IconCheck,
  IconCode,
  IconExternalLink,
  IconFileText,
  IconRocket,
  IconSettings,
  IconShieldLock,
  IconSparkles,
} from "@tabler/icons-react";
import { BlogSiteFooter } from "@/components/blog-site-footer";
import { BlogSiteHeader } from "@/components/blog-site-header";
import { Button } from "@/components/blog-ui/button";
import { AgentSetupActions } from "@/components/docs/agent-setup-actions";
import { buildPageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { productConfig } from "@/lib/product";

export const metadata: Metadata = buildPageMetadata({
  title: "Documentation",
  description:
    `Install, configure, write, and deploy the repository-native ${productConfig.name}.`,
  path: "/docs",
});

const steps = [
  {
    id: "clone-and-run",
    number: "01",
    icon: IconCode,
    title: "Clone and run",
    body: "Start with the complete application, including the public blog, local studio, content pipeline, and production metadata.",
    code: `git clone ${productConfig.repositoryUrl}.git\ncd NextJs-Blog-System\nnpm install\nnpm run dev`,
  },
  {
    id: "configure",
    number: "02",
    icon: IconSettings,
    title: "Make it yours",
    body: "Edit one configuration file for the name, description, canonical origin, organization, and social links. Template and typography choices live in content settings.",
    code: `// lib/site.ts\nexport const siteConfig = {\n  name: "Your publication",\n  shortName: "Journal",\n  description: "What you publish and for whom.",\n  social: { github: "...", x: "..." },\n}`,
  },
  {
    id: "write",
    number: "03",
    icon: IconFileText,
    title: "Write a post",
    body: "Add a markdown file directly or open the local studio at /dashboard. Both paths produce the same portable content file.",
    code: `---\ntitle: "How the thing works"\ndescription: "A useful search-ready summary."\ncategory: Engineering\npublishedAt: "2026-09-03"\nauthor: ketan\ntldr: "The answer, stated first."\n---\n\n## First section\n\nWrite the article here.`,
  },
  {
    id: "ship",
    number: "04",
    icon: IconRocket,
    title: "Validate and ship",
    body: "Run the full validation suite, push the repository, and deploy to Vercel. The production URL is detected automatically, but a custom canonical origin is recommended before launch.",
    code: `npm run validate\n\n# Recommended production variable\nNEXT_PUBLIC_SITE_URL=https://your-domain.com`,
  },
] as const;

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
              Your first chapter starts here.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
              Get the app running, make it your own, and publish your first post. Everything you need, from the first clone to your own domain.
            </p>

          </div>
        </header>

        <div className="mx-auto grid max-w-shell gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[13rem_1fr] lg:py-20">
          <aside className="hidden lg:block">
            <nav aria-label="Documentation sections" className="sticky top-24 text-sm">
              <p className="font-semibold">On this page</p>
              <ul className="mt-4 space-y-3 border-l pl-4 text-muted-foreground">
                <li><a href="#agent-setup" className="hover:text-foreground">Set up with AI</a></li>
                <li><a href="#manual-setup" className="hover:text-foreground">Set up manually</a></li>
                {steps.map((step) => <li key={step.id}><a href={`#${step.id}`} className="hover:text-foreground">{step.title}</a></li>)}
                <li><a href="#architecture" className="hover:text-foreground">Architecture</a></li>
                <li><a href="#studio" className="hover:text-foreground">Studio safety</a></li>

                <li><a href="#routes" className="hover:text-foreground">Generated routes</a></li>
              </ul>
            </nav>
          </aside>

          <div id="get-started" className="min-w-0 max-w-4xl scroll-mt-24">
            <section id="agent-setup" className="scroll-mt-24 rounded-2xl border border-primary/25 bg-primary/5 p-6 sm:p-8" aria-labelledby="agent-setup-title">
              <p className="font-mono text-xs tracking-[0.16em] text-primary">AUTOMATIC SETUP</p>
              <h2 id="agent-setup-title" className="mt-3 font-heading text-2xl font-semibold tracking-tight sm:text-3xl">Set up with an AI agent</h2>
              <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">Copy the prompt into your coding agent. It reads the setup guide, inspects your project, and handles installation and checks. If it needs access or runs into a decision, it asks you.</p>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">For connected providers, sign in and give the agent the go-ahead when prompted.</p>
              <div className="mt-6"><AgentSetupActions /></div>
            </section>

            <div id="manual-setup" className="mb-6 mt-14 scroll-mt-24 border-t pt-10">
              <p className="font-mono text-xs tracking-[0.16em] text-muted-foreground">MANUAL SETUP</p>
              <h2 className="mt-3 font-heading text-2xl font-semibold tracking-tight">Prefer to do it yourself?</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Follow the steps below to install, configure and publish.</p>
            </div>
            <section aria-labelledby="before-title" className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
              <h2 id="before-title" className="font-heading text-2xl font-semibold tracking-tight">Before you begin</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {["Node.js 20.9 or newer", "A Next.js project or fresh clone", "A Git-based deployment workflow"].map((item) => (
                  <p key={item} className="flex gap-2 text-sm text-muted-foreground"><IconCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />{item}</p>
                ))}
              </div>
            </section>

            <div className="mt-14 space-y-16">
              {steps.map(({ id, number, icon: Icon, title, body, code }) => (
                <section key={id} id={id} className="scroll-mt-24" aria-labelledby={`${id}-title`}>
                  <div className="flex items-start gap-4">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="size-5" aria-hidden /></span>
                    <div>
                      <p className="font-mono text-[0.68rem] tracking-[0.16em] text-primary">STEP {number}</p>
                      <h2 id={`${id}-title`} className="mt-1 font-heading text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
                      <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">{body}</p>
                    </div>
                  </div>
                  <pre className="mt-6 overflow-x-auto rounded-2xl border bg-foreground p-5 text-sm leading-6 text-background shadow-sm"><code>{code}</code></pre>
                </section>
              ))}
            </div>

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
