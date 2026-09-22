# Cloudflare hosted Studio plan

Updated 2026-09-22. This is the implementation plan for **Login-based — Write from your website**.

## Supported first release

One publication runs on one Cloudflare account:

- Cloudflare Workers runs the existing Next.js website and authenticated Studio.
- Cloudflare D1 stores the owner account, password account record, revocable sessions and the installation role binding.
- A private Cloudflare R2 bucket stores Markdown posts, settings and uploads.
- Cloudflare Turnstile and a login rate limit protect the password endpoint.
- The first release has one `owner` role. The schema keeps the role explicit so editor and publisher roles can be added later without changing the session boundary.

Existing-stack, GitHub, Supabase, Neon and AWS choices remain visible but disabled as **Coming soon**. Local repository authoring remains available and unchanged.

## Implementation order

1. **Setup contract:** make Cloudflare the only valid login-based profile and generate a non-secret integration specification.
2. **Runtime compatibility:** run Cloudflare's current Next.js compatibility check, preview on Workers and keep the existing deployment available for rollback.
3. **Authentication:** use a maintained authentication library with D1 support; disable public signup; add a one-time owner bootstrap command, login, logout, expiry and session revocation.
4. **Authorization:** require a fresh D1-backed owner check in the data-access layer for every Studio page, draft read and mutation. Route redirects are only a convenience.
5. **R2 content:** add an adapter for list/read/create/update of posts and settings. Use validated keys, paginated listing and ETag conditional writes.
6. **Uploads and delivery:** accept bounded raster uploads from an authorized session, keep drafts private and serve only approved public assets through application routes.
7. **Migration:** inventory and back up existing content, import without overwriting, retain rejected records for review and compare counts/slugs before cutover.
8. **Deployment:** bind preview D1/R2 resources first, apply migrations, verify the complete website, then bind production resources and move the domain only after approval.

## Security and failure cases

- A valid login is insufficient by itself; the user must also have the active installation role.
- Public signup stays disabled. Owner creation is single-use and server-side.
- Cookies are HttpOnly, Secure and SameSite. State-changing requests verify origin and reject cross-site submissions.
- Login errors do not reveal whether an email exists. Repeated attempts require Turnstile and are rate limited.
- Session revocation and password changes invalidate existing access.
- R2 is private. Anonymous readers cannot list objects or retrieve drafts, future posts or unapproved uploads.
- Every update carries the previously read ETag. A stale ETag returns a conflict for manual resolution.
- Object keys reject traversal, control characters, ambiguous separators and unbounded lengths.
- Uploads enforce request size, decoded size, format and generated names. SVG and active content are excluded initially.
- D1 and R2 preview resources are separate from production. Migrations and imports are repeatable and do not silently delete data.
- Route conflicts, base paths, catch-all routes, an existing authentication system and unsupported Workers APIs stop activation until resolved.
- Failure during migration or deployment leaves the previous website and original content available for rollback.

## Release evidence

Unit tests and local emulators cover validation and denied paths. Release also requires real preview resources proving valid/invalid login, logout, expiry and revocation; anonymous and foreign-user denial; R2 persistence; stale-write conflict handling; draft privacy; upload rejection; public article delivery; the existing website; and rollback. Mocks alone do not establish Cloudflare integration.

