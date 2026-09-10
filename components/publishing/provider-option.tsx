"use client";

import { useId, type ReactNode } from "react";
import { IconCheck } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

export function ProviderOption({ name, value, label, description, selected, disabled = false, disabledReason,
  icon, onSelect, onDisabledSelect }: { name: string; value: string; label: string; description: string; selected: boolean;
  disabled?: boolean; disabledReason?: string; icon: ReactNode; onSelect: () => void; onDisabledSelect?: () => void }) {
  const hintId = useId();
  return (
    <label className={cn("group relative block", disabled ? "cursor-not-allowed" : "cursor-pointer")}
      tabIndex={disabled ? 0 : undefined} aria-disabled={disabled || undefined}
      onClick={disabled && onDisabledSelect ? onDisabledSelect : undefined}
      onKeyDown={disabled && onDisabledSelect ? event => {
        if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onDisabledSelect(); }
      } : undefined}
      aria-describedby={disabled ? hintId : undefined} title={disabled ? disabledReason : undefined}>
      <input type="radio" className="peer sr-only" name={name} value={value} disabled={disabled}
        checked={selected} onChange={onSelect} />
      <span className={cn("flex h-full min-h-16 items-center gap-2.5 rounded-md border px-3 py-3 transition-colors group-focus-visible:ring-2 group-focus-visible:ring-ring peer-focus-visible:ring-2 peer-focus-visible:ring-ring",
        selected ? "border-primary bg-primary/5" : "border-border", disabled ? "bg-muted/25" : "hover:bg-muted/40")}>
        <span className="mt-0.5 shrink-0 text-muted-foreground" aria-hidden>{icon}</span>
        <span className="min-w-0 flex-1">
          <span className={cn("block text-sm font-medium", disabled && "text-muted-foreground")}>{label}</span>
          <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{description}</span>
          {disabled && <span id={hintId} className="mt-1 inline-block text-[10px] uppercase tracking-wide text-[11px] font-medium text-muted-foreground">{disabledReason}</span>}
        </span>
        {selected && <IconCheck className="size-3.5 shrink-0 text-primary" aria-hidden />}
      </span>
    </label>
  );
}
