"use client";

import { useState } from "react";
import { IconCheck, IconCopy, IconExternalLink } from "@tabler/icons-react";
import { Button } from "@/components/blog-ui/button";
import { buildAgentSetupPrompt } from "@/lib/agent-setup";
import { createPublishingSetup, type SetupInput } from "@/lib/publishing/config";
import { productConfig } from "@/lib/product";

type SetupChoice = SetupInput;

export function AgentSetupActions({ selection, compact = false }: { selection?: SetupChoice; compact?: boolean }) {
  const [status, setStatus] = useState("");
  const [visiblePrompt, setVisiblePrompt] = useState("");
  const [setupLink, setSetupLink] = useState("");

  async function copyLink() {
    try {
      const url = new URL(productConfig.routes.agentSetup, window.location.origin);
      if (selection) url.searchParams.set("setup", JSON.stringify(createPublishingSetup(selection)));
      setSetupLink(url.href);
      try {
        await navigator.clipboard.writeText(url.href);
        setStatus("Setup link copied. Ask your agent to read it and follow the instructions. A localhost link works only for an agent with access to this computer; otherwise copy the full prompt.");
      } catch {
        setStatus("Clipboard unavailable. Select and copy the setup link below.");
      }
    } catch (error) { setStatus(error instanceof Error ? error.message : "Check your setup choices."); }
  }

  function getPrompt() {
    return buildAgentSetupPrompt(selection ? createPublishingSetup(selection) : undefined);
  }

  async function copyPrompt() {
    let prompt: string;
    try { prompt = getPrompt(); }
    catch (error) { setStatus(error instanceof Error ? error.message : "Check your setup choices."); return; }
    try {
      await navigator.clipboard.writeText(prompt);
      setStatus("Complete setup instructions copied. Paste them into your coding agent.");
    } catch {
      setVisiblePrompt(prompt);
      setStatus("Clipboard unavailable. Select and copy the complete instructions below.");
    }
  }

  function showPrompt() {
    try { setVisiblePrompt(getPrompt()); setStatus(""); }
    catch (error) { setStatus(error instanceof Error ? error.message : "Check your setup choices."); }
  }

  return (
    <div className={compact ? "w-full" : undefined}>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant={compact ? "outline" : "default"} onClick={copyLink}><IconCopy className="size-4" aria-hidden />Copy setup link</Button>
        <Button type="button" variant={compact ? "outline" : "default"} onClick={copyPrompt}>
          {status.startsWith("Complete") ? <IconCheck className="size-4" aria-hidden /> : <IconCopy className="size-4" aria-hidden />}
          Copy full prompt
        </Button>
        <Button type="button" variant="ghost" onClick={showPrompt}>View instructions</Button>
        {!compact && <Button variant="outline" asChild><a href={productConfig.routes.agentSetup} target="_blank" rel="noreferrer">Raw contract<IconExternalLink className="size-4" aria-hidden /></a></Button>}
      </div>
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground" role="status" aria-live="polite">
        {status || "The link includes your choices. Use the full prompt if your agent cannot open this website. Provider sign-in and your go-ahead come first."}
      </p>
      {setupLink && <label className="mt-4 block text-xs font-medium">Agent setup link<input readOnly value={setupLink} onFocus={event => event.currentTarget.select()} className="mt-2 w-full rounded-lg border bg-background p-3 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring" /></label>}
      {visiblePrompt && <label className="mt-4 block text-xs font-medium">
        Complete agent instructions
        <textarea readOnly value={visiblePrompt} rows={10} onFocus={(event) => event.currentTarget.select()}
          className="mt-2 w-full rounded-lg border bg-background p-3 font-mono text-xs leading-relaxed outline-none focus-visible:ring-2 focus-visible:ring-ring" />
      </label>}
    </div>
  );
}
