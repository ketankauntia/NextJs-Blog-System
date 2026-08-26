/**
 * Content audit — fails when a post would ship with metadata that search engines
 * penalise or that the post templates cannot render well.
 *
 * Run with `npm run audit:content`. It reads the same frontmatter contract the
 * site does, so a clean run here means the build has nothing to truncate.
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

// Mirrors the limits enforced in lib/seo.ts.
const TITLE_LIMIT = 60;
const DESCRIPTION_MIN = 115;
const DESCRIPTION_LIMIT = 158;

const problems = [];

for (const file of fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md")).sort()) {
  const { data, content } = matter(fs.readFileSync(path.join(POSTS_DIR, file), "utf8"));
  const words = content.split(/\s+/).filter(Boolean).length;
  const flags = [];

  if (!data.title) flags.push("missing title");
  else if (data.title.length > TITLE_LIMIT) flags.push(`title ${data.title.length} > ${TITLE_LIMIT}`);

  if (!data.description) flags.push("missing description");
  else if (data.description.length < DESCRIPTION_MIN || data.description.length > DESCRIPTION_LIMIT) {
    flags.push(`description ${data.description.length} outside ${DESCRIPTION_MIN}-${DESCRIPTION_LIMIT}`);
  }

  if (!data.category) flags.push("missing category");
  if (!data.tldr) flags.push("missing tldr");
  if (!data.keyphrase) flags.push("missing keyphrase");
  if ((data.keyTakeaways ?? []).length < 3) flags.push("fewer than 3 key takeaways");
  if ((data.faqs ?? []).length < 3) flags.push("fewer than 3 FAQs");
  if (words < 400) flags.push(`thin body (${words} words)`);

  const status = flags.length ? "FAIL" : "ok  ";
  console.log(
    `${status} ${String(words).padStart(5)}w  ${String(data.category ?? "-").padEnd(24)} ${file}` +
      (flags.length ? `\n       ${flags.join("\n       ")}` : ""),
  );
  if (flags.length) problems.push(file);
}

if (problems.length > 0) {
  console.error(`\n${problems.length} post(s) need attention.`);
  process.exit(1);
}
console.log("\nAll posts pass.");
