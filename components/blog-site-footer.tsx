import Link from "next/link";
import { IconRss } from "@tabler/icons-react";
import { siteConfig } from "@/lib/site";

const FOOTER_LINKS = [
  { label: "Home", href: "/" },
  { label: "Articles", href: "/blog" },
];

export function BlogSiteFooter() {
  return (
    <footer className="mt-auto border-t">
      <div className="mx-auto flex max-w-shell flex-col gap-3 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          © {new Date().getFullYear()} {siteConfig.name}. Built by Ketan.
        </p>
        <nav className="flex flex-wrap items-center gap-x-4 gap-y-2" aria-label="Footer">
          {FOOTER_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-foreground">
              {link.label}
            </Link>
          ))}
          <a
            href="/rss.xml"
            className="inline-flex items-center gap-1 hover:text-foreground"
            aria-label="RSS feed"
          >
            <IconRss className="size-4" aria-hidden />
            RSS
          </a>
        </nav>
      </div>
    </footer>
  );
}
