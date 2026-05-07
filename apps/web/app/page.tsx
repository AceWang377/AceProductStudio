import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { HomeLanding } from "@/components/home/HomeLanding";
import { getCurrentUser } from "@/lib/auth";
import { siteConfig } from "@/lib/site";

type HomeSearchParams = Promise<Record<string, string | string[] | undefined>>;

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "AceStudio | Shopify AI SEO & GEO Product Listing Generator",
  description:
    "AceStudio turns one product photo into Shopify-ready generated images, SEO and GEO product copy, pricing details, inventory fields, and a draft listing ready for review.",
  alternates: {
    canonical: "/"
  }
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function HomePage({
  searchParams
}: {
  searchParams?: HomeSearchParams;
}) {
  const params = searchParams ? await searchParams : {};
  const code = firstParam(params.code);
  const next = firstParam(params.next) || "/dashboard";

  if (code) {
    redirect(`/auth/callback?code=${encodeURIComponent(code)}&next=${encodeURIComponent(next)}`);
  }

  const user = await getCurrentUser();
  if (user) redirect("/dashboard");
  const jsonLd = getHomeStructuredData();

  return (
    <div className="space-y-0">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeLanding />
    </div>
  );
}

function getHomeStructuredData() {
  return [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: siteConfig.name,
      url: siteConfig.url,
      description:
        "AceStudio is a Shopify AI product workspace for product images, SEO copy, GEO-ready product content, and draft publishing.",
      inLanguage: "en"
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: siteConfig.name,
      legalName: siteConfig.company,
      url: siteConfig.url,
      logo: `${siteConfig.url}/brand/ace-studio-logo.png`,
      contactPoint: {
        "@type": "ContactPoint",
        email: siteConfig.supportEmail,
        contactType: "customer support"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: siteConfig.name,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: siteConfig.url,
      description:
        "AI product content workspace for Shopify merchants to generate product images, SEO and GEO copy, pricing details, inventory fields, and draft listings.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        description: "Free trial credits available before paid credit packs are enabled."
      },
      featureList: [
        "AI product image generation",
        "Shopify SEO product copy generation",
        "Shopify GEO product content guidance",
        "Shopify OAuth store connection",
        "Draft-first Shopify product publishing",
        "Credit usage history"
      ],
      provider: {
        "@type": "Organization",
        name: siteConfig.company,
        url: siteConfig.url
      }
    }
  ];
}
