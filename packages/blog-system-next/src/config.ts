export interface BlogConfig {
  schemaVersion: 1;
  route: string;
  contentPath: string;
  name: string;
  description: string;
  author: string;
  siteUrl: string;
  studio: boolean;
  studioRoute: string;
  theme: "default" | "inherit";
  appearance?: {blogTemplate:string;postTemplate:string;fontPairing:string;seoScoreThresholds:{redMax:number;yellowMax:number}};
}

export type BlogSettings = Pick<BlogConfig, "name" | "description" | "author" | "siteUrl" | "theme" | "appearance">;
export const settingKeys = ["name", "description", "author", "siteUrl", "theme", "appearance"] as const;
export function settingsOf(config: BlogConfig): BlogSettings {
  return { name: config.name, description: config.description, author: config.author, siteUrl: config.siteUrl, theme: config.theme, ...(config.appearance?{appearance:config.appearance}:{}) };
}
export function applySettings(config: BlogConfig, input: unknown): BlogConfig {
  if (!input || typeof input !== "object" || Array.isArray(input) || Object.keys(input).some(key => !settingKeys.includes(key as typeof settingKeys[number]))) throw new Error("Only publication settings can be changed here.");
  return defineBlog({ ...config, ...input });
}

export function routePath(value: unknown): string {
  if (typeof value !== "string" || value.length > 160 || !/^\/[a-z0-9]+(?:[-/][a-z0-9]+)*$/.test(value) || /^\/(api|_next)(\/|$)/.test(value)) throw new Error("Use a route such as /blog or /team/journal, without queries or reserved segments.");
  if (value.split("/").some(p => /^(con|prn|aux|nul|com[0-9]|lpt[0-9])$/i.test(p))) throw new Error("Route contains a reserved filename.");
  return value;
}

export function contentPath(value: unknown): string {
  if (typeof value !== "string" || value.length > 200) throw new Error("Invalid content folder.");
  const parts = value.split("/");
  if (parts.some(p => !/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(p) || /^(public|node_modules|app|src|pages|lib|components|scripts|con|prn|aux|nul|com[0-9]|lpt[0-9])$/i.test(p))) throw new Error("Use a private app-relative data folder such as content/blog; public, route and reserved folders are not supported.");
  return value;
}

function string(value: unknown, label: string, max: number): string {
  if (typeof value !== "string" || !value.trim() || value.length > max || /[\x00-\x1f\x7f]/.test(value)) throw new Error(`Invalid ${label}.`);
  return value.trim();
}

export function defineBlog(input: unknown): BlogConfig {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Invalid blog configuration.");
  const v = input as Record<string, unknown>;
  const keys = ["schemaVersion", "route", "contentPath", "name", "description", "author", "siteUrl", "studio", "studioRoute", "theme", "appearance"];
  if (Object.keys(v).some(k => !keys.includes(k))) throw new Error("Unknown configuration key; analytics and secrets do not belong in blog configuration.");
  if (v.schemaVersion !== 1 || typeof v.studio !== "boolean" || !["default", "inherit"].includes(v.theme as string)) throw new Error("Unsupported blog configuration version or options.");
  const route = routePath(v.route), studioRoute = routePath(v.studioRoute);
  if (route === studioRoute || route.startsWith(studioRoute + "/") || studioRoute.startsWith(route + "/")) throw new Error("Blog and Studio routes must be separate.");
  let siteUrl = "";
  if (v.siteUrl !== "") {
    const raw = string(v.siteUrl, "site URL", 2048);
    const url = new URL(raw);
    if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash || url.pathname !== "/") throw new Error("Production site URL must be an HTTPS origin, e.g. https://example.com (no path).");
    siteUrl = url.origin;
  }
  let appearance:BlogConfig['appearance'];
  if(v.appearance!==undefined) {
    const a=v.appearance as NonNullable<BlogConfig['appearance']>;
    if(!a||typeof a!=='object'||!['classic','magazine','minimal','journal'].includes(a.blogTemplate)||!['standard','centered','hero'].includes(a.postTemplate)||!['editorial','classic','modern','technical','literary'].includes(a.fontPairing)) throw new Error('Invalid appearance.');
    const s=a.seoScoreThresholds;if(!s||!Number.isInteger(s.redMax)||!Number.isInteger(s.yellowMax)||s.redMax<0||s.redMax>=s.yellowMax||s.yellowMax>100) throw new Error('Invalid SEO score bands.');
    appearance={blogTemplate:a.blogTemplate,postTemplate:a.postTemplate,fontPairing:a.fontPairing,seoScoreThresholds:{redMax:s.redMax,yellowMax:s.yellowMax}};
  }
  return { schemaVersion: 1, route, studioRoute, contentPath: contentPath(v.contentPath), name: string(v.name, "publication name", 120), description: v.description === "" ? "" : string(v.description, "description", 500), author: v.author === "" ? "" : string(v.author, "author", 120), siteUrl, studio: v.studio, theme: v.theme as BlogConfig["theme"], ...(appearance?{appearance}:{}) };
}

/** Only safe link protocols; React handles HTML escaping separately. */
export function safeUrl(value: string, image = false): string | undefined {
  if (/[\x00-\x20\x7f\\]/.test(value)) return undefined;
  if (/^\/(?!\/)/.test(value) || (!image && /^#[a-zA-Z0-9_-]+$/.test(value))) return value;
  try { const url = new URL(value); if (["https:", "http:", ...(!image ? ["mailto:"] : [])].includes(url.protocol) && !url.username && !url.password) return value; } catch { /* Invalid links render as text. */ }
}
