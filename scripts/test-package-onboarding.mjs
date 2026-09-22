import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { spawn, spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import net from "node:net";

// Run after test:package:consumer. Browser tooling stays outside package dependencies.
const workspace = path.resolve(process.env.BSN_CONSUMER_ROOT);
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.BSN_PLAYWRIGHT_MODULE);
const browser = await chromium.launch({ executablePath: process.env.BSN_BROWSER_PATH, headless: true });
const root = path.join(workspace, "onboarding", String(Date.now()), "acme");
const artifacts = path.join(root, "screenshots");
fs.mkdirSync(artifacts, { recursive: true });
const put = (name, text) => { const file = path.join(root, name); fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, text); };
const env = { ...process.env, NEXT_TELEMETRY_DISABLED: "1" };
delete env.BLOG_SYSTEM_NEXT_STUDIO; delete env.BLOG_SYSTEM_NEXT_STUDIO_TOKEN;
const next = path.join(workspace, "node_modules/next/dist/bin/next");
const cli = path.join(workspace, "node_modules/blog-system-next/bin/cli.mjs");
function run(file, args) {
  const result = spawnSync(process.execPath, [file, ...args], { cwd: root, env, encoding: "utf8", timeout: 240000, windowsHide: true });
  assert.equal(result.status, 0, result.stdout + result.stderr); return result.stdout;
}
async function start(mode, studio = false) {
  const socket = net.createServer(); await new Promise(resolve => socket.listen(0, "127.0.0.1", resolve));
  const port = socket.address().port; await new Promise(resolve => socket.close(resolve));
  const origin = `http://127.0.0.1:${port}`;
  const studioToken = studio ? randomBytes(32).toString("hex") : null;
  const child = spawn(process.execPath, [next, mode, "--hostname", "127.0.0.1", "--port", String(port)], { cwd: root, env: { ...env, ...(studio ? { BLOG_SYSTEM_NEXT_STUDIO: "local", BLOG_SYSTEM_NEXT_STUDIO_TOKEN: studioToken } : {}) }, windowsHide: true });
  let log = ""; child.stdout.on("data", data => { log += data; }); child.stderr.on("data", data => { log += data; });
  for (let attempts = 0; attempts < 100; attempts++) {
    try { await fetch(origin, { signal: AbortSignal.timeout(1000) }); return { child, origin, studioToken, log: () => log }; }
    catch { if (child.exitCode !== null) throw new Error(log); await new Promise(resolve => setTimeout(resolve, 300)); }
  }
  child.kill(); throw new Error(log);
}
async function stop(server, name) {
  fs.writeFileSync(path.join(root, `${name}.log`), server.log());
  if (server.child.exitCode !== null) return;
  const exited = new Promise(resolve => server.child.once("exit", resolve)); server.child.kill(); await exited;
}
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = []; page.on("pageerror", error => errors.push(error.message));
page.on("console", message => { if (message.type() === "error" || /hydration/i.test(message.text())) errors.push(`console ${message.type()}: ${message.text()}`); });
async function visible(locator) { await locator.waitFor({ state: "visible" }); }
async function noHorizontalOverflow() { assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), "Horizontal overflow"); }
async function screenshot(name) { await page.evaluate(() => document.fonts?.ready); await page.screenshot({ path: path.join(artifacts, name + ".png"), fullPage: true, caret: "initial" }); }
let active;
try {
  put("package.json", JSON.stringify({ name: "acme", private: true, dependencies: { next: "16.3.3", react: "19.2.8", "react-dom": "19.2.8", "blog-system-next": "0.1.0-alpha.6" } }));
  put("app/layout.jsx", 'import "./globals.css"; export default function Layout({children}) { return <html lang="en"><body><header className="host-header">ACME WEBSITE</header>{children}</body></html> }');
  put("app/globals.css", '*{box-sizing:border-box}html{height:100%}body{min-height:100%;display:flex;flex-direction:column;margin:0;color:#171717;background:#fafafa;font-family:Arial,sans-serif}h1,h2,p{margin:0}button,input,textarea,select{font:inherit}.host-header{flex:none;height:48px;padding:16px 24px;border-bottom:1px solid #eee;font-size:11px;letter-spacing:2px}');
  put("app/page.jsx", 'export default function Home(){return <main>HOST HOMEPAGE</main>}');
  put("next.config.mjs", "export default { devIndicators: false };\n");
  const output = run(cli, ["init", "--yes"]);
  assert.match(output, /1\. Run: npm run dev/);
  assert.doesNotMatch(output, /Apply these changes/);
  assert.equal(fs.existsSync(path.join(root, "content/blog/posts")), false);
  assert.equal(JSON.parse(fs.readFileSync(path.join(root, "blog-system-next.config.json"))).name, "acme");
  const rejected = spawnSync(process.execPath, [cli, "init", "--sample", "--yes"], { cwd: root, env, encoding: "utf8", windowsHide: true });
  assert.notEqual(rejected.status, 0);

  console.log("Building an empty installation without a domain...");
  run(next, ["build", "--webpack"]);
  active = await start("start");
  await page.goto(active.origin + "/blog");
  await visible(page.getByRole("heading", { name: "Good things are on the way." }));
  assert.equal(await page.getByRole("link", { name: "Open Studio" }).count(), 0);
  assert.match(await page.locator('meta[name="robots"]').getAttribute("content"), /noindex/);
  assert.equal((await fetch(active.origin + "/blog/rss.xml")).status, 503);
  assert.equal((await fetch(active.origin + "/blog-studio")).status, 404);
  assert.equal((await fetch(active.origin + "/blog-studio/api", { method: "POST" })).status, 404);
  await stop(active, "production"); active = null;

  active = await start("dev", true);
  await page.goto(active.origin + "/blog");
  await visible(page.getByRole("heading", { name: "Your blog starts here." }));
  assert.equal(await page.locator(".bsn-brand").count(), 0, "Empty welcome intentionally has no navbar");
  for (const [name, width, height] of [["welcome-desktop", 1440, 900], ["welcome-mobile", 390, 844], ["welcome-small", 375, 667]]) {
    await page.setViewportSize({ width, height });
    await page.waitForFunction(() => document.documentElement.scrollHeight <= innerHeight + 1);
    assert.equal(await page.locator(".bsn-onboarding").evaluate(el => Math.round(el.getBoundingClientRect().width)), width - 8);
    await noHorizontalOverflow(); await screenshot(name);
  }
  await page.getByRole("link", { name: "Open Studio" }).click();
  await visible(page.getByRole("heading", { name: "Content" }));
  assert.equal((await fetch(active.origin + "/blog-studio/api", { method: "POST" })).status, 404);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(active.origin + "/blog-studio");
  await visible(page.getByRole("heading", { name: "Content" }));
  await screenshot("studio-overview");
  await page.getByRole("link", { name: "Settings", exact: true }).click();
  await page.locator('button').filter({ hasText: "Publication" }).first().click();
  assert.equal(await page.getByLabel(/^Publication name/).inputValue(), "acme");
  assert.equal(await page.getByLabel(/^Description/).inputValue(), "");
  assert.equal(await page.getByLabel(/^Default author/).inputValue(), "");
  await page.getByLabel(/^Publication name/).fill("Acme Journal");
  await page.getByLabel(/^Website address/).fill("https://example.com");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await visible(page.getByText("Saved. Your settings are now active."));
  await screenshot("studio-settings");
  assert.match(await (await fetch(active.origin + "/blog")).text(), /Acme Journal/);
  assert.equal((await fetch(active.origin + "/blog/rss.xml")).status, 200);

  await page.getByRole("link", { name: "Settings", exact: true }).click();
  await visible(page.getByRole("heading", { name: /Settings/i }));
  await page.locator('nav[aria-label="Settings categories"] button').first().click();
  const template = page.locator('main button[aria-pressed="false"]').first();
  await template.click();
  const settingsSave = page.getByRole("button", { name: "Save", exact: true });
  if (!await settingsSave.isDisabled()) { await settingsSave.click(); await visible(page.getByText(/Saved/)); }
  await page.locator('nav[aria-label="Settings categories"] button').nth(1).click();
  await page.getByLabel(/^Publication name/).fill("Acme Journal Updated");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await visible(page.getByText("Saved. Your settings are now active."));
  await page.getByRole("navigation", { name: "Studio navigation" }).getByRole("link", { name: "Typography", exact: true }).click();
  await page.locator("[data-font] h2").first().waitFor({ state: "visible" });
  const fontSamples = await page.locator("[data-font] h2").evaluateAll((heads) => heads.map((heading) => ({ pairing: heading.parentElement?.getAttribute("data-font"), heading: getComputedStyle(heading).fontFamily, body: getComputedStyle(heading.parentElement?.querySelector("p") ?? heading).fontFamily })));
  assert.ok(fontSamples.length >= 2 && fontSamples.every((sample) => sample.heading && sample.body));
  const modern = fontSamples.find((sample) => sample.pairing === "modern");
  const literary = fontSamples.find((sample) => sample.pairing === "literary");
  assert.ok(modern && literary && (modern.heading !== literary.heading || modern.body !== literary.body), "Typography specimens should differ");
  await screenshot("studio-fonts");

  await page.getByRole("link", { name: "Content", exact: true }).click();
  await page.getByRole("link", { name: /Create your first post/ }).click();
  assert.equal(fs.existsSync(path.join(root, "content/blog/posts")), false);
  await visible(page.getByRole("textbox", { name: "Post title" }));
  await page.getByRole("textbox", { name: "Post title" }).fill("Our first update");
  await page.getByRole("textbox", { name: "Article body" }).fill("## Hello\n\nThis is our first real post.");
  await page.getByRole("tab", { name: "Article" }).click();
  await page.getByRole("button", { name: "Discovery" }).click();
  await page.getByLabel(/^Meta description/).fill("");
  await page.getByRole("tab", { name: "Review" }).click();
  await page.getByRole("button", { name: "Review & save", exact: true }).click();
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await visible(page.getByRole("status").filter({ hasText: /saved/i }));
  assert.equal((await fetch(active.origin + "/blog/post/our-first-update")).status, 404);
  assert.doesNotMatch(await (await fetch(active.origin + "/blog/search.json")).text(), /Our first update/);
  await page.getByRole("tab", { name: "Article" }).click();
  const draftSwitch = page.getByRole("switch", { name: "Draft" });
  await draftSwitch.click();
  await page.getByRole("button", { name: "Review & save", exact: true }).click();
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await visible(page.getByRole("status").filter({ hasText: /saved/i }));
  await page.goto(active.origin + "/blog-studio/editor?slug=our-first-update");
  await visible(page.getByRole("textbox", { name: "Post title" }));
  assert.equal(await page.getByRole("textbox", { name: "Post title" }).inputValue(), "Our first update");
  assert.match(await page.getByRole("textbox", { name: "Article body" }).innerText(), /This is our first real post/);
  assert.equal((await fetch(active.origin + "/blog/post/our-first-update")).status, 200);
  await page.goto(active.origin + "/blog-studio");
  await page.getByRole("button", { name: /Select Our first update/ }).click();
  await page.getByRole("button", { name: "Still accurate" }).click();
  await page.getByRole("button", { name: "Confirm review" }).click();
  await visible(page.getByRole("status").filter({ hasText: /saved/i }));
  await page.goto(active.origin + "/blog");
  await visible(page.getByRole("heading", { name: "Our first update" }));
  assert.equal((await fetch(active.origin + "/blog")).status, 200);
  const png = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";
  const upload = await page.request.post(active.origin + "/blog-studio/api", { headers: { "content-type": "application/json", origin: active.origin, "x-blog-studio-token": active.studioToken, "x-blog-upload": "1" }, data: { action: "upload", data: png } });
  assert.equal(upload.status(), 200);
  assert.match((await upload.json()).path, /^\/blog-system-next\//);
  const rejectedUpload = await page.request.post(active.origin + "/blog-studio/api", { headers: { "content-type": "application/json", origin: active.origin, "x-blog-studio-token": active.studioToken, "x-blog-upload": "1" }, data: { action: "upload", data: "data:image/svg+xml;base64,PHN2Zy8+" } });
  assert.equal(rejectedUpload.status(), 400);
  await page.setViewportSize({ width: 390, height: 844 }); await noHorizontalOverflow(); await screenshot("studio-editor-mobile");
  await page.goto(active.origin + "/blog/post/our-first-update");
  await visible(page.getByRole("heading", { name: "Our first update" }));
  assert.equal(await page.locator(".bsn-brand").getAttribute("href"), "/");
  await page.locator(".bsn-brand").click(); await visible(page.getByText("HOST HOMEPAGE"));
  await page.goto(active.origin + "/blog-studio");
  await page.setViewportSize({ width: 1440, height: 900 });
  await visible(page.getByRole("heading", { name: /Content/i }));
  assert.deepEqual(errors, [], "Browser errors");
  fs.writeFileSync(path.join(root, "verification.json"), JSON.stringify({ passed: true, screenshots: artifacts, checked: ["empty build", "production privacy", "ordinary dev guidance", "desktop/mobile welcome fit", "settings", "blank editor", "draft privacy", "publishing", "homepage link", "unsaved-change guard"] }, null, 2));
  console.log(`Onboarding browser checks passed. Screenshots: ${artifacts}`);
} finally { if (active) await stop(active, "final-session"); await browser.close(); }
