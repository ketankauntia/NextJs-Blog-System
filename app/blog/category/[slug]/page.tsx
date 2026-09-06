import { buildPageMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";
import { notFound } from "next/navigation";
import { PostGrid } from "@/components/blog/post-grid";
import { Pagination } from "@/components/blog/pagination";
import { CategoryChips } from "@/components/blog/category-chips";
import { ListingJsonLd } from "@/components/blog/listing-json-ld";
import { PostBreadcrumbs } from "@/components/blog/post-breadcrumbs";
import { Badge } from "@/components/blog-ui/badge";
import {
  categoryToSlug,
  getAllPosts,
  getCategories,
  getCategoryBySlug,
  paginate,
} from "@/lib/blog/content";

// ISR: regenerate hourly so scheduled posts + content changes surface without a rebuild.
export const revalidate = 3600;

export function generateStaticParams() {
  return getCategories().map((c) => ({ slug: categoryToSlug(c) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) return {};
  return buildPageMetadata({
    title: [`${category} articles`, category],
    description: `Every article filed under ${category.toLowerCase()} on ${siteConfig.name}.`,
    descriptionExtras: [siteConfig.description],
    path: `/blog/category/${slug}`,
  });
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  const allPosts = getAllPosts();
  const categories = getCategories().map((label) => ({ label, slug: categoryToSlug(label), count: allPosts.filter((post) => post.category === label).length }));
  const posts = allPosts.filter((p) => p.category === category);
  const { items, totalPages } = paginate(posts, 1);

  return (
    <main id="main-content" className="mx-auto w-full max-w-shell flex-1 px-4 py-12 sm:px-6 sm:py-16">
      <ListingJsonLd posts={posts} name={category} />
      <PostBreadcrumbs trail={[{ label: "Blog", href: "/blog" }, { label: category }]} />
      <header className="mt-7 max-w-2xl">
        <Badge variant="outline">TOPIC</Badge>
        <h1 className="mt-4 font-heading text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">{category}</h1>
        <p className="mt-3 text-muted-foreground">
          {posts.length} carefully structured article{posts.length === 1 ? "" : "s"} in this topic.
        </p>
      </header>

      <CategoryChips categories={categories} activeSlug={slug} />

      <div className="mt-8">
        <PostGrid posts={items} />
      </div>

      <Pagination basePath={`/blog/category/${slug}`} page={1} totalPages={totalPages} />
    </main>
  );
}
