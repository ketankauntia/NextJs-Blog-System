"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { IconMoon, IconSun } from "@tabler/icons-react";
import { Button } from "@/components/blog-ui/button";

/**
 * Light/dark switch. Delegates to next-themes so the choice persists and the
 * inline script in <head> applies it before first paint (no theme flash).
 */
export function BlogThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // The server cannot know the visitor's theme; render a stable placeholder until hydration.
  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={mounted ? `Switch to ${isDark ? "light" : "dark"} theme` : "Toggle theme"}
    >
      {mounted && isDark ? (
        <IconSun className="size-4" aria-hidden />
      ) : (
        <IconMoon className="size-4" aria-hidden />
      )}
    </Button>
  );
}
