# Current implementation

## Available

- Public identity and attribution use `nextjsblog.com`; the header/footer wordmark remains Next.js Blog System. `NEXT_PUBLIC_SITE_URL` controls deployment canonicals, with Vercel hostname fallbacks before the product homepage. Forks retain their own configured origin.
- The landing page includes SEO/traffic/revenue guidance, illustrative conversion examples and a single setup CTA. Its button words and conversion values cycle every two seconds, using plain text swaps for reduced motion. Search and GitHub are removed from the navbar; X and GitHub icon links live in the footer.

- The folder picker defaults to app/ + a blog placeholder (effective app/blog), with src/app/, content/ and data/ alternatives. Local paths may colocate posts/*.md and settings.json beneath app/ or src/app/ without replacing route files. Existing installations without configuration still read content/; setup does not move data automatically.
- The AI section centers its copy action above an exact prompt preview. Manual steps and agent instructions share bullet lists and labeled code examples. The required publishing.json appears inline instead of a download button. The documentation sidebar tracks nested sections and layout changes, with aria-current and a visible active marker.
- Migration must preserve unsupported records in a private migration-review folder with source, URL, reason and follow-up details. Start fresh applies to old blog data after backup and exact scope confirmation; keep mode leaves migration to the user.

- The compact setup panel includes inline SVG provider logos, URL previews for blog/login routes, GitHub or all-content R2 selection, and optional R2 uploads with GitHub. Supabase Storage is disabled in both the UI and validation (Auth is separate). Existing content choices are keep, migrate or replace after a scoped backup/removal confirmation. AI setup shares the configuration panel; an OR divider separates the manual guide.
- blogRoute is a requested integration mount, not an automatic runtime route switch. Existing hosting answers preserve that provider. The agent checks collisions and implements route changes before activation.

- The setup UI defaults to Existing website and preserves current hosting. Fresh project is disabled; clicking it or using Enter/Space shows a dismissible notification with `npx create-next-app@latest`. Existing-site exports clear the replacement identity; manual and agent plans inspect workspace/package manager, routes, content/CMS and existing auth before changes. Older fresh-project configuration links remain readable for compatibility.

- Public blog, SEO outputs and local Studio. Hosted Studio is read-only; local development can save posts/settings and upload images. Public readers omit draft/future posts.
- `/docs#get-started` owns the complete setup flow: configuration, AI setup, then matching manual instructions. The former dashboard setup URL redirects here, even when the Studio demo is disabled. Studio navigation contains authoring tools only. One button copies a short prompt and the absolute `/agent-setup.md` URL. A collapsed fallback provides full instructions when an agent cannot reach the URL. The docs header has no duplicate source, Markdown or AI toolbar.
- `/docs#get-started` exports validated, non-secret schema-v2 `publishing.json`: Local with a repository-relative content folder, or login-based self-hosting with a custom login route, GitHub/R2 content and optional R2 assets. Managed and OAuth stay disabled.
- The local reader, post/settings writers and content audit share the configured contentPath. Default is `content`; traversal and symlink paths fail closed. Exporting setup does not migrate files.
- `/agent-setup.md?setup=...` serves validated personalized instructions without caching. Local, GitHub login and R2 login each generate their own plan, with optional R2 and hosting steps. `lib/publishing/guide.ts` supplies both manual steps and the agent plan so they stay aligned. Invalid choices return 400. The agent waits for required provider sign-in and explicit go-ahead, verifies account/resources and carries out authorized setup. It asks for unavailable access and decisions it cannot infer.

## Not implemented

An installable npm package or automated migration tool. Existing websites currently use guided source integration. The application manifest blocks npm publication while the package boundary and consumer-fixture checks in [npm readiness](../publishing/NPM_READINESS.md) are pending.

Supabase sessions, a working custom login page, authenticated hosted editing, GitHub remote writes, Supabase Storage and R2 adapters. These are integration work, not active features. A remote publishing.json fails closed in the current local runtime. Local saves do not automatically commit, push or deploy.

Managed hosting, OAuth, audit logs, billing, workspaces and advanced team roles are deferred. This repository contains the basic OSS engine and its setup documentation; unused managed scaffolding and internal planning are excluded.

## Validation

Use `npm run test:publishing`, `npm run test:content` and `npm run validate`. Production route smoke tests should verify the public guide, personalized contract, invalid input rejection and all editor mutation guards. Never treat a selector or mocked provider test as proof of a working cloud integration.
