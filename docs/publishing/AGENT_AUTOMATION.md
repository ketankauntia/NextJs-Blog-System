# Low-touch agent setup

Updated 2026-09-10.

1. Choose Local with a repository folder, or login-based self-hosting with a login route, GitHub/Cloudflare R2 and optional R2 uploads.
2. Choose your options at `/docs#get-started`, then use Copy setup prompt below the configuration. It copies a short instruction and the absolute `/agent-setup.md` link. The endpoint is public and self-contained. It generates the selected Local, GitHub login or R2 login plan, adding R2 and hosting steps only as selected. The manual guide uses the same plan. A collapsed fallback copies the full instructions when an agent cannot reach the deployment URL.
3. The agent asks the user to sign in to required providers, identify the intended accounts/resources and explicitly confirm it can proceed. It may inspect local files while waiting, but does not read private provider data or provision resources before confirmation.
4. After confirmation it verifies tool access and account identity, inspects the host app, preserves existing work and carries out authorized integration without repeated permission prompts.
5. Local mode writes schema-v2 `publishing.json`, prepares the selected content root without overwriting existing data, and tests the shared read/write/audit path. Remote mode requires implementing the missing verified authentication and durable content adapters; a selector, config or rendered login page is not completion.
6. Validate, record non-secret configuration and actual evidence, and report remaining blockers. Never invent a provider connection or claim production readiness without integration tests.

Local writing requires no cloud account. GitHub remote content uses GitHub plus Supabase Auth; R2 content uses Cloudflare and Supabase Auth; R2 assets also need Cloudflare. Secrets belong in ignored environment files or deployment secret storage, not prompts, URLs, publishing.json or logs.

Managed and OAuth remain disabled. Audit logs, billing, workspaces and advanced team roles are deferred. The current agent contract is a readable installation prompt, not a hosted autonomous service or MCP server.
