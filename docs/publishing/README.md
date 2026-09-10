# Basic OSS setup and agent installation

Updated 2026-09-10. This describes the basic open-source setup and its current limitations.

| Mode | Blog data | Authentication | Status |
| --- | --- | --- | --- |
| Local (default) | Chosen folder in the user's repository | None | Local runtime available |
| Login-based self-hosting | GitHub repository or Supabase Storage | Supabase email/password, `/login` or chosen route | Configuration and agent runbook; remote runtime still needs implementation |
| Managed | Deferred | Deferred | Disabled, Coming soon |

R2 stores all blog data when selected, or optionally images/uploads alongside GitHub. Supabase Storage is disabled; Supabase Auth remains available for email/password integration. OAuth is disabled. Audit logs, advanced roles, billing, workspaces and managed operations are outside the current basic scope.

## Local setup

First choose Fresh project or Existing website. Only a fresh project needs a project name. Existing websites keep their identity and default to current hosting. The generated manual and agent guides inspect the target app and package manager, resolve route/auth/content conflicts, and preserve the host application's pages and deployment. In a monorepo, content paths are relative to the selected app root. Integration is currently from source; see [npm readiness](NPM_READINESS.md) for the package work required before release.

Use `/docs#get-started`, select Local and enter a repository-relative content folder such as `content` or `data/blog`. Download `publishing.json` to the app root. Before selecting a new root for existing content, copy posts/settings into that folder without overwriting or deleting originals. The app reads posts at `<contentPath>/posts/*.md` and settings at `<contentPath>/settings.json`; public image paths remain unchanged. Restart the app and validate. Paths cannot escape the repository or traverse symlinks/public/code folders.

Without publishing.json the app retains its current `content` directory. Configuration export does not modify or migrate files. Do not put a remote configuration in the app root until a working authenticated provider adapter has been implemented; it deliberately fails closed.

## Agent setup

The user copies a short setup prompt containing the `/agent-setup.md` link. The setup page adds validated non-secret choices via `?setup=...`. On localhost an external agent may not be able to fetch the URL; a collapsed fallback supplies the full instructions. Once this website is deployed, links use its actual origin automatically.

The agent first asks the user to sign in to their selected provider accounts and confirm it may proceed. It verifies the account/project, then performs authorized setup and validation autonomously. Local writing needs no provider. GitHub remote content requires GitHub plus Supabase Auth; Supabase Storage requires Supabase; R2 additionally requires Cloudflare. Credentials stay in secure environment/secret storage, never links or prompts.

See [agent automation](AGENT_AUTOMATION.md) and [current state](../context/CURRENT_STATE.md) for honest runtime limitations. Connected authentication and remote storage are not implemented yet.
