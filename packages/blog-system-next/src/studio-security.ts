import { timingSafeEqual } from "node:crypto";
// The Next config wrapper provides one random token to development workers. Next can evaluate
// pages and route handlers in separate module contexts, so module globals are insufficient.
export const studioToken = () => process.env.BLOG_SYSTEM_NEXT_STUDIO_TOKEN ?? "";

export function studioEnabled(): boolean {
  return process.env.NODE_ENV === "development" && process.env.BLOG_SYSTEM_NEXT_STUDIO === "local" && /^[a-f0-9]{64}$/.test(studioToken()) && !process.env.VERCEL && !process.env.CI && !process.env.NETLIFY;
}

export function localHeaders(headers: Headers): boolean {
  const host = headers.get("host") ?? "";
  if (!/^(localhost|127\.0\.0\.1|\[::1\])(?::\d{1,5})?$/.test(host)) return false;
  if (headers.has("forwarded")) return false;
  if (headers.has("x-forwarded-host") && headers.get("x-forwarded-host") !== host) return false;
  // Next adds these itself. Accept only its loopback values, never a remote proxy chain.
  if (headers.has("x-forwarded-for") && !/^(127\.0\.0\.1|::1|::ffff:127\.0\.0\.1)$/.test(headers.get("x-forwarded-for") ?? "")) return false;
  return true;
}

export function authorizeStudio(request: Request): boolean {
  if (!studioEnabled() || !localHeaders(request.headers)) return false;
  const url = new URL(request.url);
  if (!["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) || !["http:", "https:"].includes(url.protocol)) return false;
  // Next normalizes Request.url to localhost even when the browser uses 127.0.0.1.
  // Compare Origin against the independently validated Host, retaining the exact port.
  const browserOrigin = new URL(`${url.protocol}//${request.headers.get("host")}`);
  if (browserOrigin.port !== url.port || request.headers.get("origin") !== browserOrigin.origin) return false;
  if (request.headers.has("sec-fetch-site") && request.headers.get("sec-fetch-site") !== "same-origin") return false;
  const supplied = request.headers.get("x-blog-studio-token") ?? "";
  const token = studioToken();
  return /^[a-f0-9]{64}$/.test(supplied) && timingSafeEqual(Buffer.from(supplied), Buffer.from(token));
}

export async function readBody(request: Request, limit: number): Promise<string> {
  if (!request.body) throw new Error("Missing request body.");
  if (Number(request.headers.get("content-length")) > limit) throw new Error("Request too large.");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try { for (;;) { const { done, value } = await reader.read(); if (done) break; size += value.length; if (size > limit) { await reader.cancel(); throw new Error("Request too large."); } chunks.push(value); } }
  finally { reader.releaseLock(); }
  return Buffer.concat(chunks).toString("utf8");
}
