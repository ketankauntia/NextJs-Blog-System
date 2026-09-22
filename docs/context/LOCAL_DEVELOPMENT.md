# Run and validate locally

From the application repository root:

```sh
npm install
npm run dev
```

Open the deployed `/docs`, `/docs#get-started` or `/dashboard/editor` routes (or the local origin shown by Next.js). Development Studio writes Markdown; production Studio is read-only. Without publishing.json, posts/settings use `content`. A Local configuration can choose another repository-relative contentPath. Copy existing data without overwriting before switching, and restart after configuration changes. Public image URLs remain unchanged.

```sh
npm run test:publishing
npm run test:content
npm run validate
```

Validation runs lint, types, content audit and production build. Stop this project's development process before building. Use `npm run start` for a production smoke test, then restore development for local writing. Do not run dev/build against the same output directory simultaneously.

Local validation requires no cloud account. Provider integrations are not active; see CURRENT_STATE.md.

## npm package development

```sh
npm run test:package
npm run test:package:consumer
npm pack ./packages/blog-system-next
```

The consumer tests use separate apps and local servers, never the website's `.next` directory. They install the packed artifact with lifecycle scripts disabled. For reuse of a local test cache, set `BSN_CONSUMER_ROOT` to a dedicated disposable directory outside this repository. See the [package README](../../packages/blog-system-next/README.md) for setup, recovery and deployment limits.

`npm run test:package:onboarding` tests the packed package in a real browser after the consumer suite. Set `BSN_CONSUMER_ROOT` to that suite's artifact folder, `BSN_PLAYWRIGHT_MODULE` to an external installation of `playwright`, and `BSN_BROWSER_PATH` to a Chrome/Chromium executable. It checks empty production builds, private Studio access, desktop/mobile welcome layouts, settings, draft/publish, unsaved changes, and homepage navigation; screenshots and logs stay outside the repository. Browser tooling is not a package dependency.
