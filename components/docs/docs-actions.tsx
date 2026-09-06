"use client";

import { useState } from "react";
import { IconCheck, IconCopy, IconExternalLink } from "@tabler/icons-react";
import { AiPageActions } from "@/components/blog/ai-page-actions";
import { Button } from "@/components/blog-ui/button";

const agentInstallPrompt =
  "Open and read the complete setup contract at the following URL. Then inspect my current repository, infer everything you can from the code, ask me only the unanswered setup questions that materially affect the integration, and implement the Next.js Blog System safely. Preserve my existing work, keep the hosted Studio read-only unless I explicitly approve a secured write architecture, run the full validation and acceptance checklist, review the final diff, and report any remaining risks:";

export function DocsActions() {
  const [status, setStatus] = useState("");

  async function copyFrom(path: string, success: string) {
    try {
      const response = await fetch(path);
      if (!response.ok) throw new Error("Could not load Markdown");
      await navigator.clipboard.writeText(await response.text());
      setStatus(success);
    } catch {
      setStatus("Copy failed. Open the Markdown file and copy it manually.");
    }
    window.setTimeout(() => setStatus(""), 2500);
  }

  async function copyAgentPrompt() {
    const url = new URL("/agent-setup.md", window.location.origin).href;
    try {
      await navigator.clipboard.writeText(`${agentInstallPrompt} ${url}`);
      setStatus("Agent setup prompt copied.");
    } catch {
      setStatus("Copy failed. Open the agent contract and copy its URL manually.");
    }
    window.setTimeout(() => setStatus(""), 2500);
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => copyFrom("/docs.md", "Documentation copied as Markdown.")}>
          {status === "Documentation copied as Markdown." ? <IconCheck className="size-4" /> : <IconCopy className="size-4" />}
          Copy as Markdown
        </Button>
        <AiPageActions
          label="Share to AI"
          resourcePath="/docs.md"
          prompt="Read this documentation, explain how the system fits my project, and ask me any questions needed before recommending an integration plan:"
        />
        <Button variant="outline" size="sm" asChild>
          <a href="/docs.md" target="_blank" rel="noreferrer">View raw Markdown<IconExternalLink className="size-4" /></a>
        </Button>
        <Button size="sm" onClick={copyAgentPrompt}><IconCopy className="size-4" />Copy agent setup prompt</Button>
      </div>
      <p className="mt-2 min-h-5 text-xs text-muted-foreground" role="status" aria-live="polite">{status}</p>
    </div>
  );
}
