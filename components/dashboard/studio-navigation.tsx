"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconFileText,
  IconLayoutKanban,
  IconLayout,
  IconPencil,
  IconSettings,
  IconTypography,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import styles from "./studio-shell.module.css";

const links = [
  { href: "/dashboard", label: "Content", icon: IconFileText },
  { href: "/dashboard/preview", label: "Appearance", icon: IconLayout },
  { href: "/dashboard/settings", label: "Settings", icon: IconSettings },
];

const tools = [
  { href: "/dashboard/editor", label: "Editor", icon: IconPencil },
  { href: "/dashboard/board", label: "Board", icon: IconLayoutKanban },
  { href: "/dashboard/fonts", label: "Typography", icon: IconTypography },
];

export function StudioNavigation({ onNavigate, editor = false }: { onNavigate?: () => void; editor?: boolean }) {
  const pathname = usePathname();
  const groups = editor ? [tools] : [links, tools];
  return (
    <nav aria-label="Studio navigation" className={styles.navigation}>
      {groups.map((group, index) => (
      <div key={index} className={styles.navGroup}>
        <p className={styles.navLabel}>{editor ? "Tools" : index === 0 ? "Workspace" : "Tools"}</p>
        {group.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/dashboard"
              ? pathname === href
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                styles.navLink,
                active && styles.navActive,
              )}
            >
              <Icon className="size-4" aria-hidden />
              {label}
            </Link>
          );
        })}
      </div>
      ))}
    </nav>
  );
}
