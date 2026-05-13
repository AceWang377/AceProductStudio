import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { HomeLanding } from "@/components/home/HomeLanding";
import { getCurrentUser } from "@/lib/auth";
import { siteConfig } from "@/lib/site";

type HomeSearchParams = Promise<Record<string, string | string[] | undefined>>;

export const dynamic = "force-dynamic";

const primarySiteLinks = [
  {
    name: "Product Studio",
    description: "Generate Shopify-ready product images, SEO copy, commerce fields, and draft listings.",
    path: "/shopify-ai-product-listing-generator"
  },
  {
    name: "Growth Studio",
    description: "Audit live Shopify product pages for SEO, GEO, image alt text, internal links, and approved write-back updates.",
    path: "/shopify-seo-geo-optimizer"
  },
  {
    name: "How It Works",
    description: "Learn the review-first workflow from Shopify connection to draft publishing and SEO/GEO write-back.",
    path: "/how-it-works"
  },
  {
    name: "Pricing",
    description: "Review AceStudio credit packs for Shopify product generation and SEO/GEO optimization.",
    path: "/pricing"
  },
  {
    name: "Resources",
    description: "Read Shopify AI product content, image SEO, and draft publishing guides.",
    path: "/resources"
  },
  {
    name: "Support",
    description: "Contact AceStudio support and review product help information.",
    path: "/support"
  }
] as const;

export const metadata: Metadata = {
  title: "AceStudio: AI Product Content Tool for Shopify Sellers",
  description:
    "Upload one product photo. Generate Shopify product images, SEO descriptions, FAQs, GEO-ready content, and reviewable Shopify draft listings.",
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
    title: "AceStudio: AI Product Content Tool for Shopify Sellers",
    description:
      "Create Shopify product assets, audit live SEO/GEO pages, and approve selected write-back updates from one workspace.",
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
    title: "AceStudio: AI Product Content Tool for Shopify Sellers",
    description:
      "Upload one product photo to generate Shopify images, SEO descriptions, FAQs, GEO-ready copy, and draft listings.",
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
  const siteNavigationId = `${siteConfig.url}/#site-navigation`;
  const siteLinks = primarySiteLinks.map((link) => ({
    ...link,
    url: `${siteConfig.url}${link.path}`
  }));

  return {
    "@context": "https://schema.org",
    "@graph": [
    {
      "@type": "WebSite",
      "@id": websiteId,
      name: siteConfig.name,
      alternateName: [
        "Ace Studio",
        "ACE Studio",
        "AceStudio Shopify AI",
        "AceStudio Growth Studio",
        "acezerotrading.com"
      ],
      url: siteConfig.url,
      description:
          "AceStudio is an AI product content tool for Shopify sellers: product images, SEO descriptions, FAQs, GEO-ready product content, and draft publishing.",
      inLanguage: "en",
      publisher: {
        "@id": organizationId
      },
      hasPart: {
        "@id": siteNavigationId
      }
    },
    {
      "@type": "WebPage",
      "@id": webpageId,
      url: siteConfig.url,
      name: "AceStudio Shopify Product Studio and SEO/GEO Optimizer",
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
      inLanguage: "en",
      mainEntity: {
        "@id": `${siteConfig.url}/#primary-workflows`
      }
    },
    {
      "@type": "Organization",
      "@id": organizationId,
      name: siteConfig.name,
      legalName: siteConfig.company,
      url: siteConfig.url,
      logo: `${siteConfig.url}/icon.png`,
      image: `${siteConfig.url}/brand/ace-studio-logo.png`,
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
      "@id": siteNavigationId,
      name: "AceStudio primary site navigation",
      itemListElement: siteLinks.map((link, index) => ({
        "@type": "SiteNavigationElement",
        position: index + 1,
        name: link.name,
        description: link.description,
        url: link.url
      }))
    },
    {
      "@type": "ItemList",
      "@id": `${siteConfig.url}/#primary-workflows`,
      name: "AceStudio primary workflows",
      itemListElement: siteLinks.slice(0, 2).map((link, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: link.name,
        description: link.description,
        url: link.url
      }))
    }
    ]
  };
}
