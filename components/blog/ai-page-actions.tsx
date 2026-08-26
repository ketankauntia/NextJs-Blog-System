"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { IconChevronDown, IconSparkles } from "@tabler/icons-react";
import { Button } from "@/components/blog-ui/button";

/**
 * "Ask AI" control. This file is the closed-state button only.
 *
 * The menu — Radix DropdownMenu plus six provider logos — is the heaviest
 * single dependency on an article page, and opening it is rare, so it loads
 * on first click instead of on every page view.
 */
const AiPageActionsMenu = dynamic(
  () => import("@/components/blog/ai-page-actions-menu").then((m) => m.AiPageActionsMenu),
  { ssr: false },
);

export function AiPageActions() {
  const [opened, setOpened] = useState(false);

  // Once the real menu is mounted it owns its own open state and trigger.
  if (opened) return <AiPageActionsMenu defaultOpen />;

  return (
    <Button variant="outline" size="sm" onClick={() => setOpened(true)}>
      <IconSparkles className="size-4" aria-hidden />
      Ask AI
      <IconChevronDown className="size-4" aria-hidden />
    </Button>
  );
}
