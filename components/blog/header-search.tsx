"use client";

import { useCallback, useState } from "react";
import dynamic from "next/dynamic";
import { IconSearch } from "@tabler/icons-react";
import { Button } from "@/components/blog-ui/button";
import { Dialog, DialogTrigger } from "@/components/blog-ui/dialog";

/**
 * Responsive dialog search. This file is the trigger only: the panel,
 * Fuse.js and the search index are a separate chunk fetched on first open, so
 * readers who never search never download any of it.
 */
const SearchPanel = dynamic(
  () => import("@/components/blog/search-panel").then((m) => m.SearchPanel),
  { ssr: false },
);

export function HeaderSearch({ label }: { label?: string }) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={label ? "outline" : "ghost"}
          size={label ? "lg" : "icon"}
          aria-label="Search articles"
          className={label ? "h-10 bg-background" : "size-10"}
        >
          <IconSearch className="size-4" aria-hidden />
          {label}
        </Button>
      </DialogTrigger>
      {open ? <SearchPanel onClose={close} /> : null}
    </Dialog>
  );
}
