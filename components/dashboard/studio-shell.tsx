"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconArrowUpRight, IconEye, IconMenu2, IconX } from "@tabler/icons-react";
import { StudioNavigation } from "@/components/dashboard/studio-navigation";
import { cn } from "@/lib/utils";
import styles from "./studio-shell.module.css";

export function StudioShell({ children, readOnly }: { children: React.ReactNode; readOnly: boolean }) {
  const pathname = usePathname();
  const editor = pathname === "/dashboard/editor" || pathname.startsWith("/dashboard/editor/");
  const [openOnPath, setOpenOnPath] = useState<string | null>(null);
  const navigationOpen = openOnPath === pathname;
  const menuButton = useRef<HTMLButtonElement>(null);

  return (
    <div
      className={cn("studio-surface", styles.shell, editor && styles.editorShell)}
      onKeyDown={(event) => {
        if (event.key === "Escape" && navigationOpen) {
          setOpenOnPath(null);
          menuButton.current?.focus();
        }
      }}
    >
      <a href="#main-content" className="skip-link">Skip to content</a>
      <header className={styles.header}>
        <button
          ref={menuButton}
          type="button"
          className={cn(styles.menuButton, editor && styles.editorMenu)}
          aria-label={navigationOpen ? "Close Studio navigation" : "Open Studio navigation"}
          aria-expanded={navigationOpen}
          aria-controls="studio-navigation"
          onClick={() => setOpenOnPath(navigationOpen ? null : pathname)}
        >
          {navigationOpen ? <IconX className="size-5" aria-hidden /> : <IconMenu2 className="size-5" aria-hidden />}
        </button>
        <Link href="/dashboard" className={styles.brand} aria-label="Next.js Blog Studio home">
          <span className={styles.brandMark} aria-hidden>N</span>
          <span className={styles.brandName}>Next.js Blog</span>
        </Link>
        <span className={styles.separator} aria-hidden>/</span>
        <span className={styles.studioLabel}>Studio</span>
        {!editor && (
          <div className={styles.headerActions}>
            <span className={styles.status}>
              <span className={cn(styles.statusDot, readOnly && styles.readOnlyDot)} aria-hidden />
              <span className={styles.fullStatus}>{readOnly ? "Read-only demo" : "Local workspace"}</span>
              <span className={styles.compactStatus}>{readOnly ? "Read-only" : "Local"}</span>
            </span>
            <Link href="/blog" className={styles.viewBlog}>View blog <IconArrowUpRight className="size-4" aria-hidden /></Link>
          </div>
        )}
      </header>
      {readOnly && (
        <div className={styles.readOnlyBanner}>
          <IconEye className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
          <p><strong>Public read-only demo.</strong> Explore every workflow and preview local changes. Saving, uploading, and publishing are disabled on this deployment.</p>
        </div>
      )}
      <div className={styles.workspace}>
        <aside id="studio-navigation" className={cn(styles.sidebar, editor && styles.editorSidebar, navigationOpen && styles.sidebarOpen)}>
          <StudioNavigation editor={editor} onNavigate={() => setOpenOnPath(null)} />
        </aside>
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
