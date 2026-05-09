import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { HomeLanding } from "@/components/home/HomeLanding";
import { getCurrentUser } from "@/lib/auth";
import { siteConfig } from "@/lib/site";

type HomeSearchParams = Promise<Record<string, string | string[] | undefined>>;

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "AceStudio | Shopify SEO/GEO Optimizer & AI Product Listing Tool",
  description:
    "Create Shopify product images and listings, audit live SEO/GEO pages, and approve Shopify write-back updates from one review-first workspace.",
  keywords: [
    "Shopify SEO optimizer",
    "Shopify GEO optimizer",
    "AI Shopify product listing tool",
    "Shopify product image generator",
    "Shopify Search Console optimization",
    "AI answer readiness for Shopify",
    "Shopify SEO write back"
  ],
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "AceStudio | Shopify SEO/GEO Optimizer & AI Product Listing Tool",
    description:
      "Generate Shopify product assets, audit live SEO/GEO pages, and approve selected write-back updates from one workspace.",
    url: siteConfig.url,
    type: "website",
    images: [
      {
        url: `${siteConfig.url}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "AceStudio Shopify SEO and GEO optimizer workspace"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "AceStudio | Shopify SEO/GEO Optimizer",
    description:
      "A review-first Shopify workspace for AI product listings, SEO/GEO audits, and approved store updates.",
    images: [`${siteConfig.url}/opengraph-image`]
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
  const organizationId = `${siteConfig.url}/#organization`;
  const softwareId = `${siteConfig.url}/#software`;
  const websiteId = `${siteConfig.url}/#website`;
  const webpageId = `${siteConfig.url}/#webpage`;

  return {
    "@context": "https://schema.org",
    "@graph": [
    {
      "@type": "WebSite",
      "@id": websiteId,
      name: siteConfig.name,
      alternateName: ["AceStudio Shopify AI", "AceStudio Growth Studio"],
      url: siteConfig.url,
      description:
          "AceStudio is a Shopify AI product workspace for product images, SEO copy, GEO-ready product content, and draft publishing.",
      inLanguage: "en",
      publisher: {
        "@id": organizationId
      }
    },
    {
      "@type": "WebPage",
      "@id": webpageId,
      url: siteConfig.url,
      name: "AceStudio Shopify SEO/GEO Optimizer and AI Product Listing Tool",
      description:
        "Create Shopify product images and listings, audit live SEO/GEO pages, and approve Shopify write-back updates from one review-first workspace.",
      isPartOf: {
        "@id": websiteId
      },
      about: {
        "@id": softwareId
      },
      primaryImageOfPage: {
        "@type": "ImageObject",
        url: `${siteConfig.url}/opengraph-image`
      },
      inLanguage: "en"
    },
    {
      "@type": "Organization",
      "@id": organizationId,
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
      "@type": "SoftwareApplication",
      "@id": softwareId,
      name: siteConfig.name,
      alternateName: "AceStudio Growth Studio",
      applicationCategory: "BusinessApplication",
      applicationSubCategory: "Shopify SEO and product content software",
      operatingSystem: "Web",
      url: siteConfig.url,
      description:
        "AI product content and growth workspace for Shopify merchants to generate product images, create SEO/GEO copy, audit live product pages, and approve Shopify write-back updates.",
      audience: {
        "@type": "Audience",
        audienceType: "Shopify merchants and ecommerce operators"
      },
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
        "Live Shopify SEO and GEO scoring",
        "Editable before and after optimization drafts",
        "Confirmed Shopify SEO write-back",
        "Image alt text and internal link suggestions",
        "Search Console opportunity monitoring",
        "Shopify OAuth store connection",
        "Draft-first Shopify product publishing",
        "Credit usage history"
      ],
      provider: {
        "@id": organizationId
      }
    },
    {
      "@type": "Service",
      "@id": `${siteConfig.url}/#shopify-seo-geo-service`,
      name: "Shopify SEO and GEO optimization workspace",
      serviceType: "Shopify product page SEO and generative engine optimization",
      provider: {
        "@id": organizationId
      },
      areaServed: "Worldwide",
      audience: {
        "@type": "Audience",
        audienceType: "Shopify merchants"
      },
      description:
        "Scores live Shopify product and collection pages for search visibility, AI-answer readiness, structured data readiness, image SEO, internal links, and approved write-back opportunities."
    },
    {
      "@type": "ItemList",
      "@id": `${siteConfig.url}/#primary-workflows`,
      name: "AceStudio primary workflows",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Product Studio",
          description: "Generate Shopify-ready product images, SEO copy, commerce fields, and draft listings."
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Growth Studio",
          description: "Audit live Shopify SEO/GEO pages, preview selected fixes, and confirm write-back updates."
        }
      ]
    }
    ]
  };
}
