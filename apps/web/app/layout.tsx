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
    default: "AceStudio | Shopify AI SEO & GEO Product Listing Generator",
    template: `%s | ${siteConfig.name}`
  },
  description:
    "Generate Shopify-ready product images, SEO and GEO product copy, pricing details, inventory fields, and draft product listings from one product photo.",
  keywords: [
    "AI Shopify product listing generator",
    "Shopify product image generator",
    "AI product description generator",
    "Shopify SEO copy",
    "Shopify GEO optimization",
    "generative engine optimization for Shopify",
    "ecommerce product content",
    "Shopify draft publishing"
  ],
  authors: [{ name: siteConfig.company }],
  creator: siteConfig.company,
  publisher: siteConfig.company,
  category: "Software",
  icons: {
    icon: [
      { url: "/icon.png", sizes: "512x512", type: "image/png" }
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" }
    ]
  },
  openGraph: {
    title: "AceStudio | Shopify AI SEO & GEO Product Listing Generator",
    description:
      "Create Shopify-ready product media, SEO and GEO copy, pricing details, inventory fields, and draft listings from one product photo.",
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
    title: "AceStudio | Shopify AI SEO & GEO Product Listing Generator",
    description:
      "Generate product images, SEO and GEO copy, and Shopify draft listings from one product photo.",
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
          <footer className="border-t border-line bg-white">
            <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 text-sm text-muted sm:px-6 lg:grid-cols-[minmax(260px,0.8fr)_minmax(0,1.6fr)]">
              <div>
                <div className="flex items-center gap-3">
                  <AceStudioMark />
                  <div>
                    <p className="text-base font-semibold text-ink">{siteConfig.company}</p>
                    <p className="text-xs text-muted">Shopify product and growth workspace</p>
                  </div>
                </div>
                <p className="mt-5 max-w-xs leading-6">
                  Create Shopify product drafts, review SEO/GEO quality, and approve selected store updates from one account.
                </p>
                <Link
                  href={`mailto:${siteConfig.supportEmail}`}
                  className="mt-4 inline-flex font-semibold text-action hover:text-ink"
                >
                  {siteConfig.supportEmail}
                </Link>
              </div>
              <FooterNav />
            </div>
            <div className="border-t border-line">
              <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <span>(c) AceStudio. Draft-first Shopify automation.</span>
                <span>SEO/GEO suggestions are reviewed before write-back.</span>
              </div>
            </div>
          </footer>
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}
