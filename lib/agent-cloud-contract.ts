import { productConfig } from "@/lib/product";

/** Current OSS scope. This overrides older cloud architecture plans. */
export const agentCloudContract = `

## Required first checkpoint: provider sign-in and go-ahead

Before private provider reads, account changes, resource creation or deployment, tell the user which accounts this selection needs and ask them to sign in through the official CLI, connected tool or provider website. Ask them to confirm the intended account, repository/project and that you may proceed. Wait for an explicit go-ahead; elapsed time is not confirmation. Never request passwords, tokens or recovery codes in chat. Read-only inspection of the local repository can proceed while waiting.

- Local: no provider is required to write files. GitHub sign-in is needed only if the user wants you to connect or push a repository.
- Login-based + GitHub: GitHub for content and Supabase for email/password authentication.
- Login-based + Supabase Storage: Supabase for authentication and content storage.
- Optional R2 uploads: also Cloudflare, with the intended account and bucket.

After the go-ahead, verify the observed account and resource identity using available tools. If they differ from the user's selection, stop provider access and report the mismatch. Confirmation is not proof that the tools have credentials. Complete all authorized steps autonomously; ask again only for a new material decision, unavailable access, destructive migration or spending outside the agreed scope. Do not substitute the platform maintainer's account for the customer's account.

## Basic open-source setup contract

These rules describe the current product scope and supersede earlier R2-only, workspace, billing or RBAC plans.

- Local is first and default. Posts and settings stay in the user's repository under the selected contentPath, default content. No database or remote login is required. Posts use contentPath/posts/*.md; settings use contentPath/settings.json. Public assets retain their existing public/blog paths and URLs.
- Local and login-based self-hosting each serve one publication in one installation. Managed is Coming soon and must stay disabled. Audit logs, billing, workspace management and advanced roles are deferred. Do not make them prerequisites for basic setup.
- Login-based installs use a page on the customer's own domain, default /login or their selected loginRoute. Use individual email/password accounts with Supabase Auth. OAuth controls remain disabled and labeled Coming soon.
- Login authentication and content storage are separate. GitHub keeps Markdown in the customer's chosen repository and branch. Supabase Storage keeps content in the customer's bucket, with private drafts and authenticated writes. R2 is optional for images/uploads; selecting it must not silently move written content away from GitHub or Supabase Storage.
- The current source implements local reading and editing, configuration export, and this runbook. It does not yet implement working Supabase sessions, GitHub remote writes, Supabase Storage or R2 adapters. A selection alone never activates them. If a login-based install is requested, implement the missing basic adapters and tests within the authorized repository task, or report the exact blocker. Never claim a working remote CMS just because a form or login page renders.

## Local installation runbook

Inspect the repository and existing publishing.json. Preserve the user's data and changes. Validate the selected contentPath with lib/publishing/paths.mjs. Resolve it inside the app's repository root, reject symlinks/traversal and avoid public or code directories. For a new empty project, create the posts folder and default settings. When changing an existing content root, copy existing posts and settings to the selected path without overwriting files; resolve conflicts with the user and retain originals. Do not silently start a blank blog when existing content should be retained.

Write the validated schemaVersion 2 publishing.json to the app root. The local reader, post/settings writers and content audit consume this path. Restart the app after configuration changes. Verify a post save and read, settings persistence, draft exclusion from public routes, and content audit. Local saves do not commit or publish automatically. Push or deploy only within the user's confirmation and scope.

## Login-based installation runbook

Inspect existing routes and auth first. Honor loginRoute and the host's base path; preserve existing routes, and ask for an alternate route only on a real conflict. Use Supabase's current official server-side session guidance. Email/password sign-in, sign-out and session expiry must work. Disable open signup unless explicitly requested; provision the owner using the provider's secure invitation/account process. Never hard-code a password or grant access merely because any Supabase user has signed in. Bind access to this installation's authorized owner/user IDs and Supabase issuer.

Protect every Studio read and mutation on the server, not just with a redirect or hidden button. Use verified sessions, secure cookies, CSRF/origin checks, scoped authorization and provider-enforced access controls. Anonymous visitors must never receive drafts. Do not enable the existing development filesystem writer in production. Hosted writes require a durable provider adapter. A serverless local disk is not durable storage.

GitHub content: use a server-only, repository-scoped token or GitHub App credential. Confirm owner/repository, branch, contentPath and deployment trigger. Preserve frontmatter and use file SHA checks to prevent overwriting concurrent edits. Public repositories expose drafts in Git history; use a private repository when draft privacy is required. Verify reading, saving, conflicts, publication and the deployed public result.

Supabase Storage content: use a dedicated bucket/prefix, private drafts and restrictive policies bound to the installation. Authenticate server requests, use least privilege, and never ship a service-role key to the browser. Implement both the public published-content reader and authenticated draft/editor storage; selecting a bucket alone is insufficient. Test write/read, denied anonymous writes, denied foreign-user access, conflicts and publication.

Optional R2: use a scoped server-side credential, validate upload size/type/path and configure the intended public image delivery. Verify an upload/read and reject anonymous or foreign-user writes. Do not create an R2 bucket if R2 was not selected.

Use current official provider documentation and available connectors/CLIs. If access or a tool is missing, complete independent local work and report what needs connection. Never fabricate a resource, token, migration, connection check, deployment or test result. Store credentials in ignored local environment files or the deployment secret store, not publishing.json, source, links, logs or prompts.

## Agent completion report

Run the project's validation commands and relevant integration tests. For local mode, prove the selected folder is used by readers and writers. For login-based mode, prove the custom login route, valid and invalid credentials, logout/expired sessions, unauthorized draft access and writes, provider persistence, and the public publication flow. A test double is not proof of a real provider connection; distinguish both.

Write a project-local handoff with non-secret choices, changed files, validation, rollback/export steps and exact blockers. Distinguish implemented, configured and verified. Keep MIT licensing unchanged. Product identity is configured in lib/product.ts; ${productConfig.homepageUrl} is a placeholder, not verified hosting. No managed service, OAuth, audit log, billing or team-role work is required for this basic OSS installation.
`;
