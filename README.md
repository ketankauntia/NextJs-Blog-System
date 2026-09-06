# Next.js Blog System

A file-based blog system for Next.js. Posts are markdown files in your repository; the structure, table of contents, structured data, feeds and social cards are all derived from them.

Built by [Ketan](https://x.com/kauntiaketan). MIT licensed.

```bash
npm install
npm run dev
```

Open [localhost:3000](http://localhost:3000) for the site and [localhost:3000/dashboard](http://localhost:3000/dashboard) for the authoring studio.

## What you get

**Content pipeline.** Markdown with YAML frontmatter, parsed into typed blocks so the article body, table of contents, search index, RSS content and JSON-LD all derive from one source rather than drifting apart. Drafts, scheduled publishing, categories, tags, authors and related posts are built in.

**Routes.** Home, paginated archive, post, category (paginated), tag and author pages. All statically generated, all revalidating hourly so a scheduled post appears without a rebuild.

**Templates.** Three listing layouts and three post layouts, switchable from settings without touching a component.

**SEO, done properly.** Self-referencing canonicals, length-checked titles and descriptions, complete Open Graph and Twitter cards, `BlogPosting` + `FAQPage` + `BreadcrumbList` + `WebSite` + `Organization` structured data, a sitemap that respects `noindex` and lifts cornerstone content, and `robots.txt`.

**Machine-readable output.** RSS with full content, an `llms.txt` index, a static search index, and every post available as raw markdown at `/blog/post/<slug>.md`. Social cards are generated at build time from the post title, so there is no image asset to keep in sync.

**Authoring studio.** A content-first rich-text editor with live SEO and readability scoring, internal-link suggestions, structured blocks, a SERP preview and a template previewer. The Studio is a public read-only product tour in production. When run locally in development, it writes the same Markdown files used by the build.

**Agent-ready setup.** Share `/agent-setup.md` with a coding agent for a repository-aware integration contract. It covers discovery, required questions, route conflicts, monorepos, existing CMS installations, production safety, accessibility, validation, and rollback.

## Configuration

Everything brand-related lives in [`lib/site.ts`](lib/site.ts). Set the name, description, social links and default social card there.

Set the origin per environment:

```bash
# .env.local
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

Every absolute URL, including canonicals, `og:url`, sitemap entries, RSS links, and JSON-LD identifiers, derives from that one value. A trailing slash, a stray path, or a missing scheme is normalised away, so `example.com` works as well as `https://example.com/`.

On Vercel the variable is optional: if it is unset **or empty**, the build falls back to `NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL`, then `NEXT_PUBLIC_VERCEL_URL`, then `http://localhost:3000`. Deployments therefore work with no configuration, but set a real domain before launch or every canonical will point at `*.vercel.app`.

Authors are code in [`lib/blog/authors.ts`](lib/blog/authors.ts). Optional surfaces, including author pages, tag pages, the newsletter block, share buttons, and the "ask AI" menu, are toggled in [`lib/features.ts`](lib/features.ts).

## Writing a post

Create `content/posts/my-post.md`:

```markdown
---
title: "How the thing works"
description: "A description between 115 and 158 characters, which is the window search results will show without truncating."
category: Engineering
tags: [example]
publishedAt: "2026-08-26"
author: ketan
tldr: "The answer, stated first, in the words you would want an LLM to lift."
keyTakeaways:
  - "One durable point per line."
faqs:
  - q: "A question people actually ask?"
    a: "A direct answer."
---

## First section

Body text. See docs/content-format.md for every block the parser supports.
```

Then `npm run audit:content` to check it against the length and completeness rules.

The full contract is in [docs/content-format.md](docs/content-format.md).

## Commands

| Command | Does |
| --- | --- |
| `npm run dev` | Development server, including the authoring studio |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run type-check` | `tsc --noEmit` |
| `npm run audit:content` | Check every post's metadata; exits non-zero on failures |
| `npm run validate` | All of the above, in order |

## Documentation and AI setup

The website includes a complete guide at `/docs`, a Markdown copy at `/docs.md`, and a guided AI installation flow at `/docs/agent-setup`. The AI contract itself is available at `/agent-setup.md` so any coding agent with web access can read it directly.

The documentation interface includes Copy as Markdown, Share to AI, raw Markdown, and a copyable setup prompt that automatically uses the current deployment origin.

## Layout

```
app/
  blog/              archive, post, category, tag and author routes
  dashboard/         public demo, writable only in development
  api/editor/        studio write endpoints (development only)
  api/markdown/      raw markdown, served at /blog/post/<slug>.md
  rss.xml/  llms.txt/  search-index.json/
  sitemap.ts  robots.ts  manifest.ts  opengraph-image.tsx
components/
  blog/              article, listing and structured-data components
  blog-ui/           primitives
  editor/  dashboard/   studio interface
lib/
  blog/              parser, loader, types, authors, search
  editor/            SEO checks and link suggestions
  site.ts            everything you edit to make this yours
content/
  posts/*.md         the blog
  settings.json      active templates
```

## Notes

The Studio routes are visible in production so evaluators can inspect the product. All editor POST endpoints reject requests outside development before parsing request bodies or touching the filesystem. UI controls are also disabled where a hosted action would require a write. This is a demo boundary, not an authenticated production CMS. If the repository contains private drafts, set `STUDIO_DEMO_ENABLED=false` to remove Studio navigation and return 404 for all Studio pages in production. If you add hosted editing, implement authentication, authorization, durable storage, validation, rate limiting, and audit logging instead of removing only the environment guard.

Image optimisation is enabled with no remote patterns configured. Add hosts to `next.config.ts` if you serve covers from a CDN.

## License

MIT. See [LICENSE](LICENSE).
