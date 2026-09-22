# Next steps

The source-available scope is one publication per installation: local repository authoring first, then a Cloudflare-only hosted Studio using Workers, D1 and private R2.

Remote runtime work needs owner-bound D1 sessions, server-protected Studio reads/writes, R2 storage adapters and public publication readers. Follow [the Cloudflare hosted Studio plan](../publishing/CLOUDFLARE_HOSTED_STUDIO.md). Verify expired/revoked sessions, unauthorized reads/writes, draft privacy, concurrent edits and persisted provider writes before enabling hosted editing. Never use a Worker filesystem for durable content.

Keep Managed and OAuth disabled. Do not make billing, audit logs, workspaces or advanced roles prerequisites for basic setup.

Finish existing-app consumer fixtures and extract a reusable package before npm publication. Follow [npm release readiness](../publishing/NPM_READINESS.md); the root website remains non-publishable. Guide edge-case coverage is not evidence of a working installer or tested compatibility with arbitrary existing applications.

The installation agent must ask for required provider sign-in and explicit go-ahead before private provider access or provisioning, then verify the customer's selected account/resources. Keep secrets in secure environment storage and report genuine blockers. The platform maintainer's account is never a default customer account.
