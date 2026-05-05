import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getCreditAccount, isAdminEmail } from "@/lib/credits";
import { siteConfig } from "@/lib/site";
import { AceStudioMark } from "@/components/shell/AceStudioMark";
import { AppNavigation } from "@/components/shell/AppNavigation";
import "./globals.css";

export const metadata: Metadata = {
  title: "AceStudio",
  description: "AI ecommerce image and copy generation workspace for Shopify merchants"
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();
  const credits = user ? await getCreditAccount() : null;
  const creditsLabel = credits?.isUnlimited ? "Unlimited" : String(credits?.balance ?? 0);
  const isAdmin = isAdminEmail(user?.email);

  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <div className="min-h-screen">
          <header className="sticky top-0 z-20 border-b border-line bg-canvas/95 backdrop-blur">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
              <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-3">
                <AceStudioMark />
                <span>
                  <span className="block text-sm font-semibold leading-5">
                    {siteConfig.name}
                  </span>
                  <span className="block text-xs text-muted">
                    Product content workspace
                  </span>
                </span>
              </Link>
              <div className="flex min-w-0 items-center gap-1">
                {user ? (
                  <AppNavigation creditsLabel={creditsLabel} userEmail={user.email} isAdmin={isAdmin} />
                ) : (
                  <Link
                    href="/login"
                    className="studio-focus inline-flex h-10 items-center rounded bg-action px-3 text-sm font-semibold text-white"
                  >
                    Sign in
                  </Link>
                )}
              </div>
            </div>
          </header>
          <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">{children}</main>
          <footer className="border-t border-line">
            <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <p>{siteConfig.company}</p>
              <nav className="flex flex-wrap gap-4">
                <Link className="hover:text-ink" href="/support">
                  Support
                </Link>
                <Link className="hover:text-ink" href="/privacy">
                  Privacy
                </Link>
                <Link className="hover:text-ink" href="/refund">
                  Refund
                </Link>
                <Link className="hover:text-ink" href="/terms">
                  Terms
                </Link>
              </nav>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
