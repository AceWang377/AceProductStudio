"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Boxes,
  Coins,
  Images,
  LayoutDashboard,
  LogOut,
  UserRound
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/products", label: "Products", icon: Boxes },
  { href: "/products/new", label: "Upload", icon: Images },
  { href: "/account", label: "Account", icon: UserRound }
];

function isActivePath(pathname: string, href: string) {
  if (href === "/products") {
    return pathname === "/products" || (pathname.startsWith("/products/") && pathname !== "/products/new");
  }

  if (href === "/settings/shopify") {
    return pathname.startsWith("/settings/shopify");
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

  return (
    <div className="flex min-w-0 items-center gap-2">
      <nav
        aria-label="Workspace"
        className="-mx-2 flex max-w-[calc(100vw-172px)] items-center gap-1 overflow-x-auto px-2 lg:max-w-none"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActivePath(pathname, item.href);
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
              <span className="hidden xl:inline">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <Link
        href="/billing"
        className="studio-focus hidden h-10 shrink-0 items-center gap-2 rounded border border-line bg-white px-3 text-sm font-semibold text-ink sm:inline-flex"
        title="Credits"
      >
        <Coins aria-hidden className="h-4 w-4 text-action" />
        {creditsLabel}
      </Link>
      <form action="/auth/logout" method="post" className="shrink-0">
        <button
          type="submit"
          className="studio-focus inline-flex h-10 items-center gap-2 rounded px-3 text-sm text-muted transition hover:bg-white hover:text-ink"
          title={userEmail ?? "Sign out"}
        >
          <LogOut aria-hidden className="h-4 w-4" />
          <span className="hidden xl:inline">Sign out</span>
        </button>
      </form>
    </div>
  );
}
