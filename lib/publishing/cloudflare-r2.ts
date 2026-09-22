export type R2Conditional = { etagMatches?: string; etagDoesNotMatch?: string };

export type R2ObjectLike = { etag: string; size: number };

export interface R2BucketLike {
  put(
    key: string,
    value: string | ArrayBuffer | ArrayBufferView | ReadableStream,
    options: { onlyIf: R2Conditional; httpMetadata?: { contentType?: string }; customMetadata?: Record<string, string> },
  ): Promise<R2ObjectLike | null>;
}

export class R2WriteConflictError extends Error {
  readonly key: string;

  constructor(key: string) {
    super(`Cloudflare R2 object changed before this save: ${key}`);
    this.name = "R2WriteConflictError";
    this.key = key;
  }
}

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function cloudflareContentKeys(contentPath: string, slug?: string) {
  const prefix = contentPath.replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
  if (!prefix || prefix.includes("..") || prefix.includes("//") || /[\u0000-\u001f\u007f]/.test(prefix)) {
    throw new Error("Use a validated R2 content prefix.");
  }
  if (slug !== undefined && (!slugPattern.test(slug) || slug.length > 120)) {
    throw new Error("Use a lowercase, hyphenated post slug.");
  }
  return {
    settings: `${prefix}/settings.json`,
    posts: `${prefix}/posts/`,
    post: slug === undefined ? null : `${prefix}/posts/${slug}.md`,
    assets: `${prefix}/assets/`,
  };
}

/**
 * Save through R2's atomic conditional PUT. Pass null for a create-only write,
 * or the ETag returned by the previous read for an update.
 */
export async function putR2Object(
  bucket: R2BucketLike,
  key: string,
  value: string | ArrayBuffer | ArrayBufferView | ReadableStream,
  options: { expectedEtag: string | null; contentType: string; kind: "post" | "settings" | "asset" },
) {
  if (!key || key.startsWith("/") || key.includes("..") || key.includes("\\") || /[\u0000-\u001f\u007f]/.test(key)) {
    throw new Error("Unsafe R2 object key.");
  }
  const onlyIf = options.expectedEtag === null
    ? { etagDoesNotMatch: "*" }
    : { etagMatches: options.expectedEtag };
  const result = await bucket.put(key, value, {
    onlyIf,
    httpMetadata: { contentType: options.contentType },
    customMetadata: { kind: options.kind },
  });
  if (!result) throw new R2WriteConflictError(key);
  return { etag: result.etag, size: result.size };
}
