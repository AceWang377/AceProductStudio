"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Coins,
  LogOut,
  SearchCheck,
  Sparkles
} from "lucide-react";
import { LanguageToggle } from "@/components/i18n/LanguageToggle";
import { useLanguage } from "@/components/i18n/LanguageProvider";

const navItems = [
  { href: "/dashboard", labelKey: "productStudio", icon: Sparkles },
  { href: "/growth", labelKey: "growthStudio", icon: SearchCheck }
] as const;

function isActivePath(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === "/dashboard" || pathname.startsWith("/products");
  }

  if (href === "/growth") {
    return pathname === "/growth" || pathname.startsWith("/shopify-seo-geo-optimizer");
  }

  return pathname === href;
}

export function AppNavigation({
  creditsLabel,
  userEmail
}: {
  creditsLabel: string;
  userEmail?: string | null;
}) {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <div className="flex min-w-0 items-center gap-2">
      <nav
        aria-label="Workspace"
        className="-mx-2 flex max-w-[calc(100vw-172px)] items-center gap-1 overflow-x-auto px-2 lg:max-w-none"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActivePath(pathname, item.href);
          const label = t.shell[item.labelKey];
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`studio-focus inline-flex h-10 shrink-0 items-center gap-2 rounded px-3 text-sm transition ${
                active
                  ? "bg-white font-semibold text-ink shadow-sm ring-1 ring-line"
                  : "text-muted hover:bg-white hover:text-ink"
              }`}
            >
              <Icon aria-hidden className="h-4 w-4" />
              <span className="hidden xl:inline">{label}</span>
            </Link>
          );
        })}
      </nav>
      <LanguageToggle />
      <Link
        href="/billing"
        className="studio-focus hidden h-10 shrink-0 items-center gap-2 rounded border border-line bg-white px-3 text-sm font-semibold text-ink sm:inline-flex"
        title={t.shell.credits}
      >
        <Coins aria-hidden className="h-4 w-4 text-action" />
        {creditsLabel}
      </Link>
      <form action="/auth/logout" method="post" className="shrink-0">
        <button
          type="submit"
          className="studio-focus inline-flex h-10 items-center gap-2 rounded px-3 text-sm text-muted transition hover:bg-white hover:text-ink"
          title={userEmail ?? t.shell.signOut}
        >
          <LogOut aria-hidden className="h-4 w-4" />
          <span className="hidden xl:inline">{t.shell.signOut}</span>
        </button>
      </form>
    </div>
  );
}
