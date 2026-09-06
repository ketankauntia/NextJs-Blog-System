import { IconSparkles } from "@tabler/icons-react";

/** Answer-first AI summary. Rendered near the top so LLMs and skimmers get the takeaway immediately. */
export function TldrBlock({ text }: { text: string }) {
  return (
    <aside
      aria-label="Article summary"
      className="rounded-2xl border border-primary/25 bg-primary/5 p-5 shadow-sm sm:p-6"
    >
      <p className="mb-2 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
        <IconSparkles className="size-4" />
        TL;DR
      </p>
      <p className="leading-7 text-foreground/90">{text}</p>
    </aside>
  );
}
