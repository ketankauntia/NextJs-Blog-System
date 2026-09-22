import test from "node:test";
import assert from "node:assert/strict";
import { cloudflareContentKeys, putR2Object, R2WriteConflictError } from "../lib/publishing/cloudflare-r2.ts";

test("Cloudflare object keys stay inside the selected prefix", () => {
  assert.deepEqual(cloudflareContentKeys("content/blog", "hello-world"), {
    settings: "content/blog/settings.json",
    posts: "content/blog/posts/",
    post: "content/blog/posts/hello-world.md",
    assets: "content/blog/assets/",
  });
  for (const prefix of ["", "../content", "content//blog", "content/\u0000blog"]) {
    assert.throws(() => cloudflareContentKeys(prefix));
  }
  for (const slug of ["../draft", "UPPER", "has space", "a/child", "x".repeat(121)]) {
    assert.throws(() => cloudflareContentKeys("content/blog", slug));
  }
});

test("R2 writes use create-only and ETag update conditions", async () => {
  const calls = [];
  const bucket = {
    async put(key, value, options) {
      calls.push({ key, value, options });
      return { etag: `etag-${calls.length}`, size: String(value).length };
    },
  };
  await putR2Object(bucket, "content/blog/posts/first.md", "first", { expectedEtag: null, contentType: "text/markdown; charset=utf-8", kind: "post" });
  await putR2Object(bucket, "content/blog/settings.json", "{}", { expectedEtag: "old-etag", contentType: "application/json", kind: "settings" });
  assert.deepEqual(calls[0].options.onlyIf, { etagDoesNotMatch: "*" });
  assert.deepEqual(calls[1].options.onlyIf, { etagMatches: "old-etag" });
  assert.equal(calls[0].options.customMetadata.kind, "post");
});

test("a failed R2 condition becomes an explicit edit conflict", async () => {
  const bucket = { async put() { return null; } };
  await assert.rejects(
    putR2Object(bucket, "content/blog/posts/first.md", "new", { expectedEtag: "stale", contentType: "text/markdown", kind: "post" }),
    error => error instanceof R2WriteConflictError && error.key === "content/blog/posts/first.md",
  );
});

