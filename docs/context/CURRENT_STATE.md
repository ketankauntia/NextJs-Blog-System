# Current implementation

## Available

- Public blog, SEO outputs and local Studio. Hosted Studio is read-only; local development can save posts/settings and upload images. Public readers omit draft/future posts.
- `/docs#get-started` owns the complete setup flow: configuration, AI setup, then matching manual instructions. The former dashboard setup URL redirects here, even when the Studio demo is disabled. Studio navigation contains authoring tools only. One button copies a short prompt and the absolute `/agent-setup.md` URL. A collapsed fallback provides full instructions when an agent cannot reach the URL. The docs header has no duplicate source, Markdown or AI toolbar.
- `/docs#get-started` exports validated, non-secret schema-v2 `publishing.json`: Local with a repository-relative content folder, or login-based self-hosting with a custom login route, GitHub/Supabase content and optional R2 assets. Managed and OAuth stay disabled.
- The local reader, post/settings writers and content audit share the configured contentPath. Default is `content`; traversal and symlink paths fail closed. Exporting setup does not migrate files.
- `/agent-setup.md?setup=...` serves validated personalized instructions without caching. Local, GitHub login and Supabase login each generate their own plan, with optional R2 and hosting steps. `lib/publishing/guide.ts` supplies both manual steps and the agent plan so they stay aligned. Invalid choices return 400. The agent waits for required provider sign-in and explicit go-ahead, verifies account/resources and carries out authorized setup. It asks for unavailable access and decisions it cannot infer.

## Not implemented

Supabase sessions, a working custom login page, authenticated hosted editing, GitHub remote writes, Supabase Storage and R2 adapters. These are integration work, not active features. A remote publishing.json fails closed in the current local runtime. Local saves do not automatically commit, push or deploy.

Managed hosting, OAuth, audit logs, billing, workspaces and advanced team roles are deferred. This repository contains the basic OSS engine and its setup documentation; unused managed scaffolding and internal planning are excluded.

## Validation

Use `npm run test:publishing`, `npm run test:content` and `npm run validate`. Production route smoke tests should verify the public guide, personalized contract, invalid input rejection and all editor mutation guards. Never treat a selector or mocked provider test as proof of a working cloud integration.
