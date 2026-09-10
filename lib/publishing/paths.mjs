/** Portable repository-relative data directory; never an absolute or encoded path. */
export function validateContentPath(value) {
  if (typeof value !== "string") throw new Error("Enter a repository-relative content folder.");
  const normalized = value.trim().replaceAll("\\", "/").replace(/\/$/, "");
  const segments = normalized.split("/");
  const reserved = new Set(["git", "node_modules", "public", "app", "src", "pages", "lib", "components", "scripts"]);
  const dataSegments = segments[0] === "app" ? segments.slice(1) : segments[0] === "src" && segments[1] === "app" ? segments.slice(2) : segments;
  if (normalized.length > 200 || !dataSegments.length || segments.some(segment => !/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(segment)) || dataSegments.some(segment => reserved.has(segment.toLowerCase()))) {
    throw new Error("Use a data folder such as app/blog, src/app/blog or data/blog. Avoid public, reserved folders, dots and absolute paths.");
  }
  return normalized;
}

export function validateLoginRoute(value) {
  if (typeof value !== "string") throw new Error("Enter a login route such as /login.");
  const route = value.trim().replace(/\/$/, "");
  if (route.length > 160 || !/^\/[a-z0-9]+(?:[-/][a-z0-9]+)*$/.test(route) || /^\/(api|dashboard|blog|docs|_next|fonts)(\/|$)/.test(route)) {
    throw new Error("Use an available route such as /login or /team/sign-in, without a domain, query, or reserved app path.");
  }
  return route;
}

/** A requested public mount; an agent must wire non-default routes into the host app. */
export function validateBlogRoute(value) {
  if (typeof value !== "string") throw new Error("Enter a blog route such as /blog.");
  const route = value.trim().replace(/\/$/, "");
  if (route.length > 160 || !/^\/[a-z0-9]+(?:[-/][a-z0-9]+)*$/.test(route) || /^\/(api|dashboard|docs|login|_next|fonts)(\/|$)/.test(route)) {
    throw new Error("Use an available blog route such as /blog or /journal, without a domain or query.");
  }
  return route;
}
