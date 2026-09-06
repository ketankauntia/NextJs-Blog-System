"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { IconSearch, IconArrowUpRight } from "@tabler/icons-react";
import { Badge } from "@/components/blog-ui/badge";
import {
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/blog-ui/dialog";
import { Input } from "@/components/blog-ui/input";
import { useSearch } from "@/lib/blog/use-search";

/**
 * The expanded search UI. Mounted only once the reader opens search, which is
 * what keeps Fuse.js and the index out of every other page load.
 */
export function SearchPanel({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const { results, ready, error } = useSearch(query);
  const inputRef = useRef<HTMLInputElement>(null);

  const trimmed = query.trim();

  return (
    <DialogContent
      className="top-[18%] translate-y-0 gap-0 p-0 sm:max-w-xl"
      onOpenAutoFocus={(event) => {
        event.preventDefault();
        inputRef.current?.focus();
      }}
    >
      <DialogTitle className="sr-only">Search the journal</DialogTitle>
      <DialogDescription className="sr-only">
        Search article titles and content. Enter at least two characters.
      </DialogDescription>
      <div className="flex items-center gap-1">
        <div className="relative w-full border-b px-3 py-2 pr-12">
          <IconSearch
            aria-hidden
            className="absolute left-5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles…"
            aria-label="Search articles"
            className="h-12 w-full border-0 bg-transparent pl-9 shadow-none focus-visible:ring-0"
          />
        </div>
      </div>

      {trimmed.length < 2 ? (
        <div className="px-6 py-10 text-center">
          <IconSearch
            className="mx-auto mb-3 size-6 text-muted-foreground"
            aria-hidden
          />
          <p className="text-sm text-muted-foreground">
            An idea, a topic, a useful rabbit hole.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Type at least two characters to start exploring.
          </p>
        </div>
      ) : (
        <div
          role="region"
          aria-label="Search results"
          aria-live="polite"
          className="overflow-hidden text-popover-foreground"
        >
          {error ? (
            <p className="p-6 text-sm text-muted-foreground">
              Search is unavailable right now.{" "}
              <Link
                href="/blog"
                onClick={onClose}
                className="text-primary underline underline-offset-4"
              >
                Browse the journal
              </Link>{" "}
              to find your next read.
            </p>
          ) : !ready ? (
            <p className="p-4 text-sm text-muted-foreground">Loading search…</p>
          ) : results.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">
              No results for &ldquo;{trimmed}&rdquo;.
            </p>
          ) : (
            <ul className="max-h-[min(50vh,28rem)] divide-y overflow-y-auto">
              {results.map((post) => (
                <li key={post.slug}>
                  <Link
                    href={`/blog/post/${post.slug}`}
                    onClick={onClose}
                    className="group block px-6 py-4 transition-colors hover:bg-accent focus-visible:-outline-offset-2"
                  >
                    <Badge variant="secondary" className="mb-1">
                      {post.category}
                    </Badge>
                    <p className="flex items-center justify-between gap-3 font-heading text-sm font-semibold leading-snug">
                      {post.title}
                      <IconArrowUpRight
                        className="size-4 shrink-0 text-muted-foreground"
                        aria-hidden
                      />
                    </p>
                    <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                      {post.description}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      <div className="flex justify-between border-t px-6 py-3 text-xs text-muted-foreground">
        <span>Search the full publication</span>
        <span>Esc to close</span>
      </div>
    </DialogContent>
  );
}
