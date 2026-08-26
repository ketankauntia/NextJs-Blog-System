import Link from "next/link";
import { Button } from "@/components/blog-ui/button";
import { BlogThemeToggle } from "@/components/blog-theme-toggle";
import { HeaderSearch } from "@/components/blog/header-search";
import { siteConfig } from "@/lib/site";

export function BlogSiteHeader() {
  // The authoring studio writes files on disk, so it exists only while developing.
  const showDashboard = process.env.NODE_ENV !== "production";

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-shell items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2" aria-label={`${siteConfig.name} home`}>
          <span
            aria-hidden
            className="flex size-7 items-center justify-center rounded-md bg-primary font-heading text-sm font-bold text-primary-foreground"
          >
            {siteConfig.shortName.slice(0, 1)}
          </span>
          <span className="font-heading text-base font-semibold tracking-tight">
            {siteConfig.shortName}
          </span>
        </Link>
        <nav className="flex items-center gap-1" aria-label="Primary">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/blog">Articles</Link>
          </Button>
          {showDashboard ? (
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">Studio</Link>
            </Button>
          ) : null}
          <HeaderSearch />
          <BlogThemeToggle />
        </nav>
      </div>
    </header>
  );
}
