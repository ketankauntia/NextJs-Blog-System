import type { Metadata } from "next";
import Link from "next/link";
import { IconArrowRight } from "@tabler/icons-react";
import { BlogSiteFooter } from "@/components/blog-site-footer";
import { BlogSiteHeader } from "@/components/blog-site-header";
import { Button } from "@/components/blog-ui/button";
import { CategoryChips } from "@/components/blog/category-chips";
import { PostCard } from "@/components/blog/post-card";
import { PostGrid } from "@/components/blog/post-grid";
import { FeatureGrid } from "@/components/blog/feature-grid";
import { SiteJsonLd } from "@/components/blog/site-json-ld";
import { categoryToSlug, getAllPosts, getAllTags, getCategories, paginate } from "@/lib/blog/content";
import { authors } from "@/lib/blog/authors";
import { buildPageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

// Same hourly cadence as the archive, so a scheduled post appears without a rebuild.
export const revalidate = 3600;

export const metadata: Metadata = buildPageMetadata({
  title: ["Markdown in, structured pages out", siteConfig.name],
  description:
    "Write markdown, get fast and structured pages. Schema, feeds, social cards and a local authoring studio are already wired up for you.",
  path: "/",
});

const LATEST_COUNT = 6;

export default function HomePage() {
  const posts = getAllPosts();
  const categories = getCategories().map((c) => ({ label: c, slug: categoryToSlug(c) }));
  const lead = posts.find((p) => p.featured) ?? posts[0];

  // Same arithmetic the sitemap uses, so the count on the page is the real one.
  const { totalPages } = paginate(new Array(posts.filter((p) => !p.featured).length), 1);
  const pageCount =
    2 + // home + /blog
    Math.max(0, totalPages - 1) +
    posts.length +
    categories.length +
    getAllTags().length +
    authors.length;
  const latest = posts.filter((p) => p.slug !== lead?.slug).slice(0, LATEST_COUNT);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <BlogSiteHeader />
      <SiteJsonLd />
      <main className="mx-auto w-full max-w-shell flex-1 px-4 py-12 sm:px-6">
        <section className="max-w-3xl">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {siteConfig.name}
          </p>
          <h1 className="mt-4 font-heading text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl">
            {siteConfig.description}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Every post is a markdown file. Structure, table of contents, schema, feeds and social
            cards are derived from it — so the writing is the only thing left to do.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/blog">
                Read the archive
                <IconArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <a href="/rss.xml">Subscribe by RSS</a>
            </Button>
          </div>

          <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-4 border-t pt-6">
            {[
              { value: String(posts.length), label: "articles published" },
              { value: String(categories.length), label: "categories" },
              { value: "0", label: "database rows" },
            ].map((stat) => (
              <div key={stat.label}>
                <dt className="sr-only">{stat.label}</dt>
                <dd>
                  <span className="font-heading text-2xl font-bold tracking-tight">
                    {stat.value}
                  </span>{" "}
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {lead ? (
          <section className="mt-14" aria-labelledby="lead-heading">
            <h2 id="lead-heading" className="sr-only">
              Featured article
            </h2>
            <PostCard post={lead} featured />
          </section>
        ) : null}

        <section className="mt-14" aria-labelledby="latest-heading">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 id="latest-heading" className="font-heading text-2xl font-bold tracking-tight">
              Latest
            </h2>
            <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground">
              All articles →
            </Link>
          </div>
          <CategoryChips categories={categories} />
          <div className="mt-6">
            <PostGrid posts={latest} />
          </div>
        </section>

        <div className="mt-20 border-t pt-14">
          <FeatureGrid pageCount={pageCount} />
        </div>
      </main>
      <BlogSiteFooter />
    </div>
  );
}
