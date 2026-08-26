"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { IconSearch, IconX } from "@tabler/icons-react";
import { Badge } from "@/components/blog-ui/badge";
import { Button } from "@/components/blog-ui/button";
import { Input } from "@/components/blog-ui/input";
import { useSearch } from "@/lib/blog/use-search";

/**
 * The expanded search UI. Mounted only once the reader opens search, which is
 * what keeps Fuse.js and the index out of every other page load.
 */
export function SearchPanel({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const { results, ready } = useSearch(query);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the field as soon as it appears.
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Collapse on click-outside or Escape.
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) onClose();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const trimmed = query.trim();

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center gap-1">
        <div className="relative">
          <IconSearch
            aria-hidden
            className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles…"
            aria-label="Search articles"
            className="h-9 w-44 pl-8 sm:w-72"
          />
        </div>
        <Button variant="ghost" size="icon" aria-label="Close search" onClick={onClose}>
          <IconX className="size-4" aria-hidden />
        </Button>
      </div>

      {trimmed.length >= 2 && (
        <div
          role="listbox"
          aria-label="Search results"
          className="absolute right-0 top-full z-50 mt-2 w-[min(92vw,26rem)] overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-lg"
        >
          {!ready ? (
            <p className="p-4 text-sm text-muted-foreground">Loading search…</p>
          ) : results.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">
              No results for &ldquo;{trimmed}&rdquo;.
            </p>
          ) : (
            <ul className="max-h-[min(70vh,28rem)] divide-y overflow-y-auto">
              {results.map((post) => (
                <li key={post.slug}>
                  <Link
                    href={`/blog/post/${post.slug}`}
                    onClick={onClose}
                    className="block px-4 py-3 transition-colors hover:bg-accent"
                  >
                    <Badge variant="secondary" className="mb-1">
                      {post.category}
                    </Badge>
                    <p className="font-heading text-sm font-semibold leading-tight">{post.title}</p>
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
    </div>
  );
}
