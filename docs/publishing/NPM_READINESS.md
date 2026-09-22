# npm release readiness

The root repository is a Next.js application and source-integration starter. A separate, locally packable alpha now lives in [`packages/blog-system-next`](../../packages/blog-system-next/README.md), with typed exports, an explicit CLI, a local Markdown Studio, and packed-consumer tests. It has not been published to the registry. The root manifest stays `private: true` to prevent publication of the full website; the existing source-available license is preserved.

The alpha targets npm, the documented Next/React versions, Node App Router runtime, private local content folders and scoped publication styles. Alpha.6 packages the actual OSS dashboard/editor/templates, excludes website analytics and demo identity, and refreshes unchanged generated routes on init. Wider router/runtime/version coverage and content or edited-route migrations remain release work. Passing build/unit checks alone does not establish visual or interaction parity; run the browser suite against the packed artifact.

## Package boundary to implement

- Keep the product website, documentation, example publication and demo content in the application.
- Extract reusable content parsing, schemas, validation and storage contracts behind explicit typed exports. Accept an app/content root rather than relying on the consuming process's working directory or this app's `@/` aliases.
- Expose Next.js integration separately from the content engine. Define route, metadata, asset and Studio mounting contracts; remove hardcoded `/blog` and `/dashboard` assumptions. Keep server credentials and filesystem code out of client imports.
- Provide an explicit installer command with a preview of changes, target-workspace detection, conflict checks and repeatable upgrades. Do not modify projects through install-time lifecycle scripts. A fresh starter and an existing-app integration must take different paths.
- Keep Next/React compatibility explicit with verified peer dependency ranges. Preserve the consumer's package manager and lockfile. Registry distribution will start with npm; validate installation from the same tarball with other package managers before claiming support.

## Release gates

1. Finish and test the promised local integration first. Remote email/password and GitHub/Supabase/R2 runtime adapters remain unimplemented; do not advertise them as shipped until real persistence and authorization tests pass.
2. Exercise consumer fixtures: fresh app, existing App Router app, `src/app`, monorepo, occupied blog/Studio/login routes, existing auth and CMS, custom base path, incompatible router/runtime, dirty checkout, and a repeated installation. Verify original pages, content, sessions and deploy scripts survive.
3. Add the package manifest, exports, TypeScript declarations, license, README, supported engines and an explicit `files` allowlist. Review the chosen npm name and ownership before release. Do not publish under an assumed available name.
4. Run `npm pack --dry-run --json` against the package directory and inspect the file list. Build a local tarball and install it into clean consumer fixtures. Ensure no private notes, secrets, `.next`, demo posts or unintended server code are shipped.
5. Verify build, types, public/draft isolation, local writing, production guards, upgrade/retry behavior and uninstall/rollback from the packed artifact. Source-repository tests alone do not prove an npm package works.
6. Publish only after the development gates pass and publication is authorized. Nothing in this document or the setup guide performs an npm release.

Manifest behavior and pack inspection follow the official [npm package.json reference](https://docs.npmjs.com/cli/v11/configuring-npm/package-json/) and [npm pack reference](https://docs.npmjs.com/cli/v11/commands/npm-pack/).
