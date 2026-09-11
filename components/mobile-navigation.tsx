"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  IconArrowUpRight,
  IconMenu2,
  IconX,
} from "@tabler/icons-react";

export function MobileNavigation({
  showStudio,
}: {
  showStudio: boolean;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    function closeOutside(event: PointerEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    }
    function closeEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
      }
    }
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeEscape);
    };
  }, [open]);

  return (
    <div ref={root} className="relative lg:hidden">
      <button
        ref={trigger}
        className="flex size-10 items-center justify-center rounded-lg hover:bg-muted"
        aria-expanded={open}
        aria-controls="mobile-navigation"
        aria-label={open ? "Close navigation" : "Open navigation"}
        onClick={() => setOpen(!open)}
      >
        {open ? (
          <IconX className="size-5" aria-hidden />
        ) : (
          <IconMenu2 className="size-5" aria-hidden />
        )}
      </button>
      {open ? (
        <nav
          id="mobile-navigation"
          aria-label="Mobile navigation"
          className="absolute right-0 top-12 w-64 rounded-xl border bg-popover p-3 text-popover-foreground shadow-xl"
          onBlur={(event) => {
            if (
              !event.currentTarget.parentElement?.contains(
                event.relatedTarget as Node,
              )
            )
              setOpen(false);
          }}
        >
          <div onClick={() => setOpen(false)}>
            {[
              { label: "Product", href: "/#product" },
              { label: "Blog", href: "/blog" },
              { label: "Documentation", href: "/docs" },
              ...(showStudio
                ? [{ label: "Explore Studio", href: "/dashboard" }]
                : []),
              { label: "Install with AI", href: "/docs/agent-setup" },
            ].map(({ label, href }) => (
              <Link
                className="flex min-h-11 items-center rounded-md px-3 text-sm hover:bg-muted"
                href={href}
                key={href}
              >
                {label}
              </Link>
            ))}
            <Link
              href="/docs#get-started"
              className="button-ink mt-2 flex min-h-11 items-center justify-between rounded-md px-3 text-sm font-medium"
            >
              Start building
              <IconArrowUpRight className="size-4" aria-hidden />
            </Link>
          </div>
        </nav>
      ) : null}
    </div>
  );
}
