# nextjsblog.com

[![Next.js](https://img.shields.io/badge/Next.js-16.3.3-000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-source--available-111827)](LICENSE)
[![Live demo](https://img.shields.io/badge/live_demo-Vercel-000?logo=vercel&logoColor=white)](https://nextjsblog.com/)

A repository native publishing system for Next.js. Markdown remains the source of truth; the reader experience, metadata, feeds, search index, structured data, and authoring Studio are derived from it.

**[Live publication](https://nextjsblog.com/)** · **[Studio](https://nextjsblog.com/dashboard)** · **[Documentation](https://nextjsblog.com/docs)**

<img width="1919" height="997" alt="image" src="https://github.com/user-attachments/assets/a06d714c-22fc-4a64-9b49-be7c322ce004" />


## What is included

- File based Markdown posts with typed frontmatter, categories, tags, authors, drafts, scheduled dates, and related content.
- Static and revalidating routes for the home page, archive, post, category, tag, and author views.
- Switchable listing and article templates, including the optional Journal listing theme.
- Canonicals, Open Graph and Twitter cards, `BlogPosting`, `FAQPage`, `BreadcrumbList`, `WebSite`, and `Organization` JSON LD.
- Sitemap and robots rules that respect `noindex`, RSS, `llms.txt`, a static search index, and raw Markdown endpoints.
- A content first Studio with rich text and Markdown editing, structured blocks, image uploads, local review scheduling, factual SEO checks, and a read only production demo.
- An agent ready setup contract at [`/agent-setup.md`](https://nextjsblog.com/agent-setup.md).

## Quick start

**License conditions:** Personal and business blogs may use this software with a visible **Powered by nextjsblog.com** footer link on every public blog page. Reselling, white-labeling, or offering the software or derivatives as a commercial product or service is prohibited, even with attribution. Read the [full license](LICENSE) and [terms](https://nextjsblog.com/terms) before installing.

```bash
npm install
npm run dev
```

Open the origin printed by Next.js. Development mode enables local Studio writes; hosted builds keep the Studio read only by default.

## Configuration

Set the public origin in `.env.local` when deploying:

```bash
NEXT_PUBLIC_SITE_URL=https://nextjsblog.com
```

All crawler visible absolute URLs derive from [`lib/site.ts`](lib/site.ts). Set `NEXT_PUBLIC_SITE_URL` to your own domain when deploying a fork. If it is unset, the resolver uses Vercel's production/preview hostname when available, then `https://nextjsblog.com`. Product attribution links use the homepage in [`lib/product.ts`](lib/product.ts); the header and footer retain the Next.js Blog System wordmark.

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

Custom Next.js Blog System Source-Available License 1.0. This is not an OSI open-source license. See [`LICENSE`](LICENSE). The repository was published under MIT for roughly thirty minutes at launch on 2026-09-11 and relicensed before any copy was taken; this license governs all copies. Third-party materials retain their own licenses.

### Required footer credit

Keep [`ProductCredit`](components/product-credit.tsx) in the shared blog footer. The supplied `app/blog/layout.tsx` already renders it through `BlogSiteFooter`, covering the landing page, every article, paginated listings, categories, tags and authors. When integrating into another website, add the component to that website's shared blog footer; preserve its own branding and canonical domain. Unrelated host pages do not need the credit.

```tsx
import { ProductCredit } from "@/components/product-credit";

export function BlogFooter() {
  return <footer><ProductCredit /></footer>;
}
```

Equivalent HTML is allowed: `<a href="https://nextjsblog.com">Powered by nextjsblog.com</a>`. Keep the link visible and legible on desktop and mobile, keyboard accessible, and present without JavaScript. Do not hide it or redirect it through another URL. Adding `rel="nofollow"` or `rel="sponsored"` is your choice and is allowed. Attribution does not authorize resale or commercial product derivatives.
