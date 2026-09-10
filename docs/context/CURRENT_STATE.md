# Current implementation

Updated 2026-09-10. This supersedes older R2-only and managed onboarding plans.

## Implemented

- `/dashboard/setup` defaults to Local. Blog posts/settings live in a repository-relative folder chosen by the user (default `content`). Managed is disabled with Coming soon.
- Login-based self-hosting exports email/password authentication, `/login` or a validated custom route, GitHub or Supabase Storage content, and optional R2 images/uploads. OAuth is disabled. Supabase Auth is the intended auth provider even for GitHub content.
- Non-secret `publishing.json` schema v2, validated paths/mode/provider combinations, selectable full prompts and personalized agent links. `/agent-setup.md?setup=...` returns a complete validated contract with the selection. Invalid links return 400; personalized responses are not cached.
- Local runtime readers, post/settings writers and content audit consume the contentPath in a local `publishing.json` at the app root. Without the file, existing `content` behavior remains. Unsafe/symlink paths fail closed. No files are migrated just by exporting setup. The agent copies existing data without overwriting before changing roots.
- Agent workflow explicitly waits for provider sign-in and the user's go-ahead, verifies account/resource identity, then completes authorized work. Full prompt works when another agent cannot reach localhost.
- Existing UI/SEO/editor and public draft/future-content filtering are retained. Public Git repositories/history and `public/` assets are not made private by application filters.

## Not complete

Actual Supabase sessions, a working custom login page, authenticated hosted Studio, GitHub remote writes, Supabase Storage and R2 adapters are not implemented. These are documented installation work, not active features. The runtime rejects a remote `publishing.json` rather than silently using local files. Production filesystem editing remains blocked. No provider account was accessed or provisioned.

Managed, OAuth, audit logs, billing, workspaces and advanced team roles are deferred. Existing permissions/storage-key/database scaffolding is historical foundation, not required by the basic onboarding surface. The old enterprise migration is not an automatic installer for the simplified OSS scope.

## Validation

15 publishing tests and 4 content tests passed, covering selections, disabled modes/auth, path/route rejection, safe serialization, shared custom content roots and symlink rejection. Browser checked Local defaults, disabled Managed/OAuth, custom login/content paths, Supabase content and independent R2 assets, and personalized-link generation. ESLint, TypeScript, nine-post audit and the final 97-page production build passed without tracing warnings. Production smoke checks passed for the setup/docs/blog routes, personalized Markdown and no-cache headers, malformed/managed/OAuth/path rejection, and HTTP 403 on all three editor mutation endpoints. The setup page was visually inspected in the browser. The downloaded file was not independently read back; UI feedback says download requested.

## Preservation

Work started on `feat/product-design-polish` with existing uncommitted publishing, branding, database and design/context changes. Keep unrelated work intact; do not reset or clean it. No public push or deployment is part of this task.
