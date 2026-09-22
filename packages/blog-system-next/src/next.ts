import type { NextConfig } from "next";
import { randomBytes } from "node:crypto";
import { readConfig } from "./storage.js";

/** Wrap an evaluated Next config without replacing the host's routes, headers or styling. */
export function withBlog(next: NextConfig = {}, options: { root: string }): NextConfig {
  const config = readConfig(options.root);
  // Set server process state before Next starts its workers. Never put this token
  // in next.env: those values can be embedded into browser bundles.
  if (config.studio && process.env.NODE_ENV === "development" && !process.env.VERCEL && !process.env.NETLIFY && !process.env.CI) {
    process.env.BLOG_SYSTEM_NEXT_STUDIO = "local";
    if (!/^[a-f0-9]{64}$/.test(process.env.BLOG_SYSTEM_NEXT_STUDIO_TOKEN ?? "")) process.env.BLOG_SYSTEM_NEXT_STUDIO_TOKEN = randomBytes(32).toString("hex");
  }
  if (next.output === "export") throw new Error("blog-system-next v1 requires a Node.js server; static export is not supported.");
  if (next.cacheComponents) throw new Error("blog-system-next v1 does not yet support cacheComponents.");
  if (next.pageExtensions && ["tsx", "ts", "jsx", "js"].some(extension => !next.pageExtensions!.includes(extension))) throw new Error("blog-system-next requires the standard tsx, ts, jsx and js page extensions in this alpha.");
  if (next.basePath && !/^\/[a-z0-9]+(?:[-/][a-z0-9]+)*$/.test(next.basePath)) throw new Error("Unsupported basePath.");
  const includes = { ...next.outputFileTracingIncludes };
  includes["/*"] = [...new Set([...(includes["/*"] ?? []), "./blog-system-next.config.json", `./${config.contentPath}/posts/*.md`, `./${config.contentPath}/settings.json`])];
  return { ...next, outputFileTracingIncludes: includes, env: { ...next.env, BLOG_SYSTEM_NEXT_BASE_PATH: next.basePath ?? "" } };
}
