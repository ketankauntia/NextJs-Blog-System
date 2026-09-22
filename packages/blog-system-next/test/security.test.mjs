import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { defineBlog, contentPath, routePath, safeUrl } from "../dist/config.js";
import { parsePost, editPostSource, isPublished, validSlug, MAX_POST_BYTES } from "../dist/core.js";
import { createStore, readFile, safePath, readSettings, saveSettings } from "../dist/storage.js";
import { authorizeStudio, studioToken, localHeaders, readBody } from "../dist/studio-security.js";
import { withBlog } from "../dist/next.js";
import { inspect, configDefaults, planInstall, applyPlan, doctor, removalPlan, removeInstallation, installationState, upgradeInstallation } from "../bin/installer.mjs";

function fixture(t, { src = false, js = false } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "bsn-security-"));
  t.after(() => { const resolved = path.resolve(root); assert.equal(path.dirname(resolved), path.resolve(os.tmpdir())); assert.ok(path.basename(resolved).startsWith("bsn-security-")); fs.rmSync(resolved, { recursive: true, force: true }); });
  const put = (relative, source) => { const target = path.join(root, relative); fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, source); };
  put("package.json", JSON.stringify({ name: "consumer", private: true, dependencies: { next: "16.3.3", react: "19.2.8", "react-dom": "19.2.8" } }));
  for (const [name, version] of [["next", "16.3.3"], ["react", "19.2.8"], ["react-dom", "19.2.8"]]) put(`node_modules/${name}/package.json`, JSON.stringify({ name, version }));
  const appDir = src ? "src/app" : "app";
  put(`${appDir}/layout.${js ? "jsx" : "tsx"}`, "export default function Layout({children}) { return <html><body>{children}</body></html> }");
  put(`${appDir}/page.${js ? "jsx" : "tsx"}`, "HOST_PAGE_SENTINEL");
  if (!js) put("tsconfig.json", "{}");
  put("next.config.mjs", "export default { poweredByHeader: false };\n");
  return { root, put, appDir };
}

test('route upgrades preserve content and refuse edited generated files', t=>{
 const {root,put}=fixture(t);
 applyPlan(planInstall(inspect(root),configDefaults({},root)));
 assert.equal(upgradeInstallation(root),0);
 put('content/blog/preserved.txt','KEEP');
 put('app/blog-studio/page.tsx','USER EDIT');
 assert.throws(()=>upgradeInstallation(root),/changed or missing/);
 assert.equal(fs.readFileSync(path.join(root,'app/blog-studio/page.tsx'),'utf8'),'USER EDIT');
 assert.equal(fs.readFileSync(path.join(root,'content/blog/preserved.txt'),'utf8'),'KEEP');
});

test('local dev binding survives updates and uninstall preserves unrelated dependency edits',t=>{
 const {root}=fixture(t);
 applyPlan(planInstall(inspect(root),configDefaults({},root)));
 const target=path.join(root,'package.json'),manifest=JSON.parse(fs.readFileSync(target,'utf8'));
 assert.equal(manifest.scripts.dev,'next dev --hostname 127.0.0.1');
 manifest.dependencies['some-user-dependency']='1.0.0';
 fs.writeFileSync(target,JSON.stringify(manifest));
 removeInstallation(root,removalPlan(root));
 const restored=JSON.parse(fs.readFileSync(target,'utf8'));
 assert.equal(restored.dependencies['some-user-dependency'],'1.0.0');
 assert.equal(restored.scripts?.dev,undefined);
});
const markdown = (extra = "", body = "PUBLIC_CONTENT") => `---\ntitle: Test\ndescription: Description\npublishedAt: "2020-01-01"\n${extra}---\n\n${body}`;

test("configuration rejects traversal, public content, Windows paths, device names and overlapping mounts", () => {
  for (const value of ["../outside", "C:/temp", "content/../../secret", "public/blog", "content\\blog", "content/%2e%2e", "content/NUL", "app/blog", "content/.hidden", "content/blog/"]) assert.throws(() => contentPath(value), value);
  for (const value of ["/api/blog", "//evil.com", "/blog?x=y", "/../blog", "/blog/%2f", "/con", "/blog/"]) assert.throws(() => routePath(value), value);
  assert.throws(() => defineBlog({ ...configDefaults(), route: "/blog", studioRoute: "/blog/edit" }));
  assert.throws(() => defineBlog({ ...configDefaults(), analyticsId: "tag" }));
  for (const siteUrl of ["https://user:pass@example.com", "javascript:alert(1)", "https://example.com/path", "https://example.com?x=y", "http://example.com"]) assert.throws(() => defineBlog({ ...configDefaults(), siteUrl }));
});

test("links reject script/data URLs, protocol-relative hosts and control characters", () => {
  for (const value of ["javascript:alert(1)", "data:text/html,x", "//evil.example", "java\nscript:x", "/\\evil.example", "https://user:pass@example.com"]) assert.equal(safeUrl(value), undefined);
  for (const value of ["https://example.com", "/images/post.png", "#section", "mailto:hello@example.com"]) assert.equal(safeUrl(value), value);
  assert.equal(safeUrl("mailto:hello@example.com", true), undefined);
});

test("frontmatter never evaluates code or YAML custom tags; malformed dates/drafts fail closed", () => {
  assert.throws(() => parsePost("test", '---js\n({title: "executed"})\n---\nbody'));
  assert.throws(() => parsePost("test", markdown('author: !!js/function "function() { return 1; }"\n')));
  assert.throws(() => parsePost("test", markdown('draft: "false"\n')));
  for (const date of ["2026-02-30", "2026-09-15T12:00:00", "yesterday", "2026-13-01"]) assert.throws(() => parsePost("test", markdown().replace("2020-01-01", date)), date);
  assert.throws(() => parsePost("test", markdown("", "x".repeat(MAX_POST_BYTES))));
  for (const slug of ["../outside", "a/b", "a%2fb", "NUL", "con", ""] ) assert.equal(validSlug(slug), false);
  assert.equal(isPublished(parsePost("test", markdown("draft: true\n"))), false);
  assert.equal(isPublished(parsePost("test", markdown().replace("2020-01-01", "2999-01-01"))), false);
});

test("public content excludes draft and scheduled bodies in every environment", t => {
  const { root, put } = fixture(t);
  put("content/blog/posts/public.md", markdown());
  put("content/blog/posts/draft.md", markdown("draft: true\n", "PRIVATE_DRAFT_SENTINEL"));
  put("content/blog/posts/future.md", markdown("", "PRIVATE_FUTURE_SENTINEL").replace("2020-01-01", "2999-01-01"));
  const store = createStore(root, configDefaults());
  assert.deepEqual(store.publicPosts().map(p => p.slug), ["public"]);
  assert.ok(!JSON.stringify(store.publicPosts()).includes("PRIVATE_"));
  assert.equal(store.authoringSources().length, 3);
});

test("malformed private metadata errors never contain source text", t => {
  const { root, put } = fixture(t);
  put("content/blog/posts/draft.md", markdown('draft: true\nauthor: !!unknown PRIVATE_METADATA_SENTINEL\n'));
  assert.throws(() => createStore(root, configDefaults()).publicPosts(), error => !error.message.includes("PRIVATE_METADATA_SENTINEL") && error.message.includes("Invalid post metadata"));
});

test("oversized files and active save locks fail without replacing content", t => {
  const { root, put } = fixture(t);
  put("content/blog/posts/large.md", "x".repeat(MAX_POST_BYTES + 1));
  assert.throws(() => createStore(root, configDefaults()).publicPosts(), /size limit/);
  put("content/blog/posts/post.md", markdown());
  put("content/blog/posts/post.md.lock", "active save");
  assert.throws(() => createStore(root, configDefaults()).save("post", markdown(), null), /another save/);
  assert.equal(readFile(root, "content/blog/posts/post.md"), markdown());
});

test("filesystem rejects junctions and hard-linked posts without reading/writing their targets", t => {
  const { root, put } = fixture(t);
  put("private/posts/secret.md", markdown("", "PRIVATE_SECRET"));
  fs.mkdirSync(path.join(root, "content"));
  fs.symlinkSync(path.join(root, "private"), path.join(root, "content/blog"), "junction");
  assert.throws(() => createStore(root, configDefaults()).publicPosts(), /links/);
  put("data/posts/original.md", markdown());
  fs.linkSync(path.join(root, "data/posts/original.md"), path.join(root, "data/posts/linked.md"));
  assert.throws(() => readFile(root, "data/posts/linked.md"), /links/);
  assert.throws(() => safePath(root, "../outside"));
});

test("revision-checked saves reject stale updates, invalid content and existing-file create", t => {
  const { root } = fixture(t), store = createStore(root, configDefaults());
  const revision = store.save("post", markdown(), null);
  assert.throws(() => store.save("post", markdown("", "OVERWRITE"), null), /Conflict/);
  const next = store.save("post", markdown("draft: true\n", "NEW"), revision);
  assert.notEqual(next, revision);
  assert.throws(() => store.save("post", markdown(), revision), /Conflict/);
  assert.throws(() => store.save("../outside", markdown(), null), /slug/);
  assert.throws(() => store.save("post", "invalid", next));
  assert.ok(readFile(root, "content/blog/posts/post.md").includes("NEW"));
});

test("Studio requires explicit local development, loopback host, origin and valid token", t => {
  const names = ["NODE_ENV", "BLOG_SYSTEM_NEXT_STUDIO", "BLOG_SYSTEM_NEXT_STUDIO_TOKEN", "VERCEL", "CI", "NETLIFY"];
  const previous = Object.fromEntries(names.map(n => [n, process.env[n]]));
  t.after(() => { for (const n of names) if (previous[n] === undefined) delete process.env[n]; else process.env[n] = previous[n]; });
  for (const n of names) delete process.env[n];
  process.env.NODE_ENV = "development"; process.env.BLOG_SYSTEM_NEXT_STUDIO = "local";
  process.env.BLOG_SYSTEM_NEXT_STUDIO_TOKEN = "a".repeat(64);
  const request = (overrides = {}) => new Request("http://127.0.0.1:3000/blog-studio/api", { method: "POST", headers: { host: "127.0.0.1:3000", origin: "http://127.0.0.1:3000", "x-blog-studio-token": studioToken(), ...overrides } });
  assert.equal(authorizeStudio(request()), true);
  assert.equal(authorizeStudio(new Request("http://localhost:3000/blog-studio/api", { method: "POST", headers: request().headers })), true);
  assert.equal(authorizeStudio(new Request("http://localhost:4000/blog-studio/api", { method: "POST", headers: request().headers })), false);
  for (const overrides of [{ origin: "https://evil.example" }, { host: "evil.example" }, { "x-blog-studio-token": "x" }, { "x-blog-studio-token": "é".repeat(64) }, { "x-forwarded-for": "203.0.113.1" }, { "sec-fetch-site": "cross-site" }, { forwarded: "host=evil.example" }]) assert.equal(authorizeStudio(request(overrides)), false);
  assert.equal(localHeaders(new Headers({ host: "localhost:3000", "x-forwarded-host": "localhost:3000", "x-forwarded-for": "::1" })), true);
  process.env.NODE_ENV = "production"; assert.equal(authorizeStudio(request()), false);
  process.env.NODE_ENV = "development"; delete process.env.BLOG_SYSTEM_NEXT_STUDIO; assert.equal(authorizeStudio(request()), false);
  process.env.BLOG_SYSTEM_NEXT_STUDIO = "local"; process.env.CI = "true"; assert.equal(authorizeStudio(request()), false);
});

test("streamed request body limits apply even without content-length", async () => {
  const request = new Request("http://localhost", { method: "POST", body: "123456789" });
  await assert.rejects(() => readBody(request, 5), /too large/);
});

test("normal development enables Studio with a server-only token; hosted and production builds do not", t => {
  const { root, put } = fixture(t);
  put("blog-system-next.config.json", JSON.stringify(configDefaults()));
  const names = ["NODE_ENV", "BLOG_SYSTEM_NEXT_STUDIO", "BLOG_SYSTEM_NEXT_STUDIO_TOKEN", "VERCEL", "CI", "NETLIFY"];
  const previous = Object.fromEntries(names.map(name => [name, process.env[name]]));
  t.after(() => { for (const name of names) if (previous[name] === undefined) delete process.env[name]; else process.env[name] = previous[name]; });
  for (const hosted of ["production", "CI", "VERCEL", "NETLIFY", "local"]) {
    for (const name of names) delete process.env[name];
    process.env.NODE_ENV = hosted === "production" ? "production" : "development";
    if (!["production", "local"].includes(hosted)) process.env[hosted] = "true";
    const wrapped = withBlog({}, { root });
    assert.equal(wrapped.env.BLOG_SYSTEM_NEXT_STUDIO_TOKEN, undefined);
    if (hosted === "local") {
      const token = studioToken(); assert.match(token, /^[a-f0-9]{64}$/);
      withBlog({}, { root }); assert.equal(studioToken(), token, "Config reload must preserve the session token");
    } else assert.equal(studioToken(), "");
  }
});

test("dry plan leaves the app unchanged; installation repeats and restores exact Next config", t => {
  const { root, appDir, put } = fixture(t);
  const original = readFile(root, "next.config.mjs");
  const config = configDefaults({ siteUrl: "https://example.com" });
  assert.throws(() => planInstall(inspect(root), config, { sample: true }), /sample/i);
  const plan = planInstall(inspect(root), config);
  assert.equal(fs.existsSync(path.join(root, "blog-system-next.config.json")), false);
  applyPlan(plan);
  assert.equal(readFile(root, `${appDir}/page.tsx`), "HOST_PAGE_SENTINEL");
  assert.equal(doctor(root).posts, 0);
  assert.equal(fs.existsSync(path.join(root, "content/blog/posts")), false);
  put("content/blog/posts/own-post.md", markdown("draft: true\n"));
  assert.equal(planInstall(inspect(root), config).existing, true);
  const remove = removalPlan(root);
  removeInstallation(root, remove);
  assert.equal(readFile(root, "next.config.mjs"), original);
  assert.ok(readFile(root, "content/blog/posts/own-post.md").includes("draft: true"));
});

test("settings use project defaults, reject structural changes, and detect stale or linked writes", t => {
  const { root, put } = fixture(t);
  const config = configDefaults({}, root);
  assert.equal(config.name, path.basename(root));
  assert.equal(config.description, ""); assert.equal(config.author, "");
  applyPlan(planInstall(inspect(root), config));
  const before = readSettings(root, config);
  assert.equal(before.revision, null);
  const input = { ...before.settings, name: "Acme", siteUrl: "https://example.com" };
  const saved = saveSettings(root, config, input, null);
  assert.equal(readSettings(root, config).config.name, "Acme");
  assert.equal(doctor(root).siteUrlConfigured, true);
  assert.throws(() => saveSettings(root, config, input, null), /Conflict/);
  for (const change of [{ contentPath: "../secret" }, { route: "/other" }, { studio: false }, { analyticsId: "G-SECRET" }, { siteUrl: "javascript:alert(1)" }]) {
    assert.throws(() => saveSettings(root, config, { ...input, ...change }, saved.revision));
  }
  put("content/blog/settings.json.lock", "busy");
  assert.throws(() => saveSettings(root, config, input, saved.revision), /Conflict/);
  const { root: other, put: otherPut } = fixture(t);
  otherPut("outside.json", "{}"); fs.mkdirSync(path.join(other, "content/blog"), { recursive: true });
  fs.linkSync(path.join(other, "outside.json"), path.join(other, "content/blog/settings.json"));
  assert.throws(() => readSettings(other, config), /links/);
  assert.throws(() => saveSettings(other, config, input, null), /links/);
  assert.equal(readFile(root, "blog-system-next.config.json").includes("Acme"), false);
});

test("structured editor preserves existing metadata and rejects injected or empty fields", () => {
  const fields = { title: "Changed", description: "Updated preview", publishedAt: "2020-01-01", author: "", draft: true, body: "New story" };
  const source = editPostSource("existing", fields, markdown("category: Engineering\ntags: [testing]\nnoindex: true\n"));
  const post = parsePost("existing", source, "Acme");
  assert.equal(post.category, "Engineering"); assert.deepEqual(post.tags, ["testing"]);
  assert.equal(post.noindex, true); assert.equal(post.author, "Acme"); assert.equal(post.draft, true);
  assert.throws(() => editPostSource("new", { ...fields, body: " " }));
  assert.throws(() => editPostSource("new", { ...fields, draft: "false" }));
  assert.throws(() => editPostSource("new", { ...fields, source: "injected" }));
});

test("src/app and JavaScript installations generate relative imports and preserve host pages", t => {
  const { root } = fixture(t, { src: true, js: true });
  applyPlan(planInstall(inspect(root), configDefaults({ route: "/team/journal", studio: false })));
  assert.ok(readFile(root, "src/app/team/journal/[[...path]]/page.jsx").includes('"../../../blog-system-next.server"'));
  assert.ok(readFile(root, "src/app/blog-system-next.server.js").includes('"../../blog-system-next.config.json"'));
  assert.equal(fs.existsSync(path.join(root, "src/app/blog-studio")), false);
});

for (const conflicting of ["app/blog/page.tsx", "app/(marketing)/blog/page.tsx", "app/[slug]/page.tsx", "app/[[...catchall]]/page.tsx", "app/blog/route.ts", "app/@slot/blog/page.tsx"]) {
  test(`route ownership conflict preserves ${conflicting}`, t => {
    const { root, put } = fixture(t); put(conflicting, "EXISTING");
    assert.throws(() => planInstall(inspect(root), configDefaults()), /Route conflict/);
    assert.equal(readFile(root, conflicting), "EXISTING");
    assert.equal(fs.existsSync(path.join(root, ".blog-system-next-install.json")), false);
  });
}

test("failed mid-install conflict rolls back created files and preserves the competing edit", t => {
  const { root, put } = fixture(t);
  const plan = planInstall(inspect(root), configDefaults());
  put("blog-system-next.config.json", "CONCURRENT_EDIT");
  assert.throws(() => applyPlan(plan), /EEXIST/);
  assert.equal(readFile(root, "blog-system-next.config.json"), "CONCURRENT_EDIT");
  assert.equal(fs.existsSync(path.join(root, "app/blog-system-next.server.ts")), false);
  assert.equal(fs.existsSync(path.join(root, ".blog-system-next-install.lock")), false);
});

test("uninstall refuses edited Next config and preserves modified generated files", t => {
  const { root, put } = fixture(t);
  applyPlan(planInstall(inspect(root), configDefaults()));
  put("app/blog/[[...path]]/page.tsx", "USER_EDIT");
  assert.ok(removalPlan(root).preserved.includes("app/blog/[[...path]]/page.tsx"));
  put("next.config.mjs", "USER_NEXT_EDIT");
  assert.throws(() => removalPlan(root), /edited/);
  assert.equal(readFile(root, "next.config.mjs"), "USER_NEXT_EDIT");
});

test("tampered recovery journal cannot target files outside generated integration", t => {
  const { root, put } = fixture(t);
  applyPlan(planInstall(inspect(root), configDefaults()));
  const state = installationState(root);
  state.changes[0].file = "../private.txt";
  put(".blog-system-next-install.json", JSON.stringify(state));
  assert.throws(() => removalPlan(root), /Unsafe/);
});

test("incompatible versions and non-npm projects fail without modifying locks", t => {
  const { root, put } = fixture(t);
  put("pnpm-lock.yaml", "KEEP_LOCK");
  assert.throws(() => inspect(root), /npm/);
  assert.equal(readFile(root, "pnpm-lock.yaml"), "KEEP_LOCK");
  fs.unlinkSync(path.join(root, "pnpm-lock.yaml"));
  put("node_modules/next/package.json", JSON.stringify({ name: "next", version: "15.0.0" }));
  assert.throws(() => inspect(root), /verified/);
});

test("unsupported cjs config and interrupted installer locks stop before writes", t => {
  const { root, put } = fixture(t);
  put("next.config.cjs", "module.exports = {}");
  assert.throws(() => inspect(root), /does not load/);
  fs.unlinkSync(path.join(root, "next.config.cjs"));
  put(".blog-system-next-install.lock", "interrupted");
  assert.throws(() => planInstall(inspect(root), configDefaults()), /lock exists/);
  assert.equal(fs.existsSync(path.join(root, "blog-system-next.config.json")), false);
});

test("Next wrapper preserves host config/traces and refuses unsupported production setups", t => {
  const { root, put } = fixture(t);
  put("blog-system-next.config.json", JSON.stringify(configDefaults({ siteUrl: "https://example.com" })));
  const original = { poweredByHeader: false, basePath: "/docs", outputFileTracingIncludes: { "/*": ["./host.json"] }, env: { HOST_SETTING: "keep" } };
  const next = withBlog(original, { root });
  assert.equal(next.basePath, "/docs"); assert.equal(next.env.HOST_SETTING, "keep");
  assert.equal(next.env.BLOG_SYSTEM_NEXT_BASE_PATH, "/docs");
  assert.ok(next.outputFileTracingIncludes["/*"].includes("./host.json"));
  assert.deepEqual(original.outputFileTracingIncludes["/*"], ["./host.json"]);
  assert.throws(() => withBlog({ output: "export" }, { root }), /static export/);
  assert.throws(() => withBlog({ cacheComponents: true }, { root }), /cacheComponents/);
});
