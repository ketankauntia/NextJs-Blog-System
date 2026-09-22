"use client";
import { useEffect, useRef, type ReactNode } from "react";

/** Fill the space remaining below the host navbar without locking scrolling at large text sizes. */
export function Viewport({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const fit = () => {
      if (!ref.current) return;
      const body = getComputedStyle(document.body);
      const bottom = (parseFloat(body.marginBottom) || 0) + (parseFloat(body.paddingBottom) || 0);
      ref.current.style.minHeight = `${Math.max(0, window.innerHeight - (ref.current.getBoundingClientRect().top + window.scrollY) - bottom)}px`;
    };
    fit(); window.addEventListener("resize", fit);
    const observer = new ResizeObserver(fit); observer.observe(document.body);
    return () => { window.removeEventListener("resize", fit); observer.disconnect(); };
  }, []);
  return <div ref={ref} className="bsn-welcome">{children}</div>;
}
