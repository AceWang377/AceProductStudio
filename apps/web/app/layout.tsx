import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getCreditAccount } from "@/lib/credits";
import { siteConfig } from "@/lib/site";
import { AceStudioMark } from "@/components/shell/AceStudioMark";
import { AppNavigation } from "@/components/shell/AppNavigation";
import { BrandText } from "@/components/shell/BrandText";
import { FooterNav } from "@/components/shell/FooterNav";
import { LanguageProvider } from "@/components/i18n/LanguageProvider";
import { LanguageToggle } from "@/components/i18n/LanguageToggle";
import { SignInLink } from "@/components/auth/SignInLink";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  applicationName: siteConfig.name,
  title: {
    default: "AceStudio | AI Shopify Product Listing Generator",
    template: `%s | ${siteConfig.name}`
  },
  description:
    "Generate Shopify-ready product images, SEO copy, pricing details, inventory fields, and draft product listings from one product photo.",
  keywords: [
    "AI Shopify product listing generator",
    "Shopify product image generator",
    "AI product description generator",
    "Shopify SEO copy",
    "ecommerce product content",
    "Shopify draft publishing"
  ],
  authors: [{ name: siteConfig.company }],
  creator: siteConfig.company,
  publisher: siteConfig.company,
  category: "Software",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "AceStudio | AI Shopify Product Listing Generator",
    description:
      "Create Shopify-ready product media, SEO copy, pricing details, inventory fields, and draft listings from one product photo.",
    url: siteConfig.url,
    siteName: siteConfig.name,
    type: "website",
    locale: "en_US",
    images: [
      {
        url: `${siteConfig.url}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "AceStudio AI Shopify product listing workspace"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "AceStudio | AI Shopify Product Listing Generator",
    description:
      "Generate product images, SEO copy, and Shopify draft listings from one product photo.",
    images: [`${siteConfig.url}/opengraph-image`]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1
    }
  }
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();
  const credits = user ? await getCreditAccount() : null;
  const creditsLabel = credits?.isUnlimited ? "Unlimited" : String(credits?.balance ?? 0);

  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <LanguageProvider>
          <div className="min-h-screen">
          <header className="sticky top-0 z-20 border-b border-line bg-canvas/95 backdrop-blur">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
              <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-3">
                <AceStudioMark />
                <BrandText />
              </Link>
              <div className="flex min-w-0 items-center gap-1">
                {user ? (
                  <AppNavigation creditsLabel={creditsLabel} userEmail={user.email} />
                ) : (
                  <>
                    <LanguageToggle />
                    <SignInLink />
                  </>
                )}
              </div>
            </div>
          </header>
          <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">{children}</main>
          <footer className="border-t border-line">
            <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 text-sm text-muted sm:px-6 lg:grid-cols-[minmax(220px,0.8fr)_minmax(0,1.6fr)]">
              <div>
                <p className="text-base font-semibold text-ink">{siteConfig.company}</p>
                <p className="mt-2 max-w-xs leading-6">
                  AI product content workspace for Shopify merchants.
                </p>
              </div>
              <FooterNav />
            </div>
          </footer>
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}
