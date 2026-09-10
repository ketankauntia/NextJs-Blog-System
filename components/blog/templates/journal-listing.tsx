import Link from "next/link";
import { IconArrowUpRight } from "@tabler/icons-react";
import { PostCover } from "@/components/blog/post-cover";
import { getAuthor } from "@/lib/blog/authors";
import { formatDate } from "@/lib/blog/format";
import type { Post } from "@/lib/blog/types";
import styles from "./journal-listing.module.css";

/** Optional listing treatment. Its typography and cover styling stay inside this component. */
export function JournalListing({ posts, isFirstPage }: { posts: Post[]; isFirstPage: boolean }) {
  if (posts.length === 0) {
    return <p className="py-12 text-center text-muted-foreground">No articles here yet.</p>;
  }

  const featured = isFirstPage ? posts.find((post) => post.featured) ?? posts[0] : undefined;
  const stories = featured ? posts.filter((post) => post.slug !== featured.slug) : posts;

  return (
    <div className={styles.journal}>
      {featured && (
        <article className={styles.feature}>
          <Link href={`/blog/post/${featured.slug}`} className={styles.featureLink}>
            <PostCover
              post={featured}
              decorative
              preload
              showCategory={false}
              sizes="(min-width: 1280px) 568px, (min-width: 768px) 48vw, 100vw"
              className={styles.featureCover}
            />
            <div className={styles.featureCopy}>
              <p className={styles.eyebrow}>
                {featured.featured ? "Featured" : "Latest story"}<span aria-hidden> · </span>{featured.category}
              </p>
              <h2 className={styles.featureTitle}>{featured.title}</h2>
              <p className={styles.featureDescription}>{featured.description}</p>
              <p className={styles.meta}>
                {getAuthor(featured.authorSlug).name}<span aria-hidden> · </span>{featured.readingMinutes} min read
              </p>
              <span className={styles.readStory}>Read story <IconArrowUpRight className="size-4" aria-hidden /></span>
            </div>
          </Link>
        </article>
      )}

      {stories.length > 0 && (
        <section aria-label={featured ? "Latest stories" : "Stories"}>
          {featured && <h2 className={styles.sectionTitle}>Latest stories</h2>}
          <div className={styles.stories}>
            {stories.map((post) => (
              <article key={post.slug} className={styles.story}>
                <Link href={`/blog/post/${post.slug}`} className={styles.storyLink}>
                  <PostCover
                    post={post}
                    decorative
                    showCategory={false}
                    sizes="(min-width: 1024px) 144px, (min-width: 640px) 20vw, 112px"
                    className={styles.storyCover}
                  />
                  <div className={styles.storyCopy}>
                    <p className={styles.eyebrow}>{post.category}</p>
                    <h3 className={styles.storyTitle}>{post.title}</h3>
                    <p className={styles.description}>{post.description}</p>
                    <p className={styles.storyMeta}>
                      <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
                      <span aria-hidden> · </span>{post.readingMinutes} min
                    </p>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
