import Link from "next/link";
import { IconArrowUpRight } from "@tabler/icons-react";
import { MobileNavigation } from "@/components/mobile-navigation";
import { Button } from "@/components/blog-ui/button";
import { BlogThemeToggle } from "@/components/blog-theme-toggle";
import { siteConfig } from "@/lib/site";
import { isStudioVisible } from "@/lib/studio-access";
import { productConfig } from "@/lib/product";

const primaryLinks = [
  { label: "Product", href: "/#product" },
  { label: "Blog", href: "/blog" },
  { label: "Docs", href: "/docs" },
];

export function BlogSiteHeader() {
  const showStudio = isStudioVisible();

  return (
    <header className="site-header sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-xl">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <div className="site-header-inner mx-auto flex max-w-shell items-center gap-3 px-5 sm:px-6">
        <Link
          href="/"
          className="group flex min-w-0 items-center gap-2.5"
          aria-label={`${siteConfig.name} home`}
        >
          <span aria-hidden className="brand-glyph shrink-0">
            {productConfig.glyph}
          </span>
          <span className="brand-name truncate">
            {productConfig.shortWordmark} <small className="hidden sm:inline">/ {productConfig.nameSuffix}</small>
          </span>
        </Link>

        <nav
          className="ml-auto hidden items-center gap-2 lg:flex"
          aria-label="Primary navigation"
        >
          {primaryLinks.map((link) => (
            <Button key={link.href} variant="ghost" size="lg" asChild>
              <Link href={link.href}>{link.label}</Link>
            </Button>
          ))}
          {showStudio ? (
            <Button variant="ghost" size="lg" asChild>
              <Link href="/dashboard">
                Studio
                <IconArrowUpRight
                  className="size-3.5 text-muted-foreground"
                  aria-hidden
                />
              </Link>
            </Button>
          ) : null}
        </nav>

        <div className="ml-auto flex items-center gap-1 lg:ml-5">
          <BlogThemeToggle />
          <Button
            size="lg"
            asChild
            className="button-ink ml-2 hidden h-10 px-4 sm:inline-flex"
          >
            <Link href="/docs#get-started">
              Get started
              <IconArrowUpRight className="size-4" aria-hidden />
            </Link>
          </Button>

          <MobileNavigation
            showStudio={showStudio}
          />
        </div>
      </div>
    </header>
  );
}
