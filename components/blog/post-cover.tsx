import Image from "next/image";
import { cn } from "@/lib/utils";
import type { Post } from "@/lib/blog/types";

const tones: Record<Post["coverTone"], string> = {
  primary: "cover-ink",
  "chart-2": "cover-paper",
  "chart-3": "cover-blue",
  "chart-5": "cover-clay",
};

const coverType: Record<string, [string, string]> = {
  Engineering: ["{ query }", "A CLOSER LOOK AT THE SYSTEM"],
  Design: ["Aa", "FORM FOLLOWS READING"],
  "Artificial Intelligence": ["context.", "INTELLIGENCE IN PERSPECTIVE"],
  Product: ["Decide.", "THOUGHTFUL PRODUCT WORK"],
  Travel: ["Elsewhere", "A DIFFERENT POINT OF VIEW"],
  Food: ["To taste.", "NOTES FROM THE KITCHEN"],
  Climate: ["Tomorrow", "SYSTEMS FOR A CHANGING WORLD"],
  "Personal Finance": ["Over time.", "THE LONG VIEW"],
  Health: ["Find pace.", "A PRACTICE, NOT A FINISH LINE"],
};

/** Responsive images with original typographic covers when an image is absent. */
export function PostCover({
  post,
  className,
  decorative = false,
  preload = false,
  sizes = "100vw",
  showCategory,
}: {
  post: Pick<
    Post,
    "coverTone" | "category" | "title" | "coverImage" | "coverAlt" | "ogImage"
  >;
  className?: string;
  /** Linked cards already have a text heading, so their repeated cover image should have empty alt text. */
  decorative?: boolean;
  /** Preload only the above-the-fold article or featured cover that can become the LCP image. */
  preload?: boolean;
  /** Responsive source-size hint passed to next/image. */
  sizes?: string;
  /** Optional category overlay on real images; typographic covers include their own label. */
  showCategory?: boolean;
}) {
  const imageSrc = post.coverImage ?? post.ogImage;
  const [coverWord, coverCaption] = coverType[post.category] ?? [
    post.category,
    "IDEAS WORTH EXPLORING",
  ];
  const displayCategory = imageSrc
    ? showCategory === true
    : showCategory !== false;

  return (
    <div
      className={cn(
        "relative flex items-end overflow-hidden rounded-lg bg-card",
        !imageSrc && "typographic-cover",
        !imageSrc && tones[post.coverTone],
        className,
      )}
    >
      {imageSrc ? (
        <Image
          src={imageSrc}
          alt={decorative ? "" : post.coverAlt?.trim() || post.title}
          fill
          sizes={sizes}
          preload={preload}
          className="object-cover"
        />
      ) : (
        <div className="cover-typesetting" aria-hidden="true">
          <span className="cover-edition">
            THE JOURNAL <span>/{post.category}</span>
          </span>
          <span className="cover-word">{coverWord}</span>
          <span className="cover-caption">
            {coverCaption}
            <span>↗</span>
          </span>
        </div>
      )}
      {displayCategory && (
        <span className="relative z-10 m-4 rounded-md bg-background/85 px-2 py-1 text-xs font-medium text-foreground">
          {post.category}
        </span>
      )}
    </div>
  );
}
