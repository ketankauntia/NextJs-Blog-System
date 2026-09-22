import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { spawn, spawnSync } from "node:child_process";
import net from "node:net";
import { randomBytes, createHash } from "node:crypto";

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const workspace = process.env.BSN_CONSUMER_ROOT ? path.resolve(process.env.BSN_CONSUMER_ROOT) : fs.mkdtempSync(path.join(os.tmpdir(), "bsn-consumers-"));
const npm = process.env.npm_execpath ?? path.join(path.dirname(process.execPath), "node_modules/npm/bin/npm-cli.js");
const cache = path.join(workspace, ".npm-cache");
const runId = Date.now();
const env = { ...process.env, NEXT_TELEMETRY_DISABLED: "1", npm_config_cache: cache, npm_config_fetch_retries: "0", npm_config_fetch_timeout: "20000" };
delete env.BLOG_SYSTEM_NEXT_STUDIO;
delete env.BLOG_SYSTEM_NEXT_STUDIO_TOKEN;
fs.mkdirSync(workspace, { recursive: true });
console.log(`Consumer artifacts: ${workspace}`);

function run(script, args, cwd = workspace) {
  const result = spawnSync(process.execPath, [script, ...args], { cwd, env, encoding: "utf8", timeout: 240000, maxBuffer: 12 * 1024 * 1024, windowsHide: true });
  if (result.status !== 0) throw new Error(`${script} ${args.join(" ")} failed:\n${result.stdout}\n${result.stderr}\n${result.error ?? ""}`);
  return result.stdout;
}
run(path.join(repo, "scripts/build-package.mjs"), [], repo);
const packed = JSON.parse(run(npm, ["pack", path.join(repo, "packages/blog-system-next"), "--pack-destination", workspace, "--json", "--ignore-scripts"]));
const version = JSON.parse(fs.readFileSync(path.join(repo, "packages/blog-system-next/package.json"), "utf8")).version;
const tarball = path.join(workspace, `blog-system-next-${version}-${packed[0].shasum.slice(0, 12)}.tgz`);
fs.copyFileSync(path.join(workspace, packed[0].filename), tarball);
assert.ok(packed[0].files.every(f => /^(dist\/|bin\/|LICENSE$|README\.md$|package\.json$)/.test(f.path)));
fs.writeFileSync(path.join(workspace, "package.json"), JSON.stringify({ name: "blog-package-consumer-tests", private: true, workspaces: [`fixtures/*-${runId}`], dependencies: { next: "16.3.3", react: "19.2.8", "react-dom": "19.2.8", "blog-system-next": `file:${tarball.replaceAll("\\", "/")}` }, devDependencies: { typescript: "^5", "@types/node": "^22", "@types/react": "^19" } }, null, 2));
console.log(run(npm, ["install", "--ignore-scripts", "--no-audit", "--no-fund", "--prefer-offline"]));
const installed = path.join(workspace, "node_modules/blog-system-next");
for (const file of packed[0].files.filter(f => /\.(js|mjs|json|css)$/.test(f.path))) {
  const source = fs.readFileSync(path.join(installed, file.path), "utf8");
  assert.doesNotMatch(source, /G-[A-Z0-9]{6,}|GTM-[A-Z0-9]+|googletagmanager\.com|@vercel\/analytics|kauntiaketan|ketankauntia/);
}
const cli = path.join(installed, "bin/cli.mjs");
const next = path.join(workspace, "node_modules/next/dist/bin/next");
function put(root, relative, source) { const target = path.join(root, relative); fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, source); }
const md = (extra = "", body = "Public fixture content.") => `---\ntitle: "Public fixture"\ndescription: "Consumer test article"\npublishedAt: "2020-01-01"\ncategory: Engineering\ntags: [testing]\n${extra}---\n\n## Introduction\n\n${body}\n`;
async function freePort() { const server = net.createServer(); await new Promise(resolve => server.listen(0, "127.0.0.1", resolve)); const port = server.address().port; await new Promise(resolve => server.close(resolve)); return port; }
async function start(cwd, mode, local = false) {
  const port = await freePort(), origin = `http://127.0.0.1:${port}`;
  const child = spawn(process.execPath, [next, mode, "--hostname", "127.0.0.1", "--port", String(port)], { cwd, env: { ...env, ...(local ? { BLOG_SYSTEM_NEXT_STUDIO: "local", BLOG_SYSTEM_NEXT_STUDIO_TOKEN: randomBytes(32).toString("hex") } : {}) }, windowsHide: true });
  let log = ""; child.stdout.on("data", data => { log += data; }); child.stderr.on("data", data => { log += data; });
  const deadline = Date.now() + 60000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error(`Server exited: ${log}`);
    try { await fetch(origin, { signal: AbortSignal.timeout(1500) }); return { child, origin, log: () => log }; } catch { await new Promise(resolve => setTimeout(resolve, 250)); }
  }
  child.kill(); throw new Error(`Server did not start: ${log}`);
}
async function stop(child) {
  if (child.exitCode !== null) return;
  const exited = new Promise(resolve => child.once("exit", resolve)); child.kill(); await exited;
}
async function get(origin, route, expected = 200) { const response = await fetch(origin + route, { signal: AbortSignal.timeout(60000) }); const text = await response.text(); assert.equal(response.status, expected, `${route}: ${text.slice(0, 500)}`); return text; }

for (const fixture of [{ name: "fresh-typescript", app: "app", ext: "tsx", config: "ts", base: "", mount: "/blog" }, { name: "existing-javascript", app: "src/app", ext: "jsx", config: "js", base: "/docs", mount: "/team/journal" }]) {
  const root = path.join(workspace, "fixtures", fixture.name + "-" + runId);
  put(root, "package.json", JSON.stringify({ name: path.basename(root), private: true, scripts: { build: "next build --webpack" }, dependencies: { "blog-system-next": version, next: "16.3.3", react: "19.2.8", "react-dom": "19.2.8" } }));
  const type = fixture.ext === "tsx" ? ": { children: React.ReactNode }" : "";
  put(root, `${fixture.app}/layout.${fixture.ext}`, `export default function Layout({children}${type}) { return <html lang="en"><body><div id="host-header">HOST_HEADER_SENTINEL</div>{children}</body></html>; }`);
  put(root, `${fixture.app}/page.${fixture.ext}`, "export default function Home() { return <main>HOST_PAGE_SENTINEL</main>; }");
  put(root, `${fixture.app}/account/page.${fixture.ext}`, "export default function Account() { return <main>HOST_ACCOUNT_SENTINEL</main>; }");
  const originalConfig = `${fixture.config === "js" ? "module.exports =" : "export default"} { poweredByHeader: false, basePath: ${JSON.stringify(fixture.base)} };\n`;
  put(root, `next.config.${fixture.config}`, originalConfig);
  if (fixture.ext === "tsx") put(root, "tsconfig.json", JSON.stringify({ compilerOptions: { target: "ES2022", lib: ["dom", "esnext"], strict: true, skipLibCheck: true, noEmit: true, esModuleInterop: true, module: "esnext", moduleResolution: "bundler", resolveJsonModule: true, jsx: "react-jsx", plugins: [{ name: "next" }] }, include: ["**/*.ts", "**/*.tsx", ".next/types/**/*.ts"], exclude: ["node_modules"] }));
  const options = ["init", "--cwd", root, "--yes", "--route", fixture.mount];
  run(cli, [...options, "--dry-run"]);
  assert.equal(fs.existsSync(path.join(root, "blog-system-next.config.json")), false);
  run(cli, options);
  assert.equal(fs.existsSync(path.join(root, "content/blog/posts")), false, "Installer must never create a sample post");
  const installedConfig = JSON.parse(fs.readFileSync(path.join(root, "blog-system-next.config.json"), "utf8"));
  assert.equal(installedConfig.name, path.basename(root));
  put(root, "content/blog/settings.json", JSON.stringify({ name: "Consumer publication", author: "Consumer author", description: "", siteUrl: "https://example.com", theme: "default" }));
  put(root, "content/blog/posts/public.md", md("", '**Bold** and [unsafe](javascript:alert)\n\n<script>alert("XSS_SENTINEL")</script>\n\n![unsafe](javascript:alert)'));
  put(root, "content/blog/posts/draft.md", md("draft: true\n", "PRIVATE_DRAFT_SENTINEL"));
  put(root, "content/blog/posts/future.md", md("", "PRIVATE_FUTURE_SENTINEL").replace("2020-01-01", "2999-01-01"));
  put(root, "content/blog/posts/unlisted.md", md("noindex: true\n"));
  const before = fs.readFileSync(path.join(root, `${fixture.app}/page.${fixture.ext}`), "utf8");
  assert.match(run(cli, options), /Already installed/);
  assert.equal(fs.readFileSync(path.join(root, `${fixture.app}/page.${fixture.ext}`), "utf8"), before);
  console.log(`Building packed consumer: ${fixture.name}`);
  console.log(run(next, ["build", "--webpack"], root));
  const server = await start(root, "start");
  try {
    const mount = fixture.base + fixture.mount;
    assert.match(await get(server.origin, fixture.base || "/"), /HOST_PAGE_SENTINEL/);
    assert.match(await get(server.origin, fixture.base + "/account"), /HOST_ACCOUNT_SENTINEL/);
    for (const suffix of ["", "/post/public", "/rss.xml", "/sitemap.xml", "/search.json", "/llms.txt", "/raw/public", "/category/engineering", "/tag/testing", "/author/consumer-author"]) {
      const html = await get(server.origin, mount + suffix);
      assert.doesNotMatch(html, /PRIVATE_DRAFT_SENTINEL|PRIVATE_FUTURE_SENTINEL|googletagmanager\.com|G-[A-Z0-9]{6,}/, suffix);
      if (suffix === "/post/public") { assert.ok(html.includes("https://example.com" + mount + "/post/public")); assert.doesNotMatch(html, /<script>alert|href="javascript:/); assert.match(html, /Powered by nextjsblog\.com/); assert.match(html, /<strong>Bold<\/strong>/); }
      if (suffix === "/sitemap.xml") assert.ok(!html.includes("/post/unlisted"));
    }
    for (const suffix of ["/post/draft", "/post/future", "/raw/draft", "/raw/future", "/unknown", "?page=999"]) await get(server.origin, mount + suffix, 404);
    const studioPage = await get(server.origin, fixture.base + "/blog-studio", 404); assert.doesNotMatch(studioPage, /PRIVATE_/);
    for (const screen of ["board", "editor", "settings", "preview", "fonts"]) await get(server.origin, fixture.base + `/blog-studio/${screen}`, 404);
    const denied = await fetch(server.origin + fixture.base + "/blog-studio/api", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ slug: "attack", source: md(), revision: null }) });
    assert.equal(denied.status, 404);
    const page = await get(server.origin, mount);
    const css = [...page.matchAll(/href="([^"]+\.css[^\"]*)"/g)].map(m => m[1]);
    assert.ok(css.length > 0); assert.ok((await Promise.all(css.map(file => get(server.origin, file)))).some(text => text.includes(".bsn")));
    console.log(`${fixture.name}: production routes, SEO, CSS, host preservation, and privacy passed.`);
  } finally { fs.writeFileSync(path.join(root, "production-test.log"), server.log()); await stop(server.child); }
  if (!fixture.base) {
    const server = await start(root, "dev", true);
    try {
      const html = await get(server.origin, "/blog-studio");
      assert.match(html, /PRIVATE_DRAFT_SENTINEL/);
      for (const screen of ["board", "editor", "settings", "preview", "fonts"]) await get(server.origin, `/blog-studio/${screen}`);
      const token = html.match(/token\\?":\\?"([a-f0-9]{64})/i)?.[1];
      assert.ok(token, "Studio token missing from server-rendered props");
      const save = (body, extra = {}) => fetch(server.origin + "/blog-studio/api", { method: "POST", headers: { "content-type": "application/json", origin: server.origin, "x-blog-studio-token": token, ...extra }, body: JSON.stringify(body) });
      const settingsSource = fs.readFileSync(path.join(root, "content/blog/settings.json"), "utf8");
      const settings = { ...JSON.parse(settingsSource), name: "Updated publication" };
      const settingsRevision = createHash("sha256").update(settingsSource).digest("hex");
      const settingsRequest = { action: "settings", settings, revision: settingsRevision };
      assert.equal((await save(settingsRequest, { origin: "https://evil.example" })).status, 404);
      assert.equal((await save(settingsRequest, { "x-blog-studio-token": "invalid" })).status, 404);
      assert.equal((await save({ ...settingsRequest, settings: { ...settings, contentPath: "../outside" } })).status, 400);
      assert.equal((await save({ ...settingsRequest, revision: null })).status, 409);
      assert.equal((await save(settingsRequest)).status, 200);
      assert.match(await get(server.origin, "/blog/rss.xml"), /Updated publication/);
      assert.equal((await save({ slug: "forbidden", source: md(), revision: null }, { origin: "https://evil.example" })).status, 404);
      const first = await save({ slug: "local-save", source: md("draft: true\n", "LOCAL_SAVE_SENTINEL"), revision: null });
      assert.equal(first.status, 200, await first.clone().text()); const saved = await first.json();
      assert.equal((await save({ slug: "local-save", source: md(), revision: null })).status, 409);
      assert.equal((await save({ slug: "../outside", source: md(), revision: null })).status, 400);
      assert.equal((await save({ slug: "local-save", source: md("draft: true\n", "UPDATED_LOCAL_SENTINEL"), revision: saved.revision })).status, 200);
      assert.ok(fs.readFileSync(path.join(root, "content/blog/posts/local-save.md"), "utf8").includes("UPDATED_LOCAL_SENTINEL"));
      await get(server.origin, "/blog/post/local-save", 404);
      console.log("Local Studio: real HTTP save, stale conflict, traversal and cross-origin rejection passed.");
    } finally { fs.writeFileSync(path.join(root, "studio-test.log"), server.log()); await stop(server.child); }
  }
  run(cli, ["uninstall", "--cwd", root, "--yes"]);
  assert.equal(fs.readFileSync(path.join(root, `next.config.${fixture.config}`), "utf8"), originalConfig);
  assert.ok(fs.existsSync(path.join(root, "content/blog/posts/draft.md")));
  console.log(`${fixture.name}: uninstall restored config and kept content.`);
}
fs.writeFileSync(path.join(workspace, "verification.json"), JSON.stringify({ passed: true, tarball, date: new Date().toISOString(), fixtures: ["fresh-typescript", "existing-javascript"] }, null, 2));
console.log(`All packed consumer checks passed. Tarball: ${tarball}`);
