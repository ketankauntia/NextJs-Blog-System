import Link from "next/link";
import { cn } from "@/lib/utils";

type CategoryLink = { label: string; slug: string; count?: number };

/** Category filter chips linking to static category routes. Shared by the index and category pages. */
export function CategoryChips({
  categories,
  activeSlug,
}: {
  categories: CategoryLink[];
  activeSlug?: string;
}) {
  return (
    <nav
      aria-label="Filter by category"
      className="category-navigation mt-6 flex flex-wrap gap-x-1 gap-y-2 border-b pb-4"
    >
      <Chip label="All" href="/blog" active={!activeSlug} />
      {categories.map((c) => (
        <Chip
          key={c.slug}
          label={c.label}
          count={c.count}
          href={`/blog/category/${c.slug}`}
          active={activeSlug === c.slug}
        />
      ))}
    </nav>
  );
}

function Chip({
  label,
  count,
  href,
  active,
}: {
  label: string;
  count?: number;
  href: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex min-h-10 items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
        active
          ? "bg-foreground text-background"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      {label}
      {typeof count === "number" ? (
        <span className="text-xs opacity-70">{count}</span>
      ) : null}
    </Link>
  );
}
