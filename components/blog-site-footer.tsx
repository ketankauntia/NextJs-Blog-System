import Link from "next/link";
import {
  IconBrandX,
  IconBrandGithub,
  IconRss,
} from "@tabler/icons-react";
import { siteConfig } from "@/lib/site";
import { isStudioVisible } from "@/lib/studio-access";
import { ProductCredit } from "@/components/product-credit";
import { productConfig } from "@/lib/product";

const columns = [
  {
    title: "Product",
    links: [
      { label: "Overview", href: "/#product" },
      { label: "Reader experience", href: "/#reader-experience" },
      { label: "Features", href: "/#features" },
      { label: "Live blog", href: "/blog" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "/docs" },
      { label: "Terms & license", href: "/terms" },
      { label: "Install with AI", href: "/docs/agent-setup" },
      { label: "RSS feed", href: "/rss.xml" },
      { label: "llms.txt", href: "/llms.txt" },
      { label: "Search index", href: "/search-index.json" },
    ],
  },
] as const;

export function BlogSiteFooter() {
  const showStudio = isStudioVisible();
  return (
    <footer className="site-footer mt-auto border-t">
      <div className="mx-auto max-w-shell px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div className="col-span-2 max-w-sm lg:col-span-1">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 font-heading font-semibold"
            >
              <span className="brand-glyph" aria-hidden>
                {productConfig.glyph}
              </span>
              {productConfig.wordmark}
            </Link>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              The publishing layer Next.js projects are missing. An open-source
              CMS built around content you own.
            </p>
            <div className="mt-5 flex items-center gap-1">
              <a
                href={siteConfig.social.x}
                target="_blank"
                rel="noreferrer"
                aria-label="Follow Ketan on X"
                className="inline-flex size-11 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <IconBrandX className="size-5" aria-hidden />
              </a>
              <a
                href={siteConfig.social.github}
                target="_blank"
                rel="noreferrer"
                aria-label="View the GitHub repository"
                className="inline-flex size-11 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <IconBrandGithub className="size-5" aria-hidden />
              </a>
            </div>
          </div>

          {columns.map((column) => (
            <nav key={column.title} aria-label={`${column.title} links`}>
              <p className="text-sm font-semibold text-foreground">
                {column.title}
              </p>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="hover:text-foreground">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <nav aria-label="Project links">
            <p className="text-sm font-semibold text-foreground">Project</p>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li>
                <a
                  href={siteConfig.social.github}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-foreground"
                >
                  GitHub repository
                </a>
              </li>
              {showStudio ? (
                <li>
                  <Link href="/dashboard" className="hover:text-foreground">
                    Studio demo
                  </Link>
                </li>
              ) : null}
              {showStudio ? (
                <li>
                  <Link
                    href="/dashboard/preview"
                    className="hover:text-foreground"
                  >
                    Design playground
                  </Link>
                </li>
              ) : null}
              <li>
                <a href="/sitemap.xml" className="hover:text-foreground">
                  Sitemap
                </a>
              </li>
              <li>
                <a
                  href="/rss.xml"
                  className="inline-flex items-center gap-1.5 hover:text-foreground"
                >
                  <IconRss className="size-3.5" aria-hidden />
                  Subscribe
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}.{" "}
            <Link href="/terms" className="underline underline-offset-4 hover:text-foreground">Terms & license</Link>
          </p>
          <div className="flex flex-col gap-1 sm:items-end">
            <ProductCredit />
          </div>
        </div>
      </div>
    </footer>
  );
}
