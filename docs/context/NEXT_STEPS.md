# Next steps

The source-available scope is one publication per installation: local repository authoring first, then email/password self-hosting with GitHub or Cloudflare R2 content and optional R2 uploads.

Remote runtime work still needs owner-bound Supabase sessions, server-protected Studio reads/writes, durable storage adapters and public publication readers. Verify expired/foreign sessions, unauthorized reads/writes, draft privacy, concurrent edits and persisted provider writes before enabling hosted editing. Never use ephemeral production filesystem writes for durable content.

Keep Managed and OAuth disabled. Do not make billing, audit logs, workspaces or advanced roles prerequisites for basic setup.

The npm alpha and packed consumer tests live under `packages/blog-system-next` and `scripts/test-package-consumer.mjs`. Alpha.6 compiles the actual OSS rich-text Studio and public templates. Re-running init refreshes unchanged generated routes; content migrations and edited-route migrations remain manual. Before publication, review name ownership, license wording, the final packed artifact and the browser results. Expand compatibility claims only after real consumer builds. Follow [npm release readiness](../publishing/NPM_READINESS.md); the root website remains non-publishable. Pages/hybrid routing, static export, Cache Components and cloud editing remain outside this alpha's scope.

The installation agent must ask for required provider sign-in and explicit go-ahead before private provider access or provisioning, then verify the customer's selected account/resources. Keep secrets in secure environment storage and report genuine blockers. The platform maintainer's account is never a default customer account.
