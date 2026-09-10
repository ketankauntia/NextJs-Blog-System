"use client";

import { useId, type ReactNode } from "react";
import { IconCheck } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

export function ProviderOption({ name, value, label, description, selected, disabled = false, disabledReason,
  icon, onSelect }: { name: string; value: string; label: string; description: string; selected: boolean;
  disabled?: boolean; disabledReason?: string; icon: ReactNode; onSelect: () => void }) {
  const hintId = useId();
  return (
    <label className={cn("group relative block", disabled ? "cursor-not-allowed" : "cursor-pointer")}
      tabIndex={disabled ? 0 : undefined} aria-disabled={disabled || undefined}
      aria-describedby={disabled ? hintId : undefined} title={disabled ? disabledReason : undefined}>
      <input type="radio" className="peer sr-only" name={name} value={value} disabled={disabled}
        checked={selected} onChange={onSelect} />
      <span className={cn("flex h-full min-h-28 items-start gap-3 rounded-xl border p-4 transition-colors group-focus-visible:ring-2 group-focus-visible:ring-ring peer-focus-visible:ring-2 peer-focus-visible:ring-ring",
        selected ? "border-primary bg-primary/5" : "border-border", disabled ? "bg-muted/25" : "hover:bg-muted/40")}>
        <span className="mt-0.5 shrink-0 text-muted-foreground" aria-hidden>{icon}</span>
        <span className="min-w-0 flex-1">
          <span className={cn("block text-sm font-semibold", disabled && "text-muted-foreground")}>{label}</span>
          <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{description}</span>
          {disabled && <span id={hintId} className="mt-2 inline-block rounded bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">{disabledReason}</span>}
        </span>
        {selected && <IconCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />}
      </span>
    </label>
  );
}
