import { productConfig } from "@/lib/product";
import { agentCloudContract } from "@/lib/agent-cloud-contract";

export const docsMarkdown = `# ${productConfig.name}

A repository-native publishing system built for the Next.js App Router. Content remains portable Markdown in Git while the application generates a polished reader experience, metadata, discovery routes, feeds, social images, and a local authoring Studio.

## What you get

- Static article, category, tag, author, and paginated archive routes
- Typed frontmatter and deterministic Markdown parsing
- SEO metadata, canonical URLs, JSON-LD, sitemap, robots, and social cards
- RSS, search-index.json, llms.txt, and raw article Markdown
- Reader tools including search, table of contents, reading progress, sharing, and Ask AI
- A visual Studio that writes back to repository files during local development
- A public read-only Studio demo in production

## Requirements

- Node.js 20.9 or newer
- npm, pnpm, yarn, or Bun
- Next.js App Router when integrating into an existing application
- A Git branch or clean rollback point before integration

## Quick start

\`\`\`bash
git clone ${productConfig.repositoryUrl}.git
cd NextJs-Blog-System
npm install
npm run dev
\`\`\`

Open \`http://localhost:3000\` for the product site, \`/blog\` for the publication, and \`/dashboard\` for the Studio.

## Configure the publication

Update \`lib/site.ts\` with the publication name, short name, description, canonical URL, organization, and social accounts. Set the production origin explicitly:

\`\`\`bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com
\`\`\`

Review \`content/settings.json\` for the selected blog template, article template, and font pairing. Add author records in \`lib/blog/authors.ts\` and place public assets below \`public/\`.

## Write content

Each post is a Markdown file in \`content/posts\`. The Studio and direct file editing produce the same format.

\`\`\`markdown
---
title: "How the thing works"
description: "A specific summary for readers and search engines."
category: Engineering
tags: [Next.js, Publishing]
publishedAt: "2026-09-03"
author: your-author-slug
keyphrase: "nextjs publishing system"
tldr: "The direct answer appears first."
keyTakeaways:
  - "One useful conclusion."
draft: false
---

## First section

Write the article here.
\`\`\`

Optional fields include \`updatedAt\`, \`featured\`, \`cornerstone\`, \`noindex\`, \`canonical\`, \`coverTone\`, \`coverImage\`, \`coverAlt\`, \`ogImage\`, and \`faqs\`.

## Studio behavior

The deployed \`/dashboard\` is intentionally public and read-only so evaluators can explore the product. The UI permits temporary browser-only edits and previews. All filesystem write endpoints return HTTP 403 outside development before reading request bodies or writing files. Saving settings, uploading images, and saving posts work only under \`npm run dev\`.

The public Studio and public content routes exclude drafts and future-dated posts. Local Studio retains authoring access to both. Set \`STUDIO_DEMO_ENABLED=false\` to remove Studio navigation and make every Studio page return 404 in production. Drafts committed to a public Git repository remain visible through Git, and files placed under public/ remain directly accessible; application filtering does not make those files private.

For a private production CMS, replace the development-only policy with authentication, per-resource authorization, persistent storage, input validation, rate limiting, audit logging, and CSRF-aware mutation handling. Do not enable production writes by changing only the environment check.

## Public routes

| Route | Purpose |
| --- | --- |
| \`/blog\` | Paginated article archive |
| \`/blog/post/[slug]\` | Static article page |
| \`/blog/category/[slug]\` | Paginated category archive |
| \`/blog/tag/[slug]\` | Tag archive |
| \`/blog/author/[slug]\` | Author archive |
| \`/rss.xml\` | Full-content RSS feed |
| \`/llms.txt\` | Machine-readable content index |
| \`/search-index.json\` | Client search document |
| \`/docs.md\` | This documentation as Markdown |
| \`/agent-setup.md\` | Complete AI-agent installation contract |

## Validation and deployment

\`\`\`bash
npm run validate
\`\`\`

The command runs ESLint, TypeScript, the content audit, and a production build. Fix all failures before deployment. On Vercel, configure \`NEXT_PUBLIC_SITE_URL\`, verify the canonical host, and confirm that the Dashboard is visible while all editor POST routes return 403.

## Integration into an existing app

An integration must first inspect the target repository. Confirm the router, Next.js version, package manager, Tailwind version, source-directory layout, aliases, existing content or CMS, route conflicts, design tokens, image policy, base path, deployment target, and desired feature scope. Preserve user changes and merge components deliberately instead of copying the repository over the target.

Use the guided contract at \`/agent-setup.md\` when asking an AI coding agent to perform the integration.

## Troubleshooting

- If canonical URLs are wrong, set \`NEXT_PUBLIC_SITE_URL\` and rebuild.
- If an image fails, confirm its public path, alt text, and remote-image policy.
- If a post is absent, check \`draft\`, \`publishedAt\`, slug format, and the content audit output.
- If the Studio cannot save locally, confirm the app is running with \`next dev\`, not \`next start\`.
- If routes collide in an existing app, choose a different blog base path before copying files.
- If styles differ, map tokens into the existing design system before importing global CSS.

## License

MIT.
`;

export const agentSetupMarkdown = `# AI Agent Setup Contract for ${productConfig.name}

## Objective

Integrate ${productConfig.name} into the user's repository safely, preserve existing work, and deliver a validated publishing experience that matches the target product. Do not overwrite the target application wholesale.

Source repository: ${productConfig.repositoryUrl}
Human documentation: /docs
Machine-readable documentation: /docs.md

## First: account access and confirmation

Ask the user to sign in to the provider accounts their selection needs and explicitly confirm that you may proceed. Local writing requires no provider. Login-based GitHub needs GitHub and Supabase Auth; Supabase Storage needs Supabase; optional R2 uploads also need Cloudflare. Do not access private provider resources or provision anything before the go-ahead. Inspect local files while waiting. After confirmation, complete authorized work autonomously and only ask about genuine blockers or new decisions. Never ask for secrets in chat.

## Operating rules

1. Inspect before changing anything. Read repository instructions, package manifests, lockfiles, Next.js configuration, routing layout, styling setup, Git status, and existing content architecture.
2. Create or use a user-approved feature branch. Never discard uncommitted changes.
3. Treat existing UI, content, routes, analytics, authentication, and deployment configuration as user-owned.
4. Ask only questions that cannot be answered from the repository. Group the remaining questions into one short checkpoint.
5. Present the inferred integration plan and route map before implementation when any route, CMS, or data migration decision could be destructive.
6. Local mode keeps production Studio read-only. A confirmed login-based selection authorizes implementing its basic secured CMS; keep hosted mutations disabled until verified authentication, authorization and durable storage exist.
7. Run the target repository's own validation commands plus focused route and accessibility checks. Report any pre-existing failures separately.

## Discovery checklist

Determine these facts from files and commands first:

- App Router, Pages Router, or hybrid routing
- Next.js, React, TypeScript, Node.js, and Tailwind versions
- npm, pnpm, yarn, or Bun based on the lockfile
- repository root in a monorepo and the target workspace
- \`src/\` layout, path aliases, and component conventions
- existing shadcn/ui installation and design tokens
- existing \`/blog\`, \`/docs\`, \`/dashboard\`, feed, sitemap, robots, and API routes
- current CMS, MDX pipeline, database, or remote content source
- image domains, CSP, basePath, assetPrefix, i18n, and trailingSlash settings
- authentication, middleware or proxy rules, analytics, consent, and error monitoring
- test, lint, type-check, build, formatting, and content-validation commands
- dirty worktree, generated files, protected files, and repository instructions
- deployment provider, canonical production URL, preview environments, and environment variables

## Questions to ask when unanswered

Ask the minimum relevant subset:

1. Should this be a full product replacement, a blog mounted inside the current app, or only the content engine and components?
2. What route should own the publication if \`/blog\` is unavailable?
3. Should existing posts be migrated, kept in their current CMS, or left untouched?
4. Who authors content, and should production remain read-only or use a secured remote backend?
5. What publication name, description, canonical domain, brand colors, fonts, logo, authors, and social links should be used?
6. Which features are required: Studio, search, RSS, llms.txt, Ask AI, newsletter UI, comments, analytics, or internationalization?
7. Which deployment targets and package manager commands must the result support?
8. Are there compliance, accessibility, privacy, or browser-support requirements beyond sensible defaults?

Do not ask for secrets in chat. Ask the user to place required secrets in their local environment or deployment provider.

## Integration modes

### Full application

Use when the target is empty or the user wants this repository as the product foundation. Preserve Git history where requested, replace identity and sample content, configure the canonical URL, and verify every public route.

### Existing App Router application

Merge the content parser, content files, routes, components, metadata, and tokens into existing conventions. Resolve route and layout collisions explicitly. Reuse the current header, footer, authentication, analytics, and component library where that produces a more coherent product.

### Pages Router or hybrid application

Do not silently create a competing architecture. Explain whether a contained App Router segment is supported by the installed Next.js version or whether the user prefers a staged migration. Keep data and presentation boundaries clear.

### Content engine only

Install the parser, types, validation, and machine-readable outputs without replacing the public UI. Document the adapter points that the host application must render.

## Implementation sequence

1. Record a baseline: Git status, current branch, commands, routes, and build health.
2. Write a route and ownership map showing new, reused, and conflicting surfaces.
3. Install only missing dependencies using the detected package manager.
4. Merge design tokens and shared UI primitives without replacing unrelated globals.
5. Integrate typed content, authors, settings, parsing, and content validation.
6. Add listing, article, category, tag, author, search, feed, sitemap, robots, social image, and machine-readable routes selected by the user.
7. Add Studio pages. Local installs keep hosted writes disabled. Login-based installs must reject unauthorized reads/writes and verify authorized provider persistence before enabling hosted editing.
8. Migrate content with a repeatable transform when migration is requested. Preserve source data until the user approves deletion.
9. Configure metadata, canonical URLs, image behavior, and deployment variables.
10. Update repository documentation with exact commands, content fields, routes, customization points, and rollback steps.
11. Validate and review the final diff.

## Edge-case policy

- Route conflict: stop and propose alternate paths or a merge strategy.
- Existing CMS: never disconnect or delete it without explicit approval.
- Dirty worktree: preserve changes and avoid broad rewrites.
- Unsupported Next.js or Node.js: report the minimum upgrade and its migration risk before changing versions.
- Multiple lockfiles: identify the actual workspace tool before installing.
- Monorepo: scope commands and changes to the selected package.
- Custom base path or locale: generate internal links and metadata through shared helpers.
- Remote images: update image policy only for approved hosts.
- Draft or future content: exclude it from public outputs consistently.
- Duplicate slugs or invalid frontmatter: fail validation with an actionable file-level message.
- No JavaScript: core navigation and article content must remain usable.
- Clipboard or AI-provider failure: retain visible raw links and selectable prompt text.
- Unauthorized production mutation attempt: return 403 before parsing bodies or touching storage. Local mode rejects all production mutations.
- Serverless filesystem: never represent ephemeral writes as durable publishing.
- Secrets: never expose server-only variables through client props or \`NEXT_PUBLIC_\` names.

## Acceptance tests

- Lint, type-check, content audit, unit tests, and production build pass.
- Home, blog, article, pagination, category, tag, author, docs, and Studio routes return the expected status.
- RSS, sitemap, robots, search index, llms.txt, docs.md, and agent-setup.md are valid and reachable.
- Navigation reaches all primary routes by keyboard and has visible focus states.
- Headings, labels, landmarks, dialogs, menus, and status messages have accessible names.
- Layout works at 320, 768, 1024, and 1440 pixel widths without horizontal page overflow.
- Light and dark themes retain readable contrast.
- Local mode: every production editor mutation returns 403. Login-based mode: anonymous/foreign-user mutations fail and authorized writes persist to the selected provider.
- A development save writes the expected Markdown and passes the content audit.
- Canonical, Open Graph, structured data, and feed URLs use the configured production origin.
- No unrelated user files or dependencies changed.

## Final response format

Report the integration mode, key decisions, changed routes, validation evidence, known limitations, environment variable names (not values), and exact next commands. Clearly separate completed work from optional follow-ups.
${agentCloudContract}`;
