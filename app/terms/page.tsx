import { readFileSync } from "node:fs";
import path from "node:path";
import { BlogSiteHeader } from "@/components/blog-site-header";
import { BlogSiteFooter } from "@/components/blog-site-footer";
import { LicenseNotice } from "@/components/license-notice";
import { ProductCredit } from "@/components/product-credit";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Terms & license",
  description: "Publication use, required footer attribution, and restrictions on resale and commercial derivatives of Next.js Blog System.",
  path: "/terms",
});

export default function TermsPage() {
  const license = readFileSync(path.join(process.cwd(), "LICENSE"), "utf8");
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <BlogSiteHeader />
      <main id="main-content" className="mx-auto w-full max-w-3xl flex-1 px-5 py-12 sm:px-6 sm:py-20">
        <p className="eyebrow">SOFTWARE TERMS</p>
        <h1 className="mt-4 font-heading text-4xl font-semibold tracking-tight">Terms & license</h1>
        <p className="mt-4 text-muted-foreground">Version 1.1 · September 11, 2026</p>
        <LicenseNotice />
        <section aria-labelledby="attribution-title" className="my-10">
          <h2 id="attribution-title" className="font-heading text-2xl font-semibold">How to link back</h2>
          <p className="my-4 leading-7 text-muted-foreground">Keep this credit in the shared blog footer so it appears on the landing page, every article, and all category, tag, author and pagination pages. Your own publication name, domain and content remain yours.</p>
          <ProductCredit />
          <p className="mt-4 text-sm leading-6 text-muted-foreground">Use the supplied ProductCredit component or this equivalent HTML. The link must go directly to our website without a redirect. Adding <code>rel=&quot;nofollow&quot;</code> or <code>rel=&quot;sponsored&quot;</code> is allowed if you prefer.</p>
          <pre className="mt-4 overflow-x-auto rounded-lg border bg-muted p-4 text-sm"><code>{'<a href="https://nextjsblog.com">Powered by nextjsblog.com</a>'}</code></pre>
        </section>
        <section aria-labelledby="license-title" className="border-t pt-8">
          <h2 id="license-title" className="font-heading text-2xl font-semibold">Full software license</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">The full license below governs the software permissions; the summary above is a guide. This project was published under MIT for about thirty minutes at launch and relicensed before anyone took a copy, so this license governs every copy. Third-party materials keep their own licenses.</p>
          <div className="mt-6 space-y-5 text-sm leading-7">
            {license.trim().split(/\r?\n\s*\r?\n/).map((paragraph, index) => (
              <p key={index} className="whitespace-pre-line">{paragraph}</p>
            ))}
          </div>
        </section>
      </main>
      <BlogSiteFooter />
    </div>
  );
}
