# Next.js Blog System

[![Next.js](https://img.shields.io/badge/Next.js-16.3.3-000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-111827)](LICENSE)
[![Live demo](https://img.shields.io/badge/live_demo-Vercel-000?logo=vercel&logoColor=white)](https://get-nextjs-blogs.vercel.app/)

A repository native publishing system for Next.js. Markdown remains the source of truth; the reader experience, metadata, feeds, search index, structured data, and authoring Studio are derived from it.

**[Live publication](https://get-nextjs-blogs.vercel.app/)** · **[Studio](https://get-nextjs-blogs.vercel.app/dashboard)** · **[Documentation](https://get-nextjs-blogs.vercel.app/docs)**

## What is included

- File based Markdown posts with typed frontmatter, categories, tags, authors, drafts, scheduled dates, and related content.
- Static and revalidating routes for the home page, archive, post, category, tag, and author views.
- Switchable listing and article templates, including the optional Journal listing theme.
- Canonicals, Open Graph and Twitter cards, `BlogPosting`, `FAQPage`, `BreadcrumbList`, `WebSite`, and `Organization` JSON LD.
- Sitemap and robots rules that respect `noindex`, RSS, `llms.txt`, a static search index, and raw Markdown endpoints.
- A content first Studio with rich text and Markdown editing, structured blocks, image uploads, local review scheduling, factual SEO checks, and a read only production demo.
- An agent ready setup contract at [`/agent-setup.md`](https://get-nextjs-blogs.vercel.app/agent-setup.md).

## Quick start

```bash
npm install
npm run dev
```

Open the origin printed by Next.js. Development mode enables local Studio writes; hosted builds keep the Studio read only by default.

## Configuration

Set the public origin in `.env.local` when deploying:

```bash
NEXT_PUBLIC_SITE_URL=https://get-nextjs-blogs.vercel.app
```

All crawler visible absolute URLs derive from [`lib/site.ts`](lib/site.ts). The deployed Vercel domain is the fallback when no public origin is supplied.

Authors live in [`lib/blog/authors.ts`](lib/blog/authors.ts). Optional reader surfaces are controlled by [`lib/features.ts`](lib/features.ts). To hide the Studio in a production build, set `STUDIO_DEMO_ENABLED=false`.

## Write a post

Create `content/posts/my-post.md`:

```markdown
---
title: "How the thing works"
description: "A concise summary of the page for readers and search previews."
category: Engineering
tags: [example]
publishedAt: "2026-08-26"
author: ketan
tldr: "The answer, stated first."
keyTakeaways:
  - "One durable point per line."
faqs:
  - q: "A question readers ask?"
    a: "A direct answer."
---

## First section

Body text. See [`docs/content-format.md`](docs/content-format.md) for every supported block.
```

Run `npm run audit:content` to validate every post's metadata and completeness.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server and local Studio |
| `npm run build` | Create the production build |
| `npm run lint` | Run ESLint |
| `npm run type-check` | Run TypeScript without emitting files |
| `npm run audit:content` | Validate post metadata |
| `npm run validate` | Run lint, type checks, content audit, and build |

## Project map

```text
app/             Reader, Studio, API, sitemap, feeds, and metadata routes
components/      Reader templates, UI primitives, dashboard, and editor
content/posts/   Markdown source files
lib/blog/        Parser, loader, types, authors, and search
lib/editor/      Editorial checks and internal link suggestions
lib/site.ts      Canonical public origin and brand configuration
docs/            Content, publishing, and local development contracts
```

## Deployment boundary

The public Studio is a product tour. Editor write endpoints reject hosted requests before touching the filesystem. A production CMS needs authentication, authorization, durable storage, validation, rate limiting, and audit logging; those concerns are intentionally outside this repository's file based runtime.

## License

MIT. See [`LICENSE`](LICENSE).
