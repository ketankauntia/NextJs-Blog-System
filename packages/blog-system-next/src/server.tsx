import "server-only";
import { type ReactNode } from "react";
import { notFound } from "next/navigation.js";
import { headers } from "next/headers.js";
import type { Metadata } from "next";
import { defineBlog, type BlogConfig } from "./config.js";
import { createStore, readSettings } from "./storage.js";
import { slugify } from "./core.js";
import { studioEnabled, localHeaders, studioToken } from "./studio-security.js";
import { StudioEditor } from "./studio-client.js";
import {fontVariables} from './studio-fonts.js';
import { Viewport } from "./viewport.js";
import {readReviews} from './reviews.js';
import {PublicationView} from './public-entry.js';

export type BlogPageProps = { params: Promise<{ path?: string[] }>; searchParams?: Promise<Record<string, string | string[] | undefined>> };
const json = (v: unknown) => JSON.stringify(v).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");


function viewsFor({ root, config: input, basePath = "" }: { root: string; config: BlogConfig; basePath?: string }) {
  const config = defineBlog(input);
  const requestedAt = Date.now();
  if (basePath && !/^\/[a-z0-9]+(?:[-/][a-z0-9]+)*$/.test(basePath)) throw new Error("Invalid basePath.");
  const store = createStore(root, config);
  const route = basePath + config.route;
  const href = (suffix = "") => route + suffix;
  const absolute = (suffix = "") => config.siteUrl ? config.siteUrl + href(suffix) : undefined;
  const homeHref = basePath || "/", studioHref = basePath + config.studioRoute;
  async function Frame({ children }: { children: ReactNode }) {
    const local = config.studio && process.env.NODE_ENV === "development" && localHeaders(new Headers(await headers()));
    return <div className={`bsn-oss bsn-publication ${fontVariables}`} data-font={config.appearance?.fontPairing??'modern'}><header className="bsn-topbar"><a className="bsn-brand" href={homeHref}>{config.name}</a><nav aria-label="Blog"><a href={href()}>Blog</a>{config.siteUrl && <a href={href("/rss.xml")}>RSS</a>}{local && <a href={studioHref}>Studio</a>}</nav></header>{children}<footer><a href="https://nextjsblog.com">Powered by nextjsblog.com</a></footer></div>;
  }
  function Welcome({ local, unlock = false }: { local: boolean; unlock?: boolean }) {
    return <main className="bsn bsn-onboarding" data-theme={config.theme}><Viewport>
      <section className="bsn-welcome-content"><div className="bsn-welcome-icon" aria-hidden><svg viewBox="0 0 32 32" focusable="false"><path d="M25.4 5.1c-8.8.3-15 4.2-16.4 11.1-.5 2.5 0 4.8 1 6.8l2.2-4.3c1.4-2.8 3.7-5.1 7.1-7.2-3.4 2.9-5.5 5.8-6.3 8.8l-.8 3c2-1.1 4.1-2.3 5.8-3.8 3.5-3.1 5.7-7.6 7.4-14.4Z" /></svg></div>
        <h1>{unlock ? "Open your local Studio." : local ? <>Your blog <span>starts here.</span></> : "Good things are on the way."}</h1>
        {unlock && <p className="bsn-lead">Restart your development server with this command, then refresh this page. Studio is available only in local development.</p>}
        {unlock ? <><pre className="bsn-command"><code>npm run dev</code></pre><a className="bsn-primary" href={studioHref}>I’ve started Studio →</a></> : <a className="bsn-primary" href={local ? studioHref : homeHref}>{local ? "Open Studio" : "Back to website"} <span aria-hidden>↗</span></a>}
      </section><footer><a href="https://nextjsblog.com">Powered by nextjsblog.com</a></footer>
    </Viewport></main>;
  }
  function resolve(parts: string[] = []) {
    const posts = store.publicPosts();
    if (!parts.length) return { posts, title: config.name };
    if (parts.length === 2 && parts[0] === "post") { const post = posts.find(p => p.slug === parts[1]); if (!post) notFound(); return { posts: [post], post, title: post.title }; }
    if (parts.length === 2 && ["category", "tag", "author"].includes(parts[0])) {
      const filtered = posts.filter(p => (parts[0] === "category" ? [p.category] : parts[0] === "author" ? [p.author] : p.tags).some(v => slugify(v) === parts[1]));
      if (!filtered.length) notFound(); return { posts: filtered, title: `${parts[0]}: ${parts[1]}` };
    }
    notFound();
  }
  async function Page({ params, searchParams }: BlogPageProps) {
    const { path: parts } = await params;
    const result = resolve(parts);
    const query = (await searchParams) ?? {};
    if (!parts?.length && !result.posts.length && !query.q && (!query.page || query.page === "1")) {
      const local = process.env.NODE_ENV === "development" && localHeaders(new Headers(await headers()));
      return <Welcome local={local} />;
    }
    if (result.post) {
      const post = result.post;
      const structured = { "@context": "https://schema.org", "@type": "BlogPosting", headline: post.title, description: post.description, datePublished: post.publishedAt, dateModified: post.updatedAt ?? post.publishedAt, author: { "@type": "Person", name: post.author }, url: absolute(`/post/${post.slug}`) };
      return <Frame><PublicationView post={post} template={config.appearance?.postTemplate??'standard'} blogHref={href()} homeHref={homeHref} name={config.name}/>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json(structured) }} />
      </Frame>;
    }
    const term = typeof query.q === "string" ? query.q.slice(0, 200) : "";
    const posts = result.posts.filter(p => !term || `${p.title} ${p.description} ${p.body}`.toLowerCase().includes(term.toLowerCase()));
    const pageText = query.page ?? "1";
    if (typeof pageText !== "string" || !/^[1-9]\d{0,5}$/.test(pageText)) notFound();
    const page = Number(pageText), pages = Math.max(1, Math.ceil(posts.length / 10));
    if (page > pages) notFound();
    return <Frame><main className="mx-auto max-w-shell px-6 py-12 space-y-8"><h1 className="font-heading text-4xl font-semibold">{result.title}</h1><p>{config.description}</p><form action={href(parts?.length ? `/${parts.join("/")}` : "")}><label>Search posts<input className="rounded border p-2 mx-3" type="search" name="q" defaultValue={term} /></label><button type="submit">Search</button></form>
      <PublicationView posts={posts.slice((page - 1) * 10, page * 10)} template={config.appearance?.blogTemplate??'classic'} isFirstPage={page===1} blogHref={href()} homeHref={homeHref} name={config.name}/>
      {!posts.length && <p>No matching posts. Try another search.</p>}
      <nav aria-label="Pagination">{page > 1 && <a href={`?page=${page - 1}&q=${encodeURIComponent(term)}`}>Previous</a>}<span>Page {page} of {pages}</span>{page < pages && <a href={`?page=${page + 1}&q=${encodeURIComponent(term)}`}>Next</a>}</nav>
    </main></Frame>;
  }
  async function generateMetadata({ params, searchParams }: BlogPageProps): Promise<Metadata> {
    const { path: parts } = await params;
    const result = resolve(parts), post = result.post;
    const query = (await searchParams) ?? {};
    const canonical = post?.canonical ? new URL(post.canonical, config.siteUrl || "http://localhost").href : absolute(parts?.length ? `/${parts.join("/")}` : "");
    return { title: { absolute: result.title }, description: post?.description ?? config.description, alternates: canonical ? { canonical, types: { "application/rss+xml": absolute("/rss.xml")! } } : undefined,
      robots: { index: !!config.siteUrl && result.posts.length > 0 && !post?.noindex && !query.q && (!query.page || query.page === "1"), follow: true },
      openGraph: { title: result.title, description: post?.description ?? config.description, url: canonical, type: post ? "article" : "website", siteName: config.name } };
  }
  async function Studio() {
    if (!config.studio || process.env.NODE_ENV !== "development") notFound();
    const requestHeaders = new Headers(await headers());
    if (!localHeaders(requestHeaders)) notFound();
    if (!studioEnabled()) return <Welcome local unlock />;
    const snapshot = readSettings(root, input);
    const reviews=readReviews(root,config);
    return <div className={`bsn-oss ${fontVariables}`} data-font={snapshot.settings.appearance?.fontPairing??'modern'}><StudioEditor basePath={basePath} endpoint={studioHref + "/api"} token={studioToken()} initial={store.authoringSources()} initialSettings={snapshot.settings} initialDashboardSettings={snapshot.settings.appearance} initialSettingsRevision={snapshot.revision} initialReviews={reviews.reviews} reviewsRevision={reviews.revision} initialNow={requestedAt} blogHref={href()} homeHref={homeHref} studioHref={studioHref} /></div>;
  }
  return { Page, generateMetadata, Studio, getPosts: store.publicPosts };
}

export function createBlog(options: { root: string; config: BlogConfig; basePath?: string }) {
  const current = () => viewsFor({ ...options, config: readSettings(options.root, options.config).config });
  return { Page: (props: BlogPageProps) => current().Page(props), generateMetadata: (props: BlogPageProps) => current().generateMetadata(props), Studio: () => current().Studio(), getPosts: () => current().getPosts() };
}
