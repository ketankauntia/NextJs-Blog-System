import { productConfig } from "@/lib/product";

/** Optional attribution for the open-source publishing system. */
export function ProductCredit() {
  return (
    <a href={productConfig.homepageUrl} rel={productConfig.branding.linkRel}
      className="inline-flex min-h-8 items-center rounded text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
      {productConfig.branding.creditPrefix} {productConfig.name}
    </a>
  );
}
