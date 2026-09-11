import { productConfig } from "@/lib/product";

/** Required footer attribution on every public blog page; see LICENSE. */
export function ProductCredit() {
  return (
    <a href={productConfig.homepageUrl}
      className="inline-flex min-h-8 items-center text-xs text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
      {productConfig.branding.creditPrefix} {productConfig.name}
    </a>
  );
}
