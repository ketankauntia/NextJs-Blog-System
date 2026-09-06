import type { Metadata } from "next";
import Link from "next/link";
import { IconArrowRight, IconRss } from "@tabler/icons-react";
import { Button } from "@/components/blog-ui/button";
import { CategoryChips } from "@/components/blog/category-chips";
import { HeaderSearch } from "@/components/blog/header-search";
import { ListingJsonLd } from "@/components/blog/listing-json-ld";
import { Pagination } from "@/components/blog/pagination";
import { BlogListing } from "@/components/blog/templates/blog-listing";
import { buildPageMetadata } from "@/lib/seo";
import {
  categoryToSlug,
  getAllPosts,
  getCategories,
  paginate,
} from "@/lib/blog/content";
import { getSettings } from "@/lib/settings";
import { siteConfig } from "@/lib/site";

export const revalidate = 3600;

export const metadata: Metadata = buildPageMetadata({
  title: "The live blog",
  description:
    "Explore the live reader experience produced by NextJs Blog System, including structured articles, topic archives, search, and static pagination.",
  path: "/blog",
});

export default function BlogIndexPage() {
  const posts = getAllPosts();
  const categories = getCategories().map((label) => ({
    label,
    slug: categoryToSlug(label),
    count: posts.filter((post) => post.category === label).length,
  }));
  const { blogTemplate } = getSettings();
  const featured = posts.find((post) => post.featured);
  const rest = featured
    ? posts.filter((post) => post.slug !== featured.slug)
    : posts;
  const { items, totalPages } = paginate(rest, 1);
  const pagePosts = featured ? [featured, ...items] : items;

  return (
    <main id="main-content" className="journal-surface w-full flex-1">
      <ListingJsonLd posts={posts} name={`${siteConfig.name} articles`} />
      <header>
        <div className="mx-auto max-w-shell px-5 pb-5 pt-12 sm:px-6 sm:pt-16">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-3xl">
              <p className="eyebrow">THE LIVE PUBLICATION</p>
              <h1 className="journal-title mt-4">
                The journal<span className="text-primary">.</span>
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
                Ideas, observations, and useful rabbit holes.
                <br className="hidden sm:block" /> A little engineering. A
                little design. A broader point of view.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <HeaderSearch label="Search articles" />
              <Button
                variant="outline"
                size="lg"
                asChild
                className="h-10 bg-background"
              >
                <a href="/rss.xml">
                  <IconRss className="size-4" aria-hidden />
                  RSS feed
                </a>
              </Button>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
            <span>{posts.length} articles</span>
            <span>{categories.length} topics</span>
            <Link href="/docs" className="ml-auto hover:text-primary">
              Published with Next.js Blog System ↗
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-shell px-5 pb-16 sm:px-6">
        <section aria-labelledby="topics-title">
          <h2 id="topics-title" className="sr-only">
            Explore articles by topic
          </h2>
          <CategoryChips categories={categories} />
        </section>

        <section className="mt-10" aria-label="Article archive">
          <BlogListing template={blogTemplate} posts={pagePosts} isFirstPage />
          <div className="mt-10 flex flex-col items-center gap-3 border-t pt-8">
            <p className="text-sm text-muted-foreground">
              Page 1 of {totalPages}
            </p>
            <Pagination
              basePath="/blog"
              page={1}
              totalPages={totalPages}
              className="mt-0"
            />
          </div>
        </section>

        <aside
          className="mt-16 grid gap-6 border-y py-9 lg:grid-cols-[1fr_auto] lg:items-center"
          aria-label="Build with NextJs Blog System"
        >
          <div>
            <p className="eyebrow">MAKE IT YOURS</p>
            <h2 className="mt-3 font-heading text-2xl font-medium tracking-tight">
              Your ideas could feel at home here, too.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
              This entire publication comes from Markdown. Start with the same
              system and give it your own point of view.
            </p>
          </div>
          <Button size="lg" asChild className="button-ink h-11 px-5">
            <Link href="/docs#get-started">
              Build your publication
              <IconArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
        </aside>
      </div>
    </main>
  );
}
