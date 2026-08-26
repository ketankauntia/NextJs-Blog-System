"use client";

import { useTheme } from "next-themes";
import { IconMoon, IconSun } from "@tabler/icons-react";
import { Button } from "@/components/blog-ui/button";

/**
 * Light/dark switch. Delegates to next-themes, which applies the stored choice
 * before first paint. Both icons render and CSS picks one, so the button is
 * correct on the server pass too and never needs a mounted flag.
 */
export function BlogThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label="Toggle light and dark theme"
    >
      <IconMoon className="size-4 dark:hidden" aria-hidden />
      <IconSun className="hidden size-4 dark:block" aria-hidden />
    </Button>
  );
}
