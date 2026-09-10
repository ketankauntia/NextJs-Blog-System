# Decisions and continuation

Updated 2026-09-10. Supersedes earlier managed/R2-only and team-RBAC-first plans.

Build the single-project open-source basics first:

1. Local writing in the customer's repository with a chosen data folder. No database or login required.
2. Login-based self-hosting, email/password at `/login` or the chosen route. Supabase Auth handles individual accounts; content may stay in GitHub or Supabase Storage. R2 is optional for uploads.
3. Managed hosting and OAuth remain Coming soon. Audit logs, advanced team roles, workspaces, billing and other operations are later work.

The setup UI, config and agent contract implement these choices. Remote runtime adapters and actual login are still missing. The next implementation is verified owner-bound Supabase sessions and a protected Studio, then GitHub and Supabase Storage persistence/public readers, then optional R2 upload delivery. Do not expose the local development writer in production or treat an auth page alone as a working CMS.

Test unauthorized reads/writes, expired sessions, foreign users, draft privacy, concurrent edits and durable provider writes. Prove the actual deployed publication result before claiming remote publishing works. Avoid imposing the older multi-tenant schema and enterprise operations on a basic install.

The agent must ask customers to sign in to required providers and give explicit go-ahead before private account access or provisioning. Verify their chosen account/resources and keep secrets out of prompts and publishing.json. Complete independent local work while waiting; report missing tools/access accurately. The platform maintainer's identity is not a customer's identity.

For maintainer provider work only, the prior intended account is ketankauntia26@gmail.com; verify it and the intended project before access. No provider access was needed or performed for the current UI/configuration work.
