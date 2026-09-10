"use client";

import {
  Group as ResizablePanelGroupPrimitive,
  Panel as ResizablePanelPrimitive,
  Separator as ResizableHandlePrimitive,
  type GroupProps,
  type PanelProps,
  type SeparatorProps,
} from "react-resizable-panels";
import { IconGripVertical } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

function ResizablePanelGroup({ className, ...props }: GroupProps) {
  return (
    <ResizablePanelGroupPrimitive
      data-slot="resizable-panel-group"
      className={cn("h-full w-full", className)}
      {...props}
    />
  );
}

function ResizablePanel(props: PanelProps) {
  return <ResizablePanelPrimitive data-slot="resizable-panel" {...props} />;
}

function ResizableHandle({ className, ...props }: SeparatorProps) {
  return (
    <ResizableHandlePrimitive
      data-slot="resizable-handle"
      className={cn(
        "group relative z-20 flex w-3 shrink-0 touch-none select-none items-center justify-center bg-border/45 outline-none transition-colors",
        "hover:bg-primary/15 focus-visible:bg-primary/15 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset",
        "aria-[orientation=horizontal]:h-3 aria-[orientation=horizontal]:w-full",
        className,
      )}
      {...props}
    >
      <span className="flex h-9 w-5 items-center justify-center rounded-full border bg-background text-muted-foreground shadow-sm transition-colors group-hover:border-primary/40 group-hover:text-foreground group-aria-[orientation=horizontal]:h-5 group-aria-[orientation=horizontal]:w-9">
        <IconGripVertical className="size-3.5 group-aria-[orientation=horizontal]:rotate-90" aria-hidden />
      </span>
      <span className="sr-only">Resize editor and preview panels</span>
    </ResizableHandlePrimitive>
  );
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
