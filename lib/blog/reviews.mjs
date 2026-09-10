import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { resolveLocalContent } from "../publishing/local-content.mjs";
import { isContentSlug } from "./source.mjs";

/** Calendar dates are intentional: maintenance is separate from publication time. */
export function isReviewDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T12:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

/** Fail on malformed files rather than silently overwrite existing review history. */
export function readContentReviews() {
  const file = resolveLocalContent("reviews.json");
  if (!fs.existsSync(file)) return {};
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  if (!isRecord(data) || data.schemaVersion !== 1 || !isRecord(data.articles)) {
    throw new Error("The content review file has an unsupported format.");
  }
  for (const [slug, review] of Object.entries(data.articles)) {
    if (!isContentSlug(slug) || !isRecord(review) ||
      !(review.reviewedAt === "" || isReviewDate(review.reviewedAt)) ||
      !(review.nextReviewAt === "" || isReviewDate(review.nextReviewAt))) {
      throw new Error("The content review file contains an invalid article or date.");
    }
  }
  return data.articles;
}

/** Updates one record synchronously and atomically; never rewrites the article itself. */
export function saveContentReview(slug, input, today = new Date().toISOString().slice(0, 10)) {
  if (!isContentSlug(slug)) throw new Error("Invalid article URL.");
  const article = resolveLocalContent("posts", `${slug}.md`);
  if (!fs.existsSync(article) || !fs.statSync(article).isFile()) throw new Error("Article not found.");
  if (!isRecord(input) || typeof input.markReviewed !== "boolean" ||
    !(input.nextReviewAt === "" || isReviewDate(input.nextReviewAt)) || !isReviewDate(today)) {
    throw new Error("Choose a valid review date.");
  }
  const articles = readContentReviews();
  const review = {
    reviewedAt: input.markReviewed ? today : articles[slug]?.reviewedAt ?? "",
    nextReviewAt: input.nextReviewAt,
  };
  articles[slug] = review;
  const target = resolveLocalContent("reviews.json");
  const temporary = resolveLocalContent(`reviews-${randomUUID()}.tmp`);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  try {
    fs.writeFileSync(temporary, `${JSON.stringify({ schemaVersion: 1, articles }, null, 2)}\n`, { encoding: "utf8", flag: "wx" });
    fs.renameSync(temporary, target);
  } finally {
    if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
  }
  return review;
}
