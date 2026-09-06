# Product design system

Updated: 2026-09-05
Branch: `feat/product-design-polish`

## Direction

A precise developer tool with the sensibility of a considered publication. Neutral paper and ink, a small cobalt accent, generous whitespace, restrained edges, and real content as the visual proof. Product typography uses Geist; Instrument Serif adds a single editorial voice to the landing headline. Publication typography remains configurable in Studio.

## Plan, audited before implementation

1. Replace the repetitive landing page with six purposeful moments: product promise, interactive Studio illustration, three connected workflow benefits, reader demonstration, developer architecture, and adoption.
2. Unify the public header, mobile navigation, footer, buttons, focus rings, neutral surfaces, and product typography. Preserve all public routes, search, theme choice, and production Studio visibility checks.
3. Turn the archive into a publication: concise masthead, topic navigation, generous featured story, unboxed article cards, legible metadata, and existing crawlable pagination. Preserve template selection.
4. Refine documentation and Studio shells with the same visual language. Keep article typography configurable, and retain authoring, SEO, content parsing, feeds, metadata, and production mutation protection.
5. Inspect rendered desktop and mobile layouts, dark mode, navigation, interactive proof, search, article reading, documentation, and Studio. Run lint, TypeScript, content audit, build, and production route/mutation checks.

## Logical review

- What: the first screen explicitly identifies a publishing system for Next.js, with Markdown, a local Studio, and Git ownership.
- Who: developers building a publication inside a Next.js application. This is a repository starter, not a separately installed hosted service.
- Why: the visual proof connects authoring to a complete reading experience and automatically derived publishing outputs.
- Funnel: start building goes to the existing quick start; explore Studio goes to the actual workspace; articles and output links serve as verifiable proof.
- Repetition: remove numerical vanity-style proof, generic feature bento, duplicate mock articles, and sweeping CMS comparisons. Each remaining section has one job.
- Honesty: illustration labels distinguish a product walkthrough from an actual editable embedded Studio. No fake testimonials, fabricated usage counts, performance scores, or universal SEO/ranking claims.
- Accessibility: semantic headings, descriptive links, existing Radix primitives for tabs, keyboard navigation, focus visibility, touch targets, reduced motion, and responsive wrapping. Mobile navigation closes on selection and Escape.
- Scope: improve the existing Next.js repository and its local preview. Preserve the Vercel-oriented architecture; no Sites hosting migration or external publishing.

## Tokens and rules

- Content width: 74rem; page gutter 24px desktop / 20px mobile; editorial prose retains its existing 44rem maximum.
- Spacing: 4px base; 24/32px component gaps; 80/112px major section rhythm.
- Typography: Geist for product/navigation/docs/Studio; configured fonts for article content. Hero 48-88px responsive; section titles 32-48px; body 16-18px; metadata 12-14px.
- Surface: white and subtle neutral gray in light mode; neutral near-black layers in dark mode. Cobalt denotes interaction, selected state, or a small editorial marker.
- Corners: 8px controls; 12px content surfaces; 16px the main product preview. Avoid nested rounded boxes unless they represent actual software UI.
- Borders: one quiet neutral boundary where structure needs it; shadows reserved for the product stage and overlays.
- Motion: short color/opacity/transform transitions, no scroll-jacking or continuous decorative animation. Respect reduced motion.
- Copy: concrete benefits, short sentences, no emoji, no em dash, no invented claims or decorative metric dashboards.
- Images: no third-party photography needed for the developer product. Original code-native product UI and typographic editorial covers provide the visual identity. No external asset licensing or attribution dependency.

## References

Reviewed on 2026-09-05. Inspiration only; no copied assets or source.

- https://linear.app : confident hierarchy, restraint, product interface as the central proof.
- https://resend.com : immediate developer positioning, a direct adoption path, concrete workflow examples.
- https://vercel.com : precision, clear typographic hierarchy, integration-focused presentation.
- https://ui.shadcn.com/create : coherent component tokens and compact control styling. Reuse the repository's installed shadcn/Radix components rather than reinitialize it.

## Implementation status

- [x] Inspect current source, historical context, live page, and Next.js bundled guides.
- [x] Preserve preexisting uncommitted changes and create the polish branch.
- [x] Establish and audit direction before implementation.
- [x] Implement landing and shared design system.
- [x] Refine archive, docs, and Studio surfaces.
- [x] Complete visual/interaction QA and production smoke checks.
- [x] Record final state and remaining limitations in REVAMP_CONTEXT.md.

## Source preservation

The previous session left extensive uncommitted changes. They are carried forward, not reverted. A snapshot of modified/untracked files and the baseline diff exists outside the repo at `../.codex-backups/blog-system-next-before-polish-20260905`. Use it to distinguish this polish pass from the preceding feature work.

## Iterations from rendered review

1. Replaced the green grid-and-card direction with an ink/paper product system and original typographic publication covers.
2. Moved expanding inline search into the existing Radix dialog to preserve header space, keyboard focus, and mobile usability.
3. Changed mobile topic chips to horizontal navigation, reducing their height from multiple rows to one accessible scrolling strip.
4. Removed fixed heights from interactive Read/Publish panels after phone and tablet checks found a clipped article link. Only the explicitly illustrative writing canvas remains cropped.
5. Added persistent Studio navigation and reduced repeated primary buttons in the content table. Article titles now wrap and link directly to the editor.
6. Added the documented Next.js 16 scroll-behavior attribute after the browser reported navigation warnings. Updated the favicon to match the neutral N identity.

## Assets

No stock or generated raster images were added. The preview is original React/CSS using real public article data. PostCover uses original type compositions for image-free posts and continues to support configured cover images. The cover palettes live in `app/product.css`, and their category-specific phrases live in `components/blog/post-cover.tsx`.
