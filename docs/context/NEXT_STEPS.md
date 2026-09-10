# Next steps

The open-source scope is one publication per installation: local repository authoring first, then email/password self-hosting with GitHub or Supabase Storage content and optional R2 uploads.

Remote runtime work still needs owner-bound Supabase sessions, server-protected Studio reads/writes, durable storage adapters and public publication readers. Verify expired/foreign sessions, unauthorized reads/writes, draft privacy, concurrent edits and persisted provider writes before enabling hosted editing. Never use ephemeral production filesystem writes for durable content.

Keep Managed and OAuth disabled. Do not make billing, audit logs, workspaces or advanced roles prerequisites for basic setup.

The installation agent must ask for required provider sign-in and explicit go-ahead before private provider access or provisioning, then verify the customer's selected account/resources. Keep secrets in secure environment storage and report genuine blockers. The platform maintainer's account is never a default customer account.
