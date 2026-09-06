import Link from "next/link";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

/**
 * Crawlable numbered pagination — real <a href> links (Google dropped rel=next/prev in 2019).
 * `basePath` is the listing root, e.g. "/blog" or "/blog/category/foo"; page 1 lives at basePath itself.
 */
export function Pagination({
  basePath,
  page,
  totalPages,
  className,
}: {
  basePath: string;
  page: number;
  totalPages: number;
  className?: string;
}) {
  if (totalPages <= 1) return null;

  const href = (p: number) => (p === 1 ? basePath : `${basePath}/page/${p}`);
  const pages = paginationItems(page, totalPages);

  return (
    <nav aria-label="Pagination" className={cn("mt-10 flex items-center justify-center gap-1", className)}>
      <PageLink
        href={href(page - 1)}
        disabled={page === 1}
        aria-label="Previous page"
        rel="prev"
      >
        <IconChevronLeft className="size-4" />
        <span className="hidden sm:inline">Previous</span>
      </PageLink>

      {pages.map((item) =>
        typeof item === "number" ? (
          <PageLink key={item} href={href(item)} active={item === page} aria-label={`Page ${item}`} aria-current={item === page ? "page" : undefined}>
            {item}
          </PageLink>
        ) : (
          <span key={item} className="flex size-9 items-center justify-center text-sm text-muted-foreground" aria-hidden>…</span>
        ),
      )}

      <PageLink href={href(page + 1)} disabled={page === totalPages} aria-label="Next page" rel="next">
        <span className="hidden sm:inline">Next</span>
        <IconChevronRight className="size-4" />
      </PageLink>
    </nav>
  );
}

function PageLink({
  href,
  active,
  disabled,
  children,
  ...rest
}: {
  href: string;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const className = cn(
    "inline-flex h-9 min-w-9 items-center justify-center gap-1.5 rounded-lg border px-2.5 text-sm transition-colors",
    active ? "border-primary bg-primary text-primary-foreground" : "hover:bg-accent",
    disabled && "pointer-events-none opacity-40",
  );
  // Disabled prev/next render as spans so they aren't crawlable dead links.
  if (disabled) {
    return (
      <span aria-hidden className={className}>
        {children}
      </span>
    );
  }
  return (
    <Link href={href} className={className} {...rest}>
      {children}
    </Link>
  );
}

function paginationItems(page: number, totalPages: number): Array<number | "ellipsis-start" | "ellipsis-end"> {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);

  const items: Array<number | "ellipsis-start" | "ellipsis-end"> = [1];
  let start = Math.max(2, page - 1);
  let end = Math.min(totalPages - 1, page + 1);

  if (page <= 4) end = 5;
  if (page >= totalPages - 3) start = totalPages - 4;
  if (start > 2) items.push("ellipsis-start");
  for (let current = start; current <= end; current += 1) items.push(current);
  if (end < totalPages - 1) items.push("ellipsis-end");
  items.push(totalPages);
  return items;
}
