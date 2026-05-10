"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SearchCheck, Sparkles, BookOpenText } from "lucide-react";
import { useLanguage } from "@/components/i18n/LanguageProvider";

const publicNavItems = [
  {
    href: "/shopify-ai-product-listing-generator",
    label: "productStudio",
    icon: Sparkles
  },
  {
    href: "/shopify-seo-geo-optimizer",
    label: "growthStudio",
    icon: SearchCheck
  },
  {
    href: "/resources",
    label: "resources",
    icon: BookOpenText
  }
] as const;

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function PublicNavigation() {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
      {publicNavItems.map((item) => {
        const Icon = item.icon;
        const active = isActivePath(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`studio-focus inline-flex h-10 items-center gap-2 rounded px-3 text-sm transition ${
              active
                ? "bg-white font-semibold text-ink shadow-sm ring-1 ring-line"
                : "text-muted hover:bg-white hover:text-ink"
            }`}
          >
            <Icon aria-hidden className="h-4 w-4" />
            {item.label === "resources" ? t.footer.resources : t.shell[item.label]}
          </Link>
        );
      })}
    </nav>
  );
}
