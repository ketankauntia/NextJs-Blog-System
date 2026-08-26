"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconArrowLeft, IconCheck, IconDeviceFloppy } from "@tabler/icons-react";
import { Button } from "@/components/blog-ui/button";
import { Badge } from "@/components/blog-ui/badge";
import { cn } from "@/lib/utils";
import {
  FONT_PAIRINGS,
  FONT_PAIRING_META,
  type FontPairing,
  type SiteSettings,
} from "@/lib/settings-shared";

/**
 * Side-by-side font comparison.
 *
 * Each card stamps its own `data-font`, so all five pairings render live on one
 * screen at the real sizes the article templates use. Judging type from a name
 * or a specimen sheet is how you end up with a face that falls apart at 17px.
 */
export function FontPickerClient({
  initial,
  sample,
  canSave,
}: {
  initial: SiteSettings;
  sample: { title: string; description: string; category: string; body: string };
  canSave: boolean;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<FontPairing>(initial.fontPairing);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState("");
  const [stacked, setStacked] = useState(false);

  const dirty = selected !== initial.fontPairing;

  async function save() {
    setState("saving");
    try {
      const res = await fetch("/api/editor/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...initial, fontPairing: selected }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      setState("saved");
      setMessage(`Saved — the whole site now uses ${FONT_PAIRING_META[selected].name}.`);
      router.refresh();
    } catch (e) {
      setState("error");
      setMessage(e instanceof Error ? e.message : "Save failed");
    }
  }

  return (
    <main className="mx-auto w-full max-w-shell flex-1 px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <IconArrowLeft className="size-4" aria-hidden />
            Studio
          </Link>
          <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight">Typography</h1>
          <p className="mt-1 max-w-xl text-muted-foreground">
            Five pairings, all rendering the same article at the sizes the post template actually
            uses. Pick one and save; it applies everywhere immediately.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setStacked((v) => !v)}>
            {stacked ? "Grid" : "One column"}
          </Button>
          {canSave ? (
            <Button onClick={save} disabled={!dirty || state === "saving"}>
              {state === "saved" && !dirty ? (
                <IconCheck className="size-4" aria-hidden />
              ) : (
                <IconDeviceFloppy className="size-4" aria-hidden />
              )}
              {state === "saving" ? "Saving…" : dirty ? "Save choice" : "Saved"}
            </Button>
          ) : null}
        </div>
      </div>

      {message ? (
        <p
          role="status"
          className={cn(
            "mt-4 rounded-lg border px-4 py-2 text-sm",
            state === "error"
              ? "border-destructive/40 text-destructive"
              : "border-primary/30 text-muted-foreground",
          )}
        >
          {message}
        </p>
      ) : null}

      <div
        className={cn(
          "mt-8 grid gap-6",
          stacked ? "grid-cols-1" : "lg:grid-cols-2 xl:grid-cols-3",
        )}
      >
        {FONT_PAIRINGS.map((pairing) => {
          const meta = FONT_PAIRING_META[pairing];
          const active = selected === pairing;
          return (
            <button
              key={pairing}
              type="button"
              onClick={() => setSelected(pairing)}
              aria-pressed={active}
              className={cn(
                "group flex flex-col rounded-xl border-2 bg-card p-5 text-left transition-colors",
                active ? "border-primary" : "border-border hover:border-primary/40",
              )}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-heading text-sm font-semibold">{meta.name}</span>
                {active ? <Badge>Selected</Badge> : null}
                {pairing === initial.fontPairing && !active ? (
                  <Badge variant="secondary">Current</Badge>
                ) : null}
              </div>
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                {meta.heading} · {meta.body}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{meta.blurb}</p>

              {/* The specimen. data-font here is what makes the card render in its own pairing. */}
              <div data-font={pairing} className="mt-5 border-t pt-5">
                <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground">
                  {sample.category}
                </p>
                <h2 className="mt-2 font-heading text-2xl font-bold leading-tight tracking-tight">
                  {sample.title}
                </h2>
                <p className="mt-2 text-base text-muted-foreground">{sample.description}</p>
                <h3 className="mt-5 font-heading text-lg font-semibold tracking-tight">
                  A section heading
                </h3>
                {/* 17px/1.65 is the article body setting, so this is a true-size test. */}
                <p className="mt-2 text-[1.0625rem] leading-[1.65]">{sample.body}</p>
                <p className="mt-3 text-[1.0625rem] leading-[1.65]">
                  Numerals and small caps: 1234567890 · <strong>bold text</strong> ·{" "}
                  <em>italic text</em> · <code className="font-mono text-[0.9em]">inline_code()</code>
                </p>
                <p className="mt-3 text-sm text-muted-foreground">
                  Caption and metadata size — 8 min read · 26 August 2026
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <p className="mt-8 text-sm text-muted-foreground">
        Judge these at arm&apos;s length rather than leaning in. Check the body paragraph before the
        headline: the headline is what sells a pairing and the body is what you will actually read.
      </p>
    </main>
  );
}
