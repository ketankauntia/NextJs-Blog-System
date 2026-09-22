# blog-system-next (alpha)

An npm package for an existing Next.js App Router app. It packages the website's actual Studio components, rich editor, design-system CSS, fonts and blog templates. Content, Board, Editor, Settings, Appearance and Typography use your local data.

**Target:** Node 22.14+, npm, Next >=16.3.3 <16.4, matching React/React DOM 19.x. The consumer suite uses Next 16.3.3 and React 19.2.8; the peer range alone is not proof that every version has been tested.

## Install

```sh
npx --yes blog-system-next@alpha init
npm run dev
```

After publication, `npx blog-system-next init` can be run directly in a new Next.js app: it adds the package to that app automatically, then opens the two-question setup menu.

The registry command above requires publication first. Until then, build with `npm run build:package` and pack with `npm pack ./packages/blog-system-next`. From your consumer app directory, run:

```sh
npx --yes --package="C:/path/to/blog-system-next-0.1.0-alpha.6.tgz" blog-system-next init --package-file="C:/path/to/blog-system-next-0.1.0-alpha.6.tgz"
```

Use the real tarball path in both places. Explicit `--package` prevents Windows from opening the archive as a document. No manual Next/React reinstall or peer-dependency bypass is needed.

The CLI asks only two numbered questions: **1. Blog URL** (default `/blog`) and **2. Content folder** (default `content/blog`). Press Enter to accept both. The publication name defaults to the project folder name; description and author start blank. No sample posts are created and no analytics or telemetry is added.

## First visit

1. Run `npm run dev`.
2. Open `http://localhost:3000/blog`. An empty blog shows **Open Studio**.
3. Use `http://localhost:3000/blog-studio` to manage content. Nested routes are `/board`, `/editor`, `/settings`, `/preview` and `/fonts`.

Settings let you change publication name, description, default author and HTTPS website address. The publication name links to the host homepage. The bundled visual style is enabled by default and can be overridden by host CSS. Local editing writes Markdown and settings into your repository; commit and redeploy to update production.

Local development is the only active dashboard access mode. Email/password hosted login, sessions, post deletion and cloud storage are deferred; no credentials are collected. Raster image uploads (PNG/JPG/WebP/GIF, up to 8 MB) are saved under `public/blog-system-next`; SVG uploads are rejected. Commit those assets alongside your content.

Setup binds the app's `next dev` npm script to `127.0.0.1` for local-only editing. Existing Next flags are retained. Custom script wrappers require manual adjustment before installation. Uninstall restores the previous dev script while retaining unrelated package changes.

The rich editor and Radix controls are regular package dependencies installed by npm. Next and React remain host dependencies. Fonts use the same `next/font` setup as the website and require Google Fonts access during the first build. Tailwind is compiled when the package is built; consumers do not need to scan package files themselves.

## Content and security

Posts live at `<contentPath>/posts/<slug>.md`. Drafts and future posts are private. Frontmatter uses a fixed JSON YAML schema; unsafe links, images, traversal, symlinks, hard links, oversized files, route conflicts and stale revisions are rejected. Studio mutations require a server-only token, loopback origin and bounded JSON requests. Production and hosted environments return 404 for Studio and mutation endpoints.

Run `npx blog-system-next doctor` to verify an installation. Re-running `init` after an update refreshes unchanged installer-owned routes, including their CSS imports, and preserves content/settings. Edited generated files stop the upgrade for manual review. `npx blog-system-next uninstall --dry-run` previews safe removal; edited files and content are preserved.

## License

Custom source-available license. Public blog pages include the required `Powered by nextjsblog.com` link. See LICENSE.
