import { ImageResponse } from "next/og";
import { getAllPosts, getPost } from "@/lib/blog/content";
import { getAuthor } from "@/lib/blog/authors";
import { siteConfig } from "@/lib/site";

export const alt = "Article cover";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Pre-render one card per post so sharing never waits on an on-demand render. */
export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

/** Per-post social card, used when a post ships no cover or ogImage of its own. */
export default async function PostOpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  const title = post?.title ?? siteConfig.name;
  const author = post ? getAuthor(post.authorSlug).name : "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(135deg, #0b1c1b 0%, #0f2e2b 55%, #134e48 100%)",
          color: "#f5f7f7",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 28 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: "#2dd4bf",
              color: "#04211f",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
              fontWeight: 700,
            }}
          >
            {siteConfig.shortName.slice(0, 1)}
          </div>
          <span style={{ fontWeight: 600 }}>{siteConfig.name}</span>
          {post?.category ? (
            <span style={{ color: "#8fd6cd" }}>· {post.category}</span>
          ) : null}
        </div>

        <div
          style={{
            display: "flex",
            // Long titles need a smaller size to stay on the card without clipping.
            fontSize: title.length > 70 ? 52 : 64,
            lineHeight: 1.15,
            letterSpacing: -1.5,
            fontWeight: 700,
          }}
        >
          {title}
        </div>

        <div style={{ display: "flex", gap: 20, fontSize: 26, color: "#8fd6cd" }}>
          {author ? <span>{author}</span> : null}
          {post ? <span>· {post.readingMinutes} min read</span> : null}
        </div>
      </div>
    ),
    size,
  );
}
