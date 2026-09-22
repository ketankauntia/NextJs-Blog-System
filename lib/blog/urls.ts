/** Accept only web URLs, same-site paths and safe link-only schemes. */
export function safeContentUrl(value: string, image = false): string | undefined {
  if (/[\x00-\x20\x7f\\]/.test(value)) return undefined;
  if (/^\/(?!\/)/.test(value) || (!image && /^#[a-zA-Z0-9_-]+$/.test(value))) return value;
  try {
    const url = new URL(value);
    if (["https:", "http:", ...(!image ? ["mailto:"] : [])].includes(url.protocol) && !url.username && !url.password) return value;
  } catch { /* Render invalid URLs as text. */ }
}
