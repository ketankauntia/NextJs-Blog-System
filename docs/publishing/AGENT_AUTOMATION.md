# Low-touch agent setup

Updated 2026-09-10.

1. Choose Local with a repository folder, or login-based self-hosting with a login route, GitHub/Supabase Storage and optional R2 uploads.
2. Copy the personalized setup link or full prompt. The raw `/agent-setup.md` endpoint is public and self-contained. Full text is the fallback for an agent that cannot reach localhost.
3. The agent asks the user to sign in to required providers, identify the intended accounts/resources and explicitly confirm it can proceed. It may inspect local files while waiting, but does not read private provider data or provision resources before confirmation.
4. After confirmation it verifies tool access and account identity, inspects the host app, preserves existing work and carries out authorized integration without repeated permission prompts.
5. Local mode writes schema-v2 `publishing.json`, prepares the selected content root without overwriting existing data, and tests the shared read/write/audit path. Remote mode requires implementing the missing verified authentication and durable content adapters; a selector, config or rendered login page is not completion.
6. Validate, record non-secret configuration and actual evidence, and report remaining blockers. Never invent a provider connection or claim production readiness without integration tests.

Local writing requires no cloud account. GitHub remote content uses GitHub plus Supabase Auth; Supabase content uses Supabase Auth and Storage; R2 assets also need Cloudflare. Secrets belong in ignored environment files or deployment secret storage, not prompts, URLs, publishing.json or logs.

Managed and OAuth remain disabled. Audit logs, billing, workspaces and advanced team roles are deferred. The current agent contract is a readable installation prompt, not a hosted autonomous service or MCP server.
