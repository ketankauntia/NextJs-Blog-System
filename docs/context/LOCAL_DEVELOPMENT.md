# Run and validate locally

Updated 2026-09-10. Repository: C:/Users/KIIT/Desktop/personal-projects/blog-system-next.

```powershell
npm run dev -- --hostname 127.0.0.1 --port 3000
```

Open http://localhost:3000/dashboard/setup and /dashboard/editor. The development Studio writes Markdown; production Studio stays read-only. With no publishing.json, posts/settings use `content`. A Local publishing.json can choose another repository-relative `contentPath`. Prepare that directory and copy existing data without overwriting before switching. Restart after config changes. Git commits/pushes remain explicit.

Run:

```powershell
npm run test:publishing
npm run test:content
npm run validate
```

Validation runs lint, type checking, content audit and a production build. Before building, stop only this project's identified development process. Avoid concurrent dev/build against the same output directory. To smoke-test the production result use `npm run start -- --hostname 127.0.0.1 --port 3000`; restore development afterwards for local writing.

No cloud credentials are required for local validation. Provider integrations are not active. Historical database tests require the separate uncommitted PGlite/database scaffolding; they are not a prerequisite for the basic setup configuration.
