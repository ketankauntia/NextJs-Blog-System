import type { Metadata } from "next";
import Link from "next/link";
import { BlogSiteFooter } from "@/components/blog-site-footer";
import { BlogSiteHeader } from "@/components/blog-site-header";
import { Button } from "@/components/blog-ui/button";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <BlogSiteHeader />
      <main className="mx-auto flex w-full max-w-content flex-1 flex-col items-start justify-center px-4 py-24 sm:px-6">
        <p className="font-mono text-sm text-muted-foreground">404</p>
        <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
          That page does not exist
        </h1>
        <p className="mt-3 text-muted-foreground">
          The link may be out of date, or the article may have been renamed. The archive is the
          fastest way to find it again.
        </p>
        <div className="mt-6 flex gap-3">
          <Button asChild>
            <Link href="/blog">Browse all articles</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Go home</Link>
          </Button>
        </div>
      </main>
      <BlogSiteFooter />
    </div>
  );
}
