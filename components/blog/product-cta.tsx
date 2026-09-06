import Link from "next/link";
import { IconArrowRight, IconBrandGithub } from "@tabler/icons-react";
import { Button } from "@/components/blog-ui/button";
import { siteConfig } from "@/lib/site";

export function ProductCta() {
  return (
    <aside
      aria-label="Build with NextJs Blog System"
      className="product-site relative border-y py-8"
    >
      <div className="relative">
        <p className="eyebrow">MAKE IT YOURS</p>
        <h2 className="mt-3 font-heading text-2xl font-medium tracking-tight">
          A place for your point of view.
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
          This reading experience comes with the system. Start with the code,
          bring your ideas, and make the publication your own.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild className="button-ink h-10 px-4">
            <Link href="/docs#get-started">
              See the quick start
              <IconArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
          <Button variant="outline" asChild className="h-10 px-4">
            <a href={siteConfig.social.github} target="_blank" rel="noreferrer">
              <IconBrandGithub className="size-4" aria-hidden />
              View source
            </a>
          </Button>
        </div>
      </div>
    </aside>
  );
}
