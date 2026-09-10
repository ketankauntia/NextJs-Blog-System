"use client";

import { useState } from "react";
import { IconCheck, IconCopy } from "@tabler/icons-react";

export function SetupCodeBlock({ code, language, filename }: { code: string; language: string; filename?: string }) {
  const [status, setStatus] = useState("");

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setStatus("Copied");
    } catch {
      setStatus("Could not copy. Select and copy the code below.");
    }
  }

  return (
    <div className="mt-4 overflow-hidden rounded-md border">
      <div className="flex items-center justify-between gap-3 border-b bg-muted/40 px-4 py-1.5">
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{language}{filename ? ` · ${filename}` : ""}</span>
        <div className="flex items-center gap-2">
          <span role="status" className="text-xs text-muted-foreground">{status}</span>
          <button type="button" onClick={copy} aria-label={`Copy ${filename ?? language + " commands"}`} title="Copy code" className="flex size-8 shrink-0 items-center justify-center rounded hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            {status === "Copied" ? <IconCheck className="size-4" aria-hidden /> : <IconCopy className="size-4" aria-hidden />}
          </button>
        </div>
      </div>
      <pre className="overflow-x-auto bg-foreground p-5 text-xs leading-6 text-background"><code className={`language-${language}`}>{code}</code></pre>
    </div>
  );
}
