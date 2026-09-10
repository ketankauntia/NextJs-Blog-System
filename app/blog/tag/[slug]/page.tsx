import { buildPageMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";
import { notFound } from "next/navigation";
import { PostBreadcrumbs } from "@/components/blog/post-breadcrumbs";
import { PostGrid } from "@/components/blog/post-grid";
import { JournalListing } from "@/components/blog/templates/journal-listing";
import { getSettings } from "@/lib/settings";
import { ListingJsonLd } from "@/components/blog/listing-json-ld";
import { getAllTags, getPostsByTag, getTagBySlug, tagToSlug } from "@/lib/blog/content";
import { features } from "@/lib/features";

// ISR: regenerate hourly so scheduled posts + content changes surface without a rebuild.
export const revalidate = 3600;

export function generateStaticParams() {
  if (!features.tagPages) return [];
  return getAllTags().map((tag) => ({ slug: tagToSlug(tag) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tag = getTagBySlug(slug);
  if (!tag) return {};
  return buildPageMetadata({
    title: [`#${tag} articles`, `#${tag}`],
    description: `Every article tagged "${tag}" on ${siteConfig.name}.`,
    descriptionExtras: [siteConfig.description],
    path: `/blog/tag/${slug}`,
    index: false,
  });
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  if (!features.tagPages) notFound();
  const { slug } = await params;
  const tag = getTagBySlug(slug);
  if (!tag) notFound();

  const posts = getPostsByTag(tag);

  return (
    <main id="main-content" className="mx-auto w-full max-w-shell flex-1 px-4 py-12 sm:px-6 sm:py-16">
      <ListingJsonLd posts={posts} name={`#${tag}`} />
      <PostBreadcrumbs trail={[{ label: "Blog", href: "/blog" }, { label: `#${tag}` }]} />
      <header className="mt-7 max-w-2xl">
        <p className="font-mono text-xs tracking-[0.16em] text-primary">TAG ARCHIVE</p>
        <h1 className="mt-3 font-heading text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">#{tag}</h1>
        <p className="mt-3 text-muted-foreground">
          {posts.length} article{posts.length === 1 ? "" : "s"} connected to this tag.
        </p>
      </header>
      <div className="mt-8">
        {getSettings().blogTemplate === "journal" ? (
          <JournalListing posts={posts} isFirstPage={false} />
        ) : (
          <PostGrid posts={posts} />
        )}
      </div>
    </main>
  );
}
