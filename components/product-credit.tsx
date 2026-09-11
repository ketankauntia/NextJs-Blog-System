import { productConfig } from "@/lib/product";

/** Required footer attribution on every public blog page; see LICENSE. */
export function ProductCredit() {
  return (
    <a href={productConfig.homepageUrl}
      className="inline-flex min-h-10 w-fit items-center gap-2 rounded-lg border bg-background px-3 py-2 text-xs text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
      <span aria-hidden="true" className="flex size-5 shrink-0 items-center justify-center rounded bg-foreground font-semibold text-background">{productConfig.glyph}</span>
      <span>{productConfig.branding.creditPrefix} <span className="font-semibold">{productConfig.name}</span></span>
    </a>
  );
}
