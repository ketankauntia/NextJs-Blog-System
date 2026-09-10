import test from "node:test";
import assert from "node:assert/strict";
import { createPublishingSetup, defaultPublishingSetup, serializePublishingSetup } from "../lib/publishing/config.ts";
import { getSetupGuide, renderSetupGuideMarkdown } from "../lib/publishing/guide.ts";

test("default setup is local GitHub without a database", () => {
  assert.deepEqual(createPublishingSetup(defaultPublishingSetup), defaultPublishingSetup);
});

test("existing sites need no identity and preserve hosting by default; older links still work", () => {
  const existing = { installation: "existing", mode: "local", destination: "github" };
  for (const projectName of [undefined, null, "", "Old form name"]) {
    const setup = createPublishingSetup({ ...existing, projectName });
    assert.equal(setup.projectName, null);
    assert.equal(setup.hosting, "existing");
    assert.deepEqual(createPublishingSetup(JSON.parse(serializePublishingSetup(setup))), setup);
  }
  const legacy = { projectName: "Original", mode: "local", destination: "github" };
  assert.equal(createPublishingSetup(legacy).installation, "fresh");
  for (const projectName of [undefined, null, {}, 1]) assert.throws(() => createPublishingSetup({ ...legacy, projectName }), /project name/);
  assert.throws(() => createPublishingSetup({ ...legacy, installation: "unknown" }));
  assert.throws(() => createPublishingSetup({ ...legacy, hosting: "existing" }));
});

test("existing integration guides never prescribe cloning, renaming or npm-only scripts", () => {
  for (const hosting of ["existing", "vercel", "self-hosted"]) {
    for (const [mode, destination, assets] of [
      ["local", "github", "repository"],
      ["self-hosted", "github", "repository"],
      ["self-hosted", "github", "r2"],
      ["self-hosted", "supabase", "supabase"],
      ["self-hosted", "supabase", "r2"],
    ]) {
      const setup = createPublishingSetup({ installation: "existing", mode, destination, assets, hosting, contentPath: "data/journal", loginRoute: "/staff/sign-in" });
      const guide = getSetupGuide(setup);
      const markdown = renderSetupGuideMarkdown(setup);
      assert.doesNotMatch(markdown, /git clone|npm (install|run)|Update lib\/site.ts/);
      assert.match(markdown, /duplicate slugs/);
      assert.match(markdown, /hardcoded routes/);
      assert.match(markdown, /Preserve the website's authentication/);
      assert.match(markdown, /selected app root/);
      assert.match(markdown, /actual scripts/);
      assert.equal(guide.steps.some(step => step.title === "Keep your current deployment"), hosting === "existing");
      for (const step of guide.steps) assert.ok(markdown.includes(step.body));
    }
  }
});

test("selected guides cover every supported content, asset and hosting combination", () => {
  for (const hosting of ["vercel", "self-hosted"]) {
    for (const [mode, destination, assets, accounts] of [
      ["local", "github", "repository", []],
      ["self-hosted", "github", "repository", ["GitHub", "Supabase"]],
      ["self-hosted", "github", "r2", ["GitHub", "Supabase", "Cloudflare"]],
      ["self-hosted", "supabase", "supabase", ["Supabase"]],
      ["self-hosted", "supabase", "r2", ["Supabase", "Cloudflare"]],
    ]) {
      const setup = createPublishingSetup({ projectName: "Selected blog", mode, destination, assets, hosting, contentPath: "data/journal", loginRoute: "/staff/sign-in" });
      const guide = getSetupGuide(setup);
      assert.deepEqual(guide.accounts, accounts);
      const titles = guide.steps.map(step => step.title).join("\n");
      assert.equal(titles.includes("Implement GitHub content storage"), mode !== "local" && destination === "github");
      assert.equal(titles.includes("Implement Supabase Storage content"), destination === "supabase");
      assert.equal(titles.includes("Connect Cloudflare R2 uploads"), assets === "r2");
      assert.equal(titles.includes("Implement email login at /staff/sign-in"), mode !== "local");
      assert.equal(titles.includes("Deploy the website to Vercel"), hosting === "vercel");
      assert.equal(titles.includes("Host on your own Node.js server"), hosting === "self-hosted");
      const markdown = renderSetupGuideMarkdown(setup);
      assert.ok(markdown.includes("data/journal/posts"));
      for (const step of guide.steps) assert.ok(markdown.includes(step.body));
      assert.ok(markdown.includes("Recovery and completion"));
      if (mode !== "local") assert.ok(markdown.includes("current local runtime deliberately rejects a remote configuration"));
    }
  }
});

test("hosting is independent of operating mode and unsupported databases fail closed", () => {
  assert.equal(defaultPublishingSetup.hosting, "vercel");
  assert.equal(createPublishingSetup({ ...defaultPublishingSetup, hosting: "self-hosted" }).mode, "local");
  assert.throws(() => createPublishingSetup({ ...defaultPublishingSetup, hosting: "unknown" }));
  for (const database of ["neon", "aws-rds", "gcp-sql", "supabase"]) {
    assert.throws(() => createPublishingSetup({ ...defaultPublishingSetup, database }));
  }
  for (const destination of ["aws-s3", "gcp-storage", "azure-blob"]) {
    assert.throws(() => createPublishingSetup({ ...defaultPublishingSetup, destination }));
  }
});

test("OSS setups have one project and managed is unavailable", () => {
  for (const mode of ["local", "self-hosted"]) {
    const setup = createPublishingSetup({ projectName: "Project", mode, destination: "github", projectScope: "multi-project" });
    assert.equal(setup.projectScope, "single-project");
  }
  assert.throws(() => createPublishingSetup({ projectName: "Project", mode: "managed", destination: "github" }), /coming soon/);
});

test("login-based content uses GitHub or Supabase and always needs authentication", () => {
  for (const destination of ["github", "supabase"]) {
    const setup = createPublishingSetup({ projectName: "Test", mode: "self-hosted", destination, loginRoute: "/team/sign-in", assets: "r2" });
    assert.equal(setup.database, "supabase");
    assert.equal(setup.authentication, "email-password");
    assert.equal(setup.loginRoute, "/team/sign-in");
    assert.equal(setup.assets, "r2");
    assert.equal(setup.oauth, false);
  }
  for (const destination of ["aws", "azure", "supabase", "r2", "gcp", "__proto__"]) {
    assert.throws(() => createPublishingSetup({ projectName: "Test", mode: "local", destination }));
  }
  assert.throws(() => createPublishingSetup({ projectName: "Test", mode: "invalid", destination: "r2" }));
});

test("paths and authentication cannot bypass setup restrictions", () => {
  for (const contentPath of ["../outside", "/tmp/data", "C:\\blog", "public/blog", "src/data", "data/../posts", "data//blog", "%2e%2e", "node_modules/data", ".git"]) {
    assert.throws(() => createPublishingSetup({ ...defaultPublishingSetup, contentPath }));
  }
  assert.equal(createPublishingSetup({ ...defaultPublishingSetup, contentPath: "data\\blog/" }).contentPath, "data/blog");
  const remote = { projectName: "Blog", mode: "self-hosted", destination: "supabase" };
  assert.equal(createPublishingSetup(remote).loginRoute, "/login");
  assert.equal(createPublishingSetup(remote).assets, "supabase");
  for (const loginRoute of ["/", "//evil.com", "https://example.com/login", "/api/login", "/dashboard", "/blog/login", "/docs", "/a?b=c", "/%2e%2e", "/a/../login"]) {
    assert.throws(() => createPublishingSetup({ ...remote, loginRoute }));
  }
  assert.throws(() => createPublishingSetup({ ...remote, oauth: true }));
  assert.throws(() => createPublishingSetup({ ...remote, authentication: "none" }));
  assert.throws(() => createPublishingSetup({ ...defaultPublishingSetup, assets: "r2" }));
  const output = JSON.parse(serializePublishingSetup({ ...remote, loginRoute: "/staff/sign-in", contentPath: "data/blog", password: "secret" }));
  assert.equal(output.loginRoute, "/staff/sign-in");
  assert.equal(output.contentPath, "data/blog");
  assert.equal(Object.hasOwn(output, "password"), false);
});

test("setup rejects empty or unsafe names and excludes extra secret fields", () => {
  for (const projectName of [" ", "x".repeat(81), "bad\nname", "bad\u0000name"]) {
    assert.throws(() => createPublishingSetup({ ...defaultPublishingSetup, projectName }));
  }
  const output = JSON.parse(serializePublishingSetup({ ...defaultPublishingSetup, projectName: "  Team  ", secret: "do-not-export" }));
  assert.equal(output.projectName, "Team");
  assert.equal(Object.hasOwn(output, "secret"), false);
});
