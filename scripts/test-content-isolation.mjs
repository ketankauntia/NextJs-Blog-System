import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, rm, symlink } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { isPublished, isContentSlug, readPostSources } from "../lib/blog/source.mjs";
import { resolveLocalContent } from "../lib/publishing/local-content.mjs";

test("publication requires a valid date and explicit non-draft state", () => {
  const now = Date.parse("2026-09-07T12:00:00Z");
  for (const publishedAt of [undefined, null, 0, "not-a-date", "2026-09-07T13:00:00Z", "2026-09-08", "2026-09-07T12:00:00"]) {
    assert.equal(isPublished({ publishedAt }, now), false);
  }
  for (const draft of [true, "false", "true", 1, null]) {
    assert.equal(isPublished({ draft, publishedAt: "2026-09-01" }, now), false);
  }
  assert.equal(isPublished({ draft: false, publishedAt: "2026-09-07T17:30:00+05:30" }, now), true);
  assert.equal(isPublished({ publishedAt: new Date("2026-09-07") }, now), true);
});

test("public filesystem reads omit draft bodies and scheduled content; authoring retains both", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "publishing-isolation-"));
  const original = process.cwd();
  const directory = path.join(root, "content", "posts");
  try {
    await mkdir(directory, { recursive: true });
    process.chdir(root);
    for (const [slug, fields, body] of [
      ["published", "publishedAt: '2026-09-01'", "PUBLIC"],
      ["draft", "publishedAt: '2026-09-01'\ndraft: true", "PRIVATE_DRAFT_SENTINEL"],
      ["scheduled", "publishedAt: '2026-09-08'", "PRIVATE_FUTURE_SENTINEL"],
      ["invalid", "publishedAt: unknown", "PRIVATE_INVALID_SENTINEL"],
    ]) await writeFile(path.join(directory, `${slug}.md`), `---\ntitle: Test\n${fields}\n---\n${body}`);
    const options = { now: Date.parse("2026-09-07T12:00:00Z") };
    const publicRecords = readPostSources(options);
    assert.deepEqual(publicRecords.map(p => p.slug), ["published"]);
    assert.equal(JSON.stringify(publicRecords).includes("PRIVATE_"), false);
    assert.equal(readPostSources({ ...options, localAuthoring: true }).length, 4);
  } finally { process.chdir(original); await rm(root, { recursive: true, force: true }); }
});

test("slugs reject traversal and encoded paths", () => {
  for (const slug of ["../draft", "%2e%2e", "a/b", "a\\b", "", "a".repeat(161)]) assert.equal(isContentSlug(slug), false);
  assert.equal(isContentSlug("valid-post"), true);
});

test("custom content roots are shared by readers and writers and fail closed", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "publishing-path-"));
  const original = process.cwd();
  try {
    process.chdir(root);
    const setup = { schemaVersion: 2, mode: "local", destination: "github", contentPath: "data/blog" };
    await writeFile("publishing.json", JSON.stringify(setup));
    assert.deepEqual(readPostSources(), []);
    await mkdir(resolveLocalContent("posts"), { recursive: true });
    await writeFile(resolveLocalContent("posts", "custom.md"), "---\ntitle: Custom\npublishedAt: '2020-01-01'\n---\nCUSTOM_ROOT");
    assert.equal(readPostSources()[0].content.trim(), "CUSTOM_ROOT");
    assert.equal(resolveLocalContent("settings.json"), path.join(root, "data", "blog", "settings.json"));
    assert.throws(() => resolveLocalContent("..", "outside"));
    await writeFile("publishing.json", JSON.stringify({ ...setup, contentPath: "../outside" }));
    assert.throws(() => readPostSources());
    await writeFile("publishing.json", JSON.stringify({ ...setup, mode: "self-hosted" }));
    assert.throws(() => readPostSources(), /adapter/);
    await symlink(path.join(root, "data"), path.join(root, "linked"), "junction");
    await writeFile("publishing.json", JSON.stringify({ ...setup, contentPath: "linked/blog" }));
    assert.throws(() => readPostSources(), /symbolic links/);
  } finally { process.chdir(original); await rm(root, { recursive: true, force: true }); }
});
