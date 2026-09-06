"use client";

import { useState } from "react";
import { IconCheck, IconCopy, IconExternalLink } from "@tabler/icons-react";
import { AiPageActions } from "@/components/blog/ai-page-actions";
import { Button } from "@/components/blog-ui/button";

const prompt =
  "Open and read the complete setup contract at the following URL. Then inspect my current repository, infer everything you can from the code, ask me only the unanswered setup questions that materially affect the integration, and implement the Next.js Blog System safely. Preserve my existing work, keep the hosted Studio read-only unless I explicitly approve a secured write architecture, run the full validation and acceptance checklist, review the final diff, and report any remaining risks:";

export function AgentSetupActions() {
  const [copied, setCopied] = useState(false);

  async function copyPrompt() {
    const url = new URL("/agent-setup.md", window.location.origin).href;
    try {
      await navigator.clipboard.writeText(`${prompt} ${url}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      window.open("/agent-setup.md", "_blank", "noopener,noreferrer");
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <Button onClick={copyPrompt}>{copied ? <IconCheck className="size-4" /> : <IconCopy className="size-4" />}{copied ? "Prompt copied" : "Copy setup prompt"}</Button>
        <AiPageActions label="Open in AI" resourcePath="/agent-setup.md" prompt={prompt} />
        <Button variant="outline" asChild><a href="/agent-setup.md" target="_blank" rel="noreferrer">Raw contract<IconExternalLink className="size-4" /></a></Button>
      </div>
      <p className="mt-3 text-xs text-muted-foreground" role="status" aria-live="polite">{copied ? "Paste the prompt into the coding agent that has access to your repository." : "The copied prompt uses this deployment's absolute URL."}</p>
    </div>
  );
}
