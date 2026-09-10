"use client";

import { useState, useSyncExternalStore } from "react";
import { IconCheck, IconCopy } from "@tabler/icons-react";
import { Button } from "@/components/blog-ui/button";
import { buildAgentSetupPrompt, buildAgentSetupLinkPrompt } from "@/lib/agent-setup";
import { createPublishingSetup, type SetupInput } from "@/lib/publishing/config";
import { productConfig } from "@/lib/product";

const subscribeToOrigin = () => () => {};

export function AgentSetupActions({ selection, compact = false, preview = false }: { selection?: SetupInput; compact?: boolean; preview?: boolean }) {
  const origin = useSyncExternalStore(subscribeToOrigin, () => window.location.origin, () => "");
  const [status, setStatus] = useState("");
  const [fallback, setFallback] = useState("");
  const [copied, setCopied] = useState(false);
  let instructionsLink: string = productConfig.routes.agentSetup;
  try {
    if (selection) instructionsLink += `?setup=${encodeURIComponent(JSON.stringify(createPublishingSetup(selection)))}`;
  } catch { /* The copy action reports invalid choices without crashing the page. */ }
  const previewPrompt = origin ? buildAgentSetupLinkPrompt(new URL(instructionsLink, origin).href) : "Preparing your setup prompt…";

  async function copyPrompt(full = false) {
    let prompt: string;
    try {
      const setup = selection ? createPublishingSetup(selection) : undefined;
      const url = new URL(instructionsLink, window.location.origin);
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
      <div className={preview ? "flex justify-center" : undefined}><Button type="button" variant={compact ? "outline" : "default"} onClick={() => copyPrompt()}>
        {copied ? <IconCheck className="size-4" aria-hidden /> : <IconCopy className="size-4" aria-hidden />}
        Copy setup prompt
      </Button></div>
      {preview && <div className="mt-4 rounded-md border bg-background">
        <p className="border-b px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Your setup prompt</p>
        <textarea aria-label="Setup prompt preview" readOnly value={previewPrompt} rows={4} className="block w-full resize-y bg-transparent p-3 font-mono text-xs leading-6 text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring" />
      </div>}
      <p role="status" aria-live="polite" className="mt-3 text-xs leading-relaxed text-muted-foreground">{status}</p>
      {fallback && <label className="mt-3 block text-xs font-medium">Setup prompt
        <textarea readOnly value={fallback} rows={5} onFocus={event => event.currentTarget.select()} className="mt-2 w-full rounded-lg border bg-background p-3 text-xs leading-relaxed outline-none focus-visible:ring-2 focus-visible:ring-ring" />
      </label>}
      <details className="mt-3 text-xs text-muted-foreground">
        <summary className="w-fit cursor-pointer rounded outline-none focus-visible:ring-2 focus-visible:ring-ring">Agent cannot open the link?</summary>
        <p className="mt-3 max-w-xl leading-6">A localhost link is only reachable from your computer. Copy the full instructions if your agent cannot access the website, then paste them into the same conversation.</p>
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <Button type="button" size="sm" variant="outline" onClick={() => copyPrompt(true)}>Copy full instructions</Button>
          <a href={instructionsLink} target="_blank" rel="noreferrer" className="rounded underline underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-ring">Read these instructions</a>
        </div>
      </details>
    </div>
  );
}
