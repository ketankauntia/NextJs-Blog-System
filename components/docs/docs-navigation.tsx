"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const sections = [
  ["get-started", "Choose your setup"],
  ["agent-setup", "Set up with AI"],
  ["manual-setup", "Set up manually"],
  ["architecture", "Architecture"],
  ["studio", "Studio safety"],
  ["routes", "Generated routes"],
] as const;

export function DocsNavigation() {
  const [active, setActive] = useState<string>("get-started");
  useEffect(() => {
    let frame = 0;
    function update() {
      frame = 0;
      // Nested setup sections and long manual steps need heading positions,
      // rather than whichever section happens to intersect the viewport last.
      let current: string = sections[0][0];
      const scrollPadding = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
      for (const [id] of sections) {
        const element = document.getElementById(id);
        if (!element) continue;
        const scrollMargin = parseFloat(getComputedStyle(element).scrollMarginTop) || 0;
        if (element.getBoundingClientRect().top <= Math.max(128, scrollPadding + scrollMargin + 8)) current = id;
      }
      setActive(current);
    }
    function schedule() { if (!frame) frame = requestAnimationFrame(update); }
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("hashchange", schedule);
    const observer = new ResizeObserver(schedule);
    const main = document.getElementById("main-content");
    if (main) observer.observe(main);
    schedule();
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("hashchange", schedule);
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

  return <nav aria-label="Documentation sections" className="sticky top-24 text-sm">
    <p className="font-semibold">On this page</p>
    <ul className="mt-4 border-l">
      {sections.map(([id, label]) => <li key={id}>
        <a href={`#${id}`} aria-current={active === id ? "location" : undefined}
          className={cn("-ml-px block border-l-2 py-2 pl-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", active === id ? "border-primary font-medium text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>{label}</a>
      </li>)}
    </ul>
  </nav>;
}
