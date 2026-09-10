"use client";

import { useState } from "react";
import { IconCheck, IconCopy } from "@tabler/icons-react";
import { Button } from "@/components/blog-ui/button";
import { buildAgentSetupPrompt, buildAgentSetupLinkPrompt } from "@/lib/agent-setup";
import { createPublishingSetup, type SetupInput } from "@/lib/publishing/config";
import { productConfig } from "@/lib/product";

export function AgentSetupActions({ selection, compact = false }: { selection?: SetupInput; compact?: boolean }) {
  const [status, setStatus] = useState("");
  const [fallback, setFallback] = useState("");
  const [copied, setCopied] = useState(false);

  async function copyPrompt(full = false) {
    let prompt: string;
    try {
      const setup = selection ? createPublishingSetup(selection) : undefined;
      const url = new URL(productConfig.routes.agentSetup, window.location.origin);
      if (setup) url.searchParams.set("setup", JSON.stringify(setup));
      prompt = full ? buildAgentSetupPrompt(setup) : buildAgentSetupLinkPrompt(url.href);
    } catch (error) {
      setCopied(false);
      setStatus(error instanceof Error ? error.message : "Check your setup choices.");
      return;
    }
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setFallback("");
      setStatus("Copied. Paste it into your coding agent in the project you want to set up.");
    } catch {
      setCopied(false);
      setFallback(prompt);
      setStatus("Select and copy the prompt below.");
    }
  }

  return (
    <div className="w-full">
      <Button type="button" variant={compact ? "outline" : "default"} onClick={() => copyPrompt()}>
        {copied ? <IconCheck className="size-4" aria-hidden /> : <IconCopy className="size-4" aria-hidden />}
        Copy setup prompt
      </Button>
      <p role="status" aria-live="polite" className="mt-3 text-xs leading-relaxed text-muted-foreground">{status}</p>
      {fallback && <label className="mt-3 block text-xs font-medium">Setup prompt
        <textarea readOnly value={fallback} rows={5} onFocus={event => event.currentTarget.select()} className="mt-2 w-full rounded-lg border bg-background p-3 text-xs leading-relaxed outline-none focus-visible:ring-2 focus-visible:ring-ring" />
      </label>}
      <details className="mt-3 text-xs text-muted-foreground">
        <summary className="w-fit cursor-pointer rounded outline-none focus-visible:ring-2 focus-visible:ring-ring">Agent cannot open the link?</summary>
        <p className="mt-3 max-w-xl leading-6">A localhost link is only reachable from your computer. Copy the full instructions if your agent cannot access the website, then paste them into the same conversation.</p>
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <Button type="button" size="sm" variant="outline" onClick={() => copyPrompt(true)}>Copy full instructions</Button>
          <a href={productConfig.routes.agentGuide} className="rounded underline underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-ring">Read the setup guide</a>
        </div>
      </details>
    </div>
  );
}
