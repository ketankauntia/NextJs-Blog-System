# Run and validate locally

From the application repository root:

```sh
npm install
npm run dev
```

Open `http://localhost:3000/docs`, `/dashboard/setup` or `/dashboard/editor`. Development Studio writes Markdown; production Studio is read-only. Without publishing.json, posts/settings use `content`. A Local configuration can choose another repository-relative contentPath. Copy existing data without overwriting before switching, and restart after configuration changes. Public image URLs remain unchanged.

```sh
npm run test:publishing
npm run test:content
npm run validate
```

Validation runs lint, types, content audit and production build. Stop this project's development process before building. Use `npm run start` for a production smoke test, then restore development for local writing. Do not run dev/build against the same output directory simultaneously.

Local validation requires no cloud account. Provider integrations are not active; see CURRENT_STATE.md.
