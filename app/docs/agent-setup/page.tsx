import type { Metadata } from "next";
import Link from "next/link";
import { IconArrowLeft, IconCheck, IconCode, IconGitBranch, IconShieldLock, IconTerminal2 } from "@tabler/icons-react";
import { BlogSiteFooter } from "@/components/blog-site-footer";
import { BlogSiteHeader } from "@/components/blog-site-header";
import { Badge } from "@/components/blog-ui/badge";
import { Button } from "@/components/blog-ui/button";
import { buildPageMetadata } from "@/lib/seo";
import { productConfig } from "@/lib/product";

export const metadata: Metadata = buildPageMetadata({
  title: "Install with an AI coding agent",
  description: `A safe, auditable setup contract for integrating ${productConfig.name} into an existing repository.`,
  path: "/docs/agent-setup",
});

const discovery = [
  "Router, framework, runtime, package manager, and monorepo layout",
  "Existing routes, CMS, content, design system, auth, and middleware",
  "Image policy, CSP, base path, locales, analytics, and deployment",
  "Git state, repository instructions, validation commands, and protected files",
];

const questions = [
  "Full application, embedded blog, or content engine only?",
  "Which route should own the publication?",
  "Should existing content be migrated or remain in its current system?",
  "Which brand, authors, features, and deployment targets are required?",
  "Should production stay read-only or use an authenticated remote backend?",
];

const acceptance = [
  "All selected public and machine-readable routes work",
  "Keyboard navigation, labels, focus states, themes, and responsive layouts pass review",
  "Local production writes are blocked; login-based installs verify sessions and provider persistence",
  "Lint, types, content audit, tests, and production build pass",
  "The final diff contains no unrelated changes and has clear rollback steps",
];

export default function AgentSetupPage() {
  return (
    <div className="docs-surface flex min-h-screen flex-col bg-background text-foreground">
      <BlogSiteHeader />
      <main id="main-content" className="flex-1">
        <header className="border-b bg-muted/25">
          <div className="mx-auto max-w-shell px-4 py-16 sm:px-6 sm:py-20">
            <Button variant="ghost" size="sm" asChild className="-ml-3 mb-6"><Link href="/docs"><IconArrowLeft className="size-4" />Documentation</Link></Button>
            <Badge variant="outline" className="bg-background">AGENT-READY SETUP</Badge>
            <h1 className="text-balance mt-5 max-w-4xl font-heading text-4xl font-semibold tracking-[-0.045em] sm:text-6xl">One prompt. A repository-aware integration.</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">Choose your setup in the installation guide, then copy the prompt generated for those choices. Your agent reads the matching instructions, asks for required access, and verifies its work. No installed skill required.</p>
            <div className="mt-8"><Button asChild><Link href={productConfig.routes.setup}>Choose your setup</Link></Button></div>
          </div>
        </header>

        <div className="mx-auto max-w-shell px-4 py-16 sm:px-6 lg:py-20">
          <section className="grid gap-4 md:grid-cols-3" aria-label="Setup guarantees">
            {[
              [IconCode, "Context-aware", "The agent derives answers from the repository before asking the user."],
              [IconGitBranch, "Change-safe", "Branching, dirty-worktree checks, route mapping, and rollback are part of the contract."],
              [IconShieldLock, "Production-safe", "The Studio stays read-only until a real authentication and storage design is approved."],
            ].map(([Icon, title, body]) => {
              const ItemIcon = Icon as typeof IconCode;
              return <article key={title as string} className="rounded-2xl border bg-card p-6 shadow-sm"><ItemIcon className="size-5 text-primary" aria-hidden /><h2 className="mt-5 font-heading text-xl font-semibold">{title as string}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{body as string}</p></article>;
            })}
          </section>

          <section className="mt-12 rounded-2xl border bg-muted/25 p-6 sm:p-8">
            <h2 className="font-heading text-2xl font-semibold">The basics, on your infrastructure.</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">Local keeps blog data in your chosen repository folder. Login-based self-hosting uses email and password at /login or your chosen route, with GitHub or Supabase Storage for content and optional R2 uploads. Managed, OAuth, audit logs and advanced team features are deferred. The local runtime works today; remote authentication and storage adapters require implementation and verification during integration.</p>
            <Link href={productConfig.routes.setup} className="mt-4 inline-block text-sm font-medium text-primary underline underline-offset-4">Choose your setup and copy personalized instructions</Link>
          </section>
          <div className="mt-16 grid gap-12 lg:grid-cols-2">
            <Checklist eyebrow="THE AGENT INSPECTS" title="Evidence before questions" items={discovery} />
            <Checklist eyebrow="THE AGENT ASKS" title="Only decisions code cannot answer" items={questions} />
          </div>

          <section className="mt-20 rounded-3xl border bg-foreground p-7 text-background sm:p-10" aria-labelledby="workflow-title">
            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
              <div><IconTerminal2 className="size-6 text-primary" aria-hidden /><p className="mt-5 font-mono text-xs tracking-[0.16em] text-primary">CONTROLLED WORKFLOW</p><h2 id="workflow-title" className="mt-3 font-heading text-3xl font-semibold">Inspect, decide, integrate, verify.</h2><p className="mt-4 leading-7 text-background/70">The contract supports a full application, an existing App Router product, a hybrid or Pages Router migration, and a content-engine-only installation.</p></div>
              <ol className="grid gap-3">
                {["Record the baseline and repository constraints", "Map route ownership and resolve conflicts", "Merge only the selected content and product surfaces", "Configure identity, metadata, images, and deployment", "Test the complete acceptance matrix and review the diff"].map((step, index) => <li key={step} className="flex gap-4 rounded-xl border border-background/15 bg-background/5 p-4 text-sm"><span className="font-mono text-primary">0{index + 1}</span><span>{step}</span></li>)}
              </ol>
            </div>
          </section>

          <section className="mt-20 grid gap-8 lg:grid-cols-[0.75fr_1.25fr]" aria-labelledby="acceptance-title">
            <div><p className="font-mono text-xs tracking-[0.16em] text-primary">DEFINITION OF DONE</p><h2 id="acceptance-title" className="mt-3 font-heading text-3xl font-semibold">The agent must prove the result.</h2><p className="mt-4 leading-7 text-muted-foreground">A successful install is not just a clean build. The public routes, read-only boundary, responsive UI, content outputs, and preservation of the host application all need evidence.</p></div>
            <ul className="rounded-2xl border bg-card p-6 shadow-sm">{acceptance.map((item) => <li key={item} className="flex gap-3 border-b py-4 first:pt-0 last:border-0 last:pb-0"><IconCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden /><span className="text-sm leading-6">{item}</span></li>)}</ul>
          </section>

        </div>
      </main>
      <BlogSiteFooter />
    </div>
  );
}

function Checklist({ eyebrow, title, items }: { eyebrow: string; title: string; items: string[] }) {
  return <section><p className="font-mono text-xs tracking-[0.16em] text-primary">{eyebrow}</p><h2 className="mt-3 font-heading text-2xl font-semibold">{title}</h2><ul className="mt-5 space-y-3">{items.map((item) => <li key={item} className="flex gap-3 rounded-xl border bg-card p-4 text-sm leading-6"><IconCheck className="mt-1 size-4 shrink-0 text-primary" aria-hidden />{item}</li>)}</ul></section>;
}
