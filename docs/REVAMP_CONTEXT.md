# Product UI revamp context

Updated: 2026-09-06
Branch: `feat/product-design-polish`
Status: second design pass complete and validated

## Current polish pass (read first)

Follow-up: removed the "A LOOK INSIDE THE SYSTEM" label and centered the Write / Read / Publish tabs at every breakpoint, per user feedback.

The user found the first revamp only satisfactory and requested a more considered SaaS-level product presentation. Read `docs/DESIGN_SYSTEM.md` for the new direction, audited plan, tokens, reference URLs, and source-preservation details. The history below describes the previous pass and is retained for context; the current design system supersedes its visual decisions.

- Previous uncommitted work is preserved on the new branch. An external pre-polish snapshot is at `../.codex-backups/blog-system-next-before-polish-20260905`.
- The new landing is a neutral editorial product page with Geist and Instrument Serif, restrained blue accents, and a working Write / Read / Publish walkthrough using real article data.
- Removed repeated feature blocks, fabricated-looking metric presentation, and broad CMS comparisons. The open-source section states the actual fit and the absence of a collaborative cloud newsroom.
- The archive now has a journal masthead, original typographic cover fallbacks, open article cards, and quieter topic navigation. Existing templates and static pagination are preserved.
- Shared navigation, footer, docs, Studio typography, tokens, and product CTAs have been refined. Publication font settings still work independently.
- Search now opens in the existing Radix dialog, restores focus, handles Escape, and has an index-loading failure fallback. It remains lazily loaded.
- Mobile navigation closes on destination selection, outside click, Escape, and focus exit. All main landmarks now have a skip-link target.
- Visual checks have already covered desktop homepage/archive, preview tabs, search results/focus return, mobile navigation, and initial mobile layouts. Found and fixed a clipped mobile reading-preview link and overly tall wrapped topic navigation.
- Final validation is complete. See `docs/DESIGN_QA.md` for the check record. Lint, TypeScript, the nine-post content audit, and the 97-page production build passed. All 23 route smoke checks passed, and all three production mutation endpoints returned 403. Content/settings hashes remained unchanged.
- This is work in the user's existing Next.js repo, intended for Vercel. No hosting migration or external deployment is part of this pass.

## Product thesis

NextJs Blog System is a repository-native publishing system for Next.js. Markdown stays in Git, the local studio helps authors shape it, and the application derives the public site, metadata, schema, feeds, search, social cards, and AI-readable output from the same source.

The website must sell a product and prove it at the same time. The marketing surface should make adoption feel safe and quick. The blog and article surfaces should demonstrate the quality a user receives after adoption.

## Primary audiences and jobs

1. Next.js developers who want a polished blog without designing a content architecture from scratch.
2. open source maintainers who want posts to live beside code and move through pull requests.
3. technical teams that care about static output, SEO correctness, performance, and content portability.

## The three Ws

Every major section must answer at least one of these and the full page must answer all three above the first major scroll.

- What is it: a production-ready, file-based publishing system built specifically for Next.js.
- Who is it for: developers and teams who want Git-owned content with a friendly local authoring workflow.
- Why choose it: one markdown source produces a polished reader experience plus search, schema, feeds, social cards, and AI-readable output without a hosted CMS or runtime database.

## Information architecture

### Primary navigation

- Product: home page, with anchors for proof, workflow, reader experience, and features.
- Blog: live archive that demonstrates the shipped reader experience.
- Docs: a public quick-start and architecture page.
- GitHub: repository source and adoption path.
- Get started: strongest CTA, leading to the docs installation section.
- Search and theme: persistent utilities.

The development-only Studio remains visible when available, but it is labelled as a local tool. Public visitors get a product preview on the landing page instead of a production route that intentionally returns 404.

### Footer

The footer carries all public product destinations, machine-readable endpoints, community links, and the development-only studio link when available. It is the complete route map without making the primary navigation crowded.

## Landing page structure

1. Compact open source announcement with a GitHub route.
2. Hero with a short outcome-led headline, supporting promise, Get started CTA, live demo CTA, and install command.
3. Product proof visual using real concepts from the system: a studio panel feeding a polished article panel.
4. Measurable proof strip: no database, static output, generated surfaces, development-only studio.
5. Workflow section: write once, validate automatically, publish everywhere.
6. Reader-experience section: show why TL;DR, key takeaways, table of contents, reading progress, FAQs, related posts, and AI actions improve comprehension and discovery.
7. Capability bento grouped by Author, Rank, and Distribute so benefits are memorable and non-repetitive.
8. Next.js-native architecture section with a real markdown sample and generated output map.
9. Honest comparison against a hand-built blog and hosted CMS.
10. Performance proof and final adoption CTA.

## Blog archive structure

- Clear eyebrow that identifies this as the live product demo.
- Editorial headline and description.
- Search affordance and category navigation with counts.
- Featured story with stronger image hierarchy.
- A consistent article grid with visible category, title, summary, date, and reading time.
- Numbered crawlable pagination. Six cards per page is retained because it produces a balanced three-column grid and already has correct static routes. Copy will make the archive count and current page legible.
- Adoption callout below the archive that links back to product benefits and docs.

## Article structure

- Retain the existing accessible reading experience and template system.
- Improve whitespace, typographic scale, metadata clarity, surface contrast, and sticky utilities.
- Keep answer-first content, accessible table of contents, reading progress, share actions, author information, FAQs, tags, and related reading.
- Add a subtle product proof CTA after the article so the demo converts without interrupting reading.

## Docs structure

- Add `/docs` as a static public route.
- Explain fit, install, configure, write, and ship in one scannable page.
- Link to the content contract, GitHub repository, blog demo, RSS, `llms.txt`, and search index.
- Never imply a feature that is not implemented.

## Visual system

- shadcn-informed composition: neutral semantic tokens, compact controls, layered cards, clear borders, consistent radii, and accessible focus states.
- Distinctive editorial product identity: near-neutral canvas, emerald accent, warm highlight, quiet grid texture, technical monospace labels, and a characterful display face.
- Light mode is the primary marketing canvas. Dark mode remains fully supported.
- Restrict heavy gradients to proof visuals and cover art. Body surfaces use flat color and border hierarchy.
- Use a maximum content width of 78rem, readable article width near 44rem, and consistent section rhythm.
- Motion is limited to short hover and entrance details and must respect reduced motion.
- No emoji and no em dash in product UI copy.

## Plan audit

### Clarity

- The previous headline described implementation before outcome. The new hero starts with the result and follows with how it works.
- The archive is no longer the main landing CTA. Get started is primary, and the live blog is the proof-oriented secondary action.
- Features are grouped by user job to avoid eight equal cards competing for attention.

### Funnel

- Awareness: headline and promise.
- Understanding: product visual and workflow.
- Trust: measurable proof, live blog, and honest comparison.
- Adoption: quick start, GitHub, and final CTA.
- No CTA points to an unavailable account flow or fake cloud service.

### Accessibility

- One H1 per page with sequential section headings.
- Semantic lists, figures, tables, nav labels, and descriptive links.
- Controls maintain at least a 40px target in primary navigation and CTA contexts.
- Visible focus, sufficient contrast, reduced-motion support, and no color-only status meaning.
- Decorative visuals are hidden from assistive technology; product diagrams include text equivalents in the DOM.

### UX and repetition

- The live blog is proof, so landing-page article cards are reduced to one concise preview rather than another archive.
- Performance appears once as a dedicated proof section.
- SEO, feeds, schema, and AI output are presented together as distribution rather than repeated across unrelated cards.
- Technical detail follows the value statement instead of leading it.

### Credibility

- Use concrete repository capabilities and measured properties only.
- Comparison language describes tradeoffs, not universal superiority.
- The Studio is clearly a public read-only production demo and a writable local development tool.
- Newsletter UI remains disabled until a backend exists.

## Implementation checklist

- [x] Inspect repository, routes, existing capabilities, and git state.
- [x] Create feature branch.
- [x] Review the current landing, archive, article, and studio in a browser.
- [x] Inspect shadcn Create and keep only relevant design-system direction.
- [x] Audit plan against the three Ws, funnel, accessibility, UX, repetition, and credibility.
- [x] Rebuild global tokens, header, and footer.
- [x] Rebuild the landing page and product proof components.
- [x] Add the public docs route.
- [x] Polish archive cards, archive header, pagination, article, and development studio shell.
- [x] Run lint, type-check, content audit, and production build.
- [x] Browser-test the primary routes, search interaction, themes, production navigation, and console output.
- [x] Update this file with final state and any follow-up work.
- [x] Expose the complete Studio in production as a read-only product tour.
- [x] Redesign the editor around a wide writing canvas and compact inspector.
- [x] Add complete Markdown docs, Share to AI, and an agent-ready installation contract.

## Final implementation state

- The public landing page now follows an awareness, understanding, trust, and adoption funnel.
- The live archive has category counts, explicit search, RSS access, improved card hierarchy, scalable pagination, and a product CTA.
- Article pages have a larger editorial hierarchy, improved reading surfaces, refined code and quotation blocks, and an end-of-article adoption CTA.
- `/docs` is a new public route covering prerequisites, setup, configuration, writing, deployment, architecture, and generated routes.
- The header exposes Product, Blog, Docs, Studio, GitHub, search, theme, and Get started in every environment. Studio is marked Demo in production and Local in development.
- The footer provides a complete map of product, resource, machine-readable, and project routes.
- The Studio is visible in production as a public product tour. Browser-only exploration and preview work, while post, settings, and upload mutations return HTTP 403 outside development.
- `STUDIO_DEMO_ENABLED=false` is the server-side opt-out for downstream sites whose repository contains private drafts. Local authoring remains available.
- The editor now uses a shadcn-informed dashboard shell with a searchable, collapsible post library and a compact breadcrumb action header.
- The writing canvas and live inspector start at a true 50/50 split. A visible, keyboard-accessible separator lets users resize either side, and the layout stacks vertically on smaller screens.
- Rich-text formatting and block insertion controls are visible in two labeled toolbar rows. The former Insert and More menus were removed so core actions stay discoverable.
- `/docs.md` provides copyable documentation. `/docs/agent-setup` explains AI-assisted installation and `/agent-setup.md` provides the machine-readable contract.
- Existing structured data, metadata, RSS, sitemap, raw markdown, search, templates, and editor behavior remain intact.
- An invalid nested breadcrumb list item discovered during browser QA was fixed. Fresh article reloads no longer add hydration errors.
- The docs and guided agent-setup routes are included in the sitemap. Production exposes the complete Studio with a clear read-only banner.
- Product and studio UI copy added or revised in this work contains no emoji or em dash punctuation. Existing authored article prose was left unchanged.

## Validation record

`npm run validate` passed after the complete follow-up implementation on 2026-09-03:

- ESLint: passed with no warnings.
- TypeScript: passed.
- Content audit: all 9 posts passed.
- Next.js production build: compiled successfully and generated 97 static pages.
- Production routes returned 200 for all six Studio surfaces, `/docs`, `/docs/agent-setup`, `/docs.md`, `/agent-setup.md`, and `/sitemap.xml`.
- Production POST requests to post save, settings save, and image upload returned 403. SHA-256 checks confirmed the tested post and settings files did not change.
- Browser QA confirmed the editor renders an equal two-panel desktop workspace after the post rail, supports keyboard resizing, collapses the post rail, exposes all formatting and block actions without catch-all menus, and stacks the panels on smaller screens.

The editor dashboard revision was revalidated on 2026-09-04. ESLint, TypeScript, the nine-post content audit, and the 97-page production build all passed. Browser QA also verified 50/50 sizing, a keyboard-adjustable split, the 288px to 56px post-rail collapse, post search filtering, and the compact stacked layout. A production smoke test returned 200 for the dashboard, editor, docs, and agent setup routes, while a post mutation returned 403 with the read-only explanation.

## Follow-up opportunities

These remain useful future work:

- Add real product screenshots or a short demo video once final brand assets exist.
- Add a hosted newsletter action before enabling the existing newsletter flag.
- Add community proof, installation counts, or testimonials only when real data exists.
- Add automated browser coverage for mobile breakpoints in CI.

## Resume notes

Start by reading this file, `docs/DESIGN_SYSTEM.md`, `docs/DESIGN_QA.md`, and `AGENTS.md`. Current work is on `feat/product-design-polish`. The user requested committing the complete prior revamp on 2026-09-06 before planning new publishing modes. Application changes and design documentation are captured in separate commits. Preserve the parser, SEO model, routes, template/font settings, and editor behavior. Production Studio must remain read-only at both the UI and API layers until an explicitly approved authenticated-publishing implementation replaces that boundary. The earlier editor revision added `react-resizable-panels` and `components/blog-ui/resizable.tsx`; this pass adds a shared Studio subnavigation without changing that resizing behavior.

The local development preview uses `http://localhost:3000` when running. The temporary production server on port 3001 was used only for validation and stopped at the design handoff. No remote push, merge, or deployment was performed. No package or lockfile changes were added by the second design pass. New publishing modes are a planning task only; any subsequent source changes should receive appropriately scoped checks before another production build.
