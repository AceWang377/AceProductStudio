import type { Metadata } from "next";
import Link from "next/link";
import { Boxes, Coins, CreditCard, Images, LayoutDashboard, LogOut, Settings } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getCreditAccount } from "@/lib/credits";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Product Studio",
  description: "AI ecommerce image and copy generation workspace"
};

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/products", label: "Products", icon: Boxes },
  { href: "/products/new", label: "Upload", icon: Images },
  { href: "/billing", label: "Billing", icon: CreditCard },
  { href: "/settings/shopify", label: "Shopify", icon: Settings }
];

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();
  const credits = user ? await getCreditAccount() : null;

  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <div className="min-h-screen">
          <header className="sticky top-0 z-20 border-b border-line bg-canvas/95 backdrop-blur">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
              <Link href="/dashboard" className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded bg-ink text-sm font-semibold text-white">
                  AI
                </span>
                <span>
                  <span className="block text-sm font-semibold leading-5">
                    AI Product Studio
                  </span>
                  <span className="block text-xs text-muted">
                    Product content workspace
                  </span>
                </span>
              </Link>
              <nav className="flex items-center gap-1">
                {user
                  ? navItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="studio-focus inline-flex h-10 items-center gap-2 rounded px-3 text-sm text-muted transition hover:bg-white hover:text-ink"
                        >
                          <Icon aria-hidden className="h-4 w-4" />
                          <span className="hidden sm:inline">{item.label}</span>
                        </Link>
                      );
                    })
                  : null}
                {user ? (
                  <span className="hidden h-10 items-center gap-2 rounded border border-line bg-white px-3 text-sm font-semibold text-ink sm:inline-flex">
                    <Coins aria-hidden className="h-4 w-4 text-action" />
                    {credits?.balance ?? 0}
                  </span>
                ) : null}
                {user ? (
                  <form action="/auth/logout" method="post">
                    <button
                      type="submit"
                      className="studio-focus inline-flex h-10 items-center gap-2 rounded px-3 text-sm text-muted transition hover:bg-white hover:text-ink"
                      title={user.email ?? "Sign out"}
                    >
                      <LogOut aria-hidden className="h-4 w-4" />
                      <span className="hidden sm:inline">Sign out</span>
                    </button>
                  </form>
                ) : (
                  <Link
                    href="/login"
                    className="studio-focus inline-flex h-10 items-center rounded bg-action px-3 text-sm font-semibold text-white"
                  >
                    Sign in
                  </Link>
                )}
              </nav>
            </div>
          </header>
          <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
