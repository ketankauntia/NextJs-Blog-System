import "server-only";
import { defineBlog, settingsOf, type BlogConfig } from "./config.js";
import { createStore, readSettings, saveSettings } from "./storage.js";
import { MAX_POST_BYTES, validSlug, parsePost, editPostSource } from "./core.js";
import { authorizeStudio, readBody } from "./studio-security.js";
import {saveReview} from './reviews.js';
import {saveUpload} from './uploads.js';
import {load,JSON_SCHEMA} from 'js-yaml';

const xml = (v: string) => v.replace(/[<>&"']/g, c => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" })[c]!);

/** Route handlers deliberately have no React, navigation or client-component imports. */
function handlersFor({ root, config: input, basePath = "" }: { root: string; config: BlogConfig; basePath?: string }) {
  const config = defineBlog(input);
  if (basePath && !/^\/[a-z0-9]+(?:[-/][a-z0-9]+)*$/.test(basePath)) throw new Error("Invalid basePath.");
  const store = createStore(root, config);
  const href = (suffix = "") => basePath + config.route + suffix;
  const absolute = (suffix = "") => config.siteUrl + href(suffix);
  const response = (body: string, type: string) => new Response(body, { headers: { "content-type": type + "; charset=utf-8", "x-content-type-options": "nosniff", "cache-control": "no-store" } });
  function RSS() {
    if (!config.siteUrl) return new Response("Configure siteUrl to enable feeds.", { status: 503 });
    return response(`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${xml(config.name)}</title><link>${xml(absolute())}</link><description>${xml(config.description)}</description>${store.publicPosts().map(p => `<item><title>${xml(p.title)}</title><link>${xml(absolute(`/post/${p.slug}`))}</link><guid>${xml(absolute(`/post/${p.slug}`))}</guid><description>${xml(p.description)}</description><pubDate>${new Date(p.publishedAt).toUTCString()}</pubDate></item>`).join("")}</channel></rss>`, "application/rss+xml");
  }
  function Sitemap() {
    if (!config.siteUrl) return new Response("Configure siteUrl to enable sitemap.", { status: 503 });
    return response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${xml(absolute())}</loc></url>${store.publicPosts().filter(p => !p.noindex).map(p => `<url><loc>${xml(absolute(`/post/${p.slug}`))}</loc><lastmod>${xml(p.updatedAt ?? p.publishedAt)}</lastmod></url>`).join("")}</urlset>`, "application/xml");
  }
  function Search() { return response(JSON.stringify(store.publicPosts().map(p => ({ slug: p.slug, title: p.title, description: p.description, tags: p.tags, url: href(`/post/${p.slug}`) }))), "application/json"); }
  function Llms() { return response(`# ${config.name}\n\n${config.description}\n\n${store.publicPosts().filter(p => !p.noindex).map(p => `- [${p.title}](${absolute(`/post/${p.slug}`)}): ${p.description}`).join("\n")}`, "text/plain"); }
  async function Markdown(_request: Request, { params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const post = validSlug(slug) && store.publicPosts().find(p => p.slug === slug); return post ? response(`# ${post.title}\n\n${post.body}`, "text/plain") : new Response("Not found", { status: 404 }); }
  async function StudioAPI(request: Request) {
    const reply = (body: object, status = 200) => Response.json(body, { status, headers: { "cache-control": "no-store", "x-content-type-options": "nosniff" } });
    if (!config.studio || !authorizeStudio(request)) return reply({ error: "Not found" }, 404);
    if (request.method !== "POST") return reply({ error: "Method not allowed" }, 405);
    if (request.headers.get("content-type")?.split(";")[0].trim() !== "application/json") return reply({ error: "Use application/json." }, 415);
    try {
      const body = JSON.parse(await readBody(request, request.headers.get('x-blog-upload')==='1'?12*1024*1024:MAX_POST_BYTES * 2));
      if(body?.action==='upload') return reply(saveUpload(root,basePath,body));
      if(body?.action==='review') {
        if(!store.authoringSources().some(s=>s.post.slug===body.slug)) throw new Error('Unknown post');
        return reply(saveReview(root,config,body.slug,body.markReviewed,body.nextReviewAt,body.revision));
      }
      if(body?.action==='dashboard-settings') {
        const s=body.settings;
        if(!s||typeof s!=='object'||s.dashboardAccess!=='local') throw new Error('Hosted login is not available.');
        return reply(saveSettings(root,config,{...settingsOf(config),name:s.publicationName,description:s.publicationDescription,author:s.defaultAuthor,siteUrl:s.websiteUrl,appearance:{blogTemplate:s.blogTemplate,postTemplate:s.postTemplate,fontPairing:s.fontPairing,seoScoreThresholds:s.seoScoreThresholds}},body.revision));
      }
      if(body?.action==='dashboard-post'&&validSlug(body.slug)) {
        if(typeof body.body!=='string'||!body.body.trim()||!body.frontmatter||typeof body.frontmatter!=='object'||Array.isArray(body.frontmatter)) throw new Error('Invalid post.');
        const allowed=['title','description','category','tags','publishedAt','updatedAt','author','featured','draft','cornerstone','noindex','canonical','coverTone','coverImage','coverAlt','ogImage','keyphrase','tldr','keyTakeaways','faqs'];
        if(Object.keys(body.frontmatter).some(k=>!allowed.includes(k))) throw new Error('Invalid metadata.');
        const previous=store.authoringSources().find(s=>s.post.slug===body.slug);
        const metadata=previous?load(previous.source.replace(/^\uFEFF/,'').replace(/\r\n/g,'\n').match(/^---\n([\s\S]*?)\n---/)![1],{schema:JSON_SCHEMA}) as Record<string,unknown>:{};
        const unknown=Object.fromEntries(Object.entries(metadata).filter(([k])=>!allowed.includes(k)));
        const clean={...unknown,...Object.fromEntries(Object.entries(body.frontmatter).filter(([,v])=>v!==''&&v!==null&&v!==undefined))};
        body.source=`---\n${JSON.stringify(clean,null,2)}\n---\n\n${body.body.trim()}\n`;
      }
      if (body?.action === "settings") {
        if (!(body.revision === null || typeof body.revision === "string")) return reply({ error: "Invalid settings revision." }, 400);
        return reply(saveSettings(root, config, body.settings, body.revision));
      }
      if (body?.action === "post" && validSlug(body.slug)) {
        const previous = store.authoringSources().find(s => s.post.slug === body.slug);
        body.source = editPostSource(body.slug, body.post, previous?.source);
      }
      if (!body || typeof body.source !== "string" || !validSlug(body.slug) || !(body.revision === null || typeof body.revision === "string")) return reply({ error: "Invalid save request." }, 400);
      const post = parsePost(body.slug, body.source, config.author || config.name);
      const revision = store.save(body.slug, body.source, body.revision);
      return reply({ revision, title: post.title, post, source: body.source, path:`${config.contentPath}/posts/${body.slug}.md` });
    } catch (error) { const message = error instanceof Error ? error.message : "Save failed"; return reply({ error: message.startsWith("Conflict:") ? message : "Invalid content or unavailable file. Check frontmatter, size, and permissions." }, message.startsWith("Conflict:") ? 409 : 400); }
  }
  return { RSS, Sitemap, Search, Llms, Markdown, StudioAPI };
}

export function createBlogHandlers(options: { root: string; config: BlogConfig; basePath?: string }) {
  const current = () => handlersFor({ ...options, config: readSettings(options.root, options.config).config });
  return {
    RSS: () => current().RSS(), Sitemap: () => current().Sitemap(), Search: () => current().Search(), Llms: () => current().Llms(),
    Markdown: (request: Request, context: { params: Promise<{ slug: string }> }) => current().Markdown(request, context),
    StudioAPI: (request: Request) => authorizeStudio(request) ? current().StudioAPI(request) : Promise.resolve(Response.json({ error: "Not found" }, { status: 404, headers: { "cache-control": "no-store" } })),
  };
}
