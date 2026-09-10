"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconFileText,
  IconLayout,
  IconPencil,
  IconSettings,
  IconAdjustments,
  IconTypography,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { productConfig } from "@/lib/product";

const links = [
  { href: productConfig.routes.setup, label: "Setup", icon: IconAdjustments },
  { href: "/dashboard", label: "Content", icon: IconFileText },
  { href: "/dashboard/editor", label: "Editor", icon: IconPencil },
  { href: "/dashboard/preview", label: "Appearance", icon: IconLayout },
  { href: "/dashboard/fonts", label: "Typography", icon: IconTypography },
  { href: "/dashboard/settings", label: "Settings", icon: IconSettings },
];

export function StudioNavigation() {
  const pathname = usePathname();
  return (
    <nav aria-label="Studio navigation" className="border-b bg-card">
      <div className="mx-auto flex max-w-shell gap-6 overflow-x-auto px-5 sm:px-6">
        {links.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/dashboard"
              ? pathname === href
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-12 shrink-0 items-center gap-2 border-b-2 text-sm transition-colors",
                active
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="size-4" aria-hidden />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
