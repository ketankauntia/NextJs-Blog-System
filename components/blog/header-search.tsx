"use client";

import { useCallback, useState } from "react";
import dynamic from "next/dynamic";
import { IconSearch } from "@tabler/icons-react";
import { Button } from "@/components/blog-ui/button";

/**
 * Inline expanding header search. This file is the trigger only: the panel,
 * Fuse.js and the search index are a separate chunk fetched on first open, so
 * readers who never search never download any of it.
 */
const SearchPanel = dynamic(
  () => import("@/components/blog/search-panel").then((m) => m.SearchPanel),
  { ssr: false },
);

export function HeaderSearch() {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  if (!open) {
    return (
      <Button variant="ghost" size="icon" aria-label="Search articles" onClick={() => setOpen(true)}>
        <IconSearch className="size-4" aria-hidden />
      </Button>
    );
  }

  return <SearchPanel onClose={close} />;
}
