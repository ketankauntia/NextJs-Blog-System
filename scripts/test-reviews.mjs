import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { isReviewDate, readContentReviews, saveContentReview } from "../lib/blog/reviews.mjs";

test("review dates reject invalid days and accept leap days", () => {
  assert.equal(isReviewDate("2028-02-29"), true);
  for (const value of ["2026-02-29", "2026-04-31", "2026-13-01", "tomorrow", null, "2026-09-10T12:00:00Z"]) assert.equal(isReviewDate(value), false);
});

test("review store persists dates, keeps other articles and respects the configured content path", () => {
  const original = process.cwd();
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "blog-content-review-"));
  process.chdir(directory);
  try {
    fs.writeFileSync("publishing.json", JSON.stringify({ schemaVersion: 2, mode: "local", destination: "github", contentPath: "app/blog" }));
    fs.mkdirSync("app/blog/posts", { recursive: true });
    fs.writeFileSync("app/blog/posts/first.md", "---\ntitle: First\n---\nOriginal article\n");
    fs.writeFileSync("app/blog/posts/second.md", "---\ntitle: Second\n---\nSecond article\n");
    assert.deepEqual(readContentReviews(), {});
    saveContentReview("first", { markReviewed: true, nextReviewAt: "2026-12-10" }, "2026-09-10");
    saveContentReview("second", { markReviewed: false, nextReviewAt: "2026-09-01" }, "2026-09-10");
    assert.deepEqual(readContentReviews(), {
      first: { reviewedAt: "2026-09-10", nextReviewAt: "2026-12-10" },
      second: { reviewedAt: "", nextReviewAt: "2026-09-01" },
    });
    saveContentReview("first", { markReviewed: false, nextReviewAt: "" }, "2026-09-11");
    assert.deepEqual(readContentReviews().first, { reviewedAt: "2026-09-10", nextReviewAt: "" });
    assert.equal(fs.readFileSync("app/blog/posts/first.md", "utf8"), "---\ntitle: First\n---\nOriginal article\n");
    assert.equal(fs.existsSync("content/reviews.json"), false);
    assert.throws(() => saveContentReview("missing", { markReviewed: true, nextReviewAt: "" }), /Article not found/);
    assert.throws(() => saveContentReview("../first", { markReviewed: true, nextReviewAt: "" }), /Invalid article URL/);
    assert.throws(() => saveContentReview("first", { markReviewed: true, nextReviewAt: "2026-02-30" }), /valid review date/);
    const valid = fs.readFileSync("app/blog/reviews.json", "utf8");
    fs.writeFileSync("app/blog/reviews.json", '{"schemaVersion":99,"articles":{}}');
    assert.throws(() => saveContentReview("first", { markReviewed: true, nextReviewAt: "" }), /unsupported format/);
    assert.equal(fs.readFileSync("app/blog/reviews.json", "utf8"), '{"schemaVersion":99,"articles":{}}');
    fs.writeFileSync("app/blog/reviews.json", valid);
    assert.equal(readContentReviews().second.nextReviewAt, "2026-09-01");
  } finally {
    process.chdir(original);
    assert.ok(path.resolve(directory).startsWith(`${path.resolve(os.tmpdir())}${path.sep}`));
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
