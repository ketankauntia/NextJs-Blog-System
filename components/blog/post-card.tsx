import Link from "next/link";
import { IconArrowUpRight, IconClock } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { getAuthor } from "@/lib/blog/authors";
import type { Post } from "@/lib/blog/types";
import { PostCover } from "./post-cover";
import { formatDate } from "@/lib/blog/format";

/** Card used on the index grid, featured slot, and related-posts rail. */
export function PostCard({
  post,
  featured = false,
  className,
}: {
  post: Post;
  featured?: boolean;
  className?: string;
}) {
  const author = getAuthor(post.authorSlug);

  return (
    <Link
      href={`/blog/post/${post.slug}`}
      className={cn(
        "post-card group flex min-w-0 flex-col gap-5 rounded-lg",
        featured && "post-card-featured md:flex-row md:items-stretch md:gap-10",
        className,
      )}
    >
      <PostCover
        post={post}
        decorative
        showCategory={false}
        preload={featured}
        sizes={
          featured
            ? "(min-width: 768px) 40vw, 100vw"
            : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        }
        className={cn(
          "aspect-[1.6] shrink-0 rounded-lg",
          featured && "md:aspect-auto md:min-h-80 md:w-[50%]",
        )}
      />
      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col gap-3",
          featured && "md:justify-center md:py-5",
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <span className="font-mono text-xs tracking-wide text-primary">
            {featured
              ? `FEATURED / ${post.category.toUpperCase()}`
              : post.category}
          </span>
          <IconArrowUpRight
            className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
            aria-hidden
          />
        </div>
        <h3
          className={cn(
            "font-heading font-semibold leading-snug tracking-tight group-hover:text-primary",
            featured ? "text-3xl md:text-4xl" : "text-xl",
          )}
        >
          {post.title}
        </h3>
        <p
          className={cn(
            "text-sm leading-6 text-muted-foreground",
            featured ? "line-clamp-3" : "line-clamp-2",
          )}
        >
          {post.description}
        </p>
        <div className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 pt-2 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{author.name}</span>
          <span aria-hidden>·</span>
          <time dateTime={post.publishedAt}>
            {formatDate(post.publishedAt)}
          </time>
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-1">
            <IconClock className="size-3.5" />
            {post.readingMinutes} min
          </span>
        </div>
      </div>
    </Link>
  );
}
