import { buildPageMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Pagination } from "@/components/blog/pagination";
import { CategoryChips } from "@/components/blog/category-chips";
import { PostBreadcrumbs } from "@/components/blog/post-breadcrumbs";
import { BlogListing } from "@/components/blog/templates/blog-listing";
import { categoryToSlug, getAllPosts, getCategories, paginate } from "@/lib/blog/content";
import { getSettings } from "@/lib/settings";
import { siteConfig } from "@/lib/site";
import { Badge } from "@/components/blog-ui/badge";

// ISR: regenerate hourly so scheduled posts + content changes surface without a rebuild.
export const revalidate = 3600;

/** Pre-render pages 2..N; page 1 lives at /blog. */
export function generateStaticParams() {
  const featured = getAllPosts().find((p) => p.featured);
  const rest = featured ? getAllPosts().length - 1 : getAllPosts().length;
  const { totalPages } = paginate(new Array(rest), 1);
  return Array.from({ length: Math.max(0, totalPages - 1) }, (_, i) => ({ page: String(i + 2) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ page: string }>;
}): Promise<Metadata> {
  const { page } = await params;
  return buildPageMetadata({
    title: `All articles - page ${page}`,
    description: `Page ${page} of the ${siteConfig.name} archive: essays and practical guides on engineering, design, product and adjacent craft.`,
    path: `/blog/page/${page}`,
  });
}

export default async function BlogPaginatedPage({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const { page } = await params;
  const pageNum = Number(page);
  if (!Number.isInteger(pageNum) || pageNum < 1) notFound();
  if (pageNum === 1) redirect("/blog");

  const posts = getAllPosts();
  const categories = getCategories().map((label) => ({ label, slug: categoryToSlug(label), count: posts.filter((post) => post.category === label).length }));
  const featured = posts.find((p) => p.featured);
  const rest = featured ? posts.filter((p) => p.slug !== featured.slug) : posts;
  const { items, totalPages, page: current } = paginate(rest, pageNum);
  if (current !== pageNum) notFound(); // out-of-range page

  return (
    <main id="main-content" className="mx-auto w-full max-w-shell flex-1 px-4 py-12 sm:px-6 sm:py-16">
      <PostBreadcrumbs trail={[{ label: "Blog", href: "/blog" }, { label: `Page ${pageNum}` }]} />
      <header className="mt-7 max-w-2xl">
        <Badge variant="outline">ARTICLE ARCHIVE</Badge>
        <h1 className="mt-4 font-heading text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
          All articles
        </h1>
        <p className="mt-3 text-muted-foreground">Page {pageNum} of {totalPages}. Continue through the complete publication.</p>
      </header>

      <CategoryChips categories={categories} />

      <div className="mt-8">
        <BlogListing template={getSettings().blogTemplate} posts={items} isFirstPage={false} />
      </div>

      <Pagination basePath="/blog" page={pageNum} totalPages={totalPages} />
    </main>
  );
}
