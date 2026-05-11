import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";

export type SeoPageKey =
  | "shopifyAiProductListingGenerator"
  | "shopifyProductImageGenerator"
  | "shopifySeoProductDescriptionGenerator"
  | "shopifySeoGeoOptimizer"
  | "aiShopifyDraftPublisher";

export const seoPages = {
  shopifyAiProductListingGenerator: {
    path: "/shopify-ai-product-listing-generator",
    eyebrow: "Shopify AI product listing generator",
    title: "Shopify AI product listing generator for draft-ready products",
    description:
      "AceStudio helps Shopify merchants turn one product photo into generated product images, SEO copy, price and inventory fields, and a reviewable Shopify draft.",
    primaryCta: "Generate a Shopify product listing",
    benefits: [
      "Create listing media, SEO copy, price, SKU, and inventory in one product workflow.",
      "Generate at least four publish-ready product images from one original photo.",
      "Review product title, description, tags, FAQ, price, and inventory before Shopify publishing.",
      "Publish as a Shopify draft by default with job history, retry logs, and Admin links."
    ],
    sections: [
      {
        title: "One workflow for the full Shopify listing",
        body: "Many Shopify tools solve only one piece of product creation. AceStudio keeps the generated media, SEO product copy, commerce fields, and draft publishing step together so merchants can review the complete listing before it reaches Shopify."
      },
      {
        title: "Built around merchant review",
        body: "The app is designed for draft-first publishing. Users can inspect image order, generated copy, pricing, SKU, inventory, and Shopify connection status before creating a draft product."
      },
      {
        title: "Ready for credit-based generation",
        body: "The product workflow already tracks credit balances, usage history, and generation jobs. This makes the listing generator suitable for a future paid credit model without changing the core user journey."
      }
    ],
    faq: [
      {
        question: "What does a Shopify AI product listing generator create?",
        answer: "It can generate product images, SEO product title, description, bullet points, tags, FAQ content, and draft-ready product details from an uploaded product photo."
      },
      {
        question: "Does AceStudio publish directly to Shopify?",
        answer: "AceStudio is designed to publish as a Shopify draft by default, so merchants can review the product in Shopify Admin before going live."
      },
      {
        question: "Can different users connect different Shopify stores?",
        answer: "Yes. The product supports Shopify OAuth so each user workspace can connect its own store and publish drafts to the correct Shopify Admin."
      }
    ]
  },
  shopifyProductImageGenerator: {
    path: "/shopify-product-image-generator",
    eyebrow: "AI product image generator for Shopify",
    title: "Shopify product image generator for draft-ready listings",
    description:
      "AceStudio helps Shopify merchants turn one product photo into an ordered product media set with lifestyle, detail, intro, and white-background images ready for draft publishing.",
    primaryCta: "Generate Shopify product images",
    benefits: [
      "Generate 4+ product images from one uploaded photo.",
      "Keep the original image separate from generated publish media.",
      "Order lifestyle images first and white-background images last for Shopify review.",
      "Track generation jobs, errors, credits, and retry history."
    ],
    sections: [
      {
        title: "From one photo to a full media set",
        body: "Upload the original product image once, then generate multiple Shopify-ready image types inside the same workspace. This reduces manual exporting between design tools and Shopify Admin."
      },
      {
        title: "Built for product review",
        body: "Generated images stay attached to the product draft, with labels and ordering so merchants can review the final listing before anything goes live."
      },
      {
        title: "Connected to the rest of the listing",
        body: "The same product workspace also holds SEO copy, price, inventory, publish logs, and credit history, so media generation is part of the real product workflow."
      }
    ],
    faq: [
      {
        question: "Does AceStudio publish the original upload to Shopify?",
        answer: "No. The product workflow keeps the original upload separate and publishes the generated image set."
      },
      {
        question: "How many images can be sent to Shopify?",
        answer: "The MVP is designed around at least four generated images, including lifestyle, detail, intro, and white-background images."
      },
      {
        question: "Can failed image jobs be retried?",
        answer: "Yes. Failed jobs are stored with the product and can be reopened from the usage history or product workspace."
      }
    ]
  },
  shopifySeoProductDescriptionGenerator: {
    path: "/shopify-seo-product-description-generator",
    eyebrow: "AI Shopify SEO copy generator",
    title: "Shopify SEO product description generator for merchant-ready drafts",
    description:
      "Create Shopify product titles, descriptions, bullet points, tags, and FAQ content from a product image and brief, then review the copy before publishing a draft.",
    primaryCta: "Generate Shopify SEO copy",
    benefits: [
      "Generate SEO title, product description, bullets, tags, and FAQ.",
      "Edit copy before it reaches Shopify.",
      "Use target market, tone, language, keywords, and brand voice controls.",
      "Keep copy history connected to product jobs and publish logs."
    ],
    sections: [
      {
        title: "Copy that fits Shopify workflows",
        body: "AceStudio focuses on product listing copy that merchants can inspect and edit, not generic long-form marketing text."
      },
      {
        title: "Quality controls before generation",
        body: "Use style presets, target market, tone, SEO keywords, language, and brand voice to guide the AI output before the draft is created."
      },
      {
        title: "Review before publishing",
        body: "Copy generation stays draft-first. Merchants can edit titles, descriptions, tags, price, SKU, and inventory before creating a Shopify draft."
      }
    ],
    faq: [
      {
        question: "Does AceStudio write Shopify meta content?",
        answer: "The product copy workflow prepares SEO-focused title, description, tags, bullet points, and FAQ content for review."
      },
      {
        question: "Can users edit the generated copy?",
        answer: "Yes. Generated copy is placed in an editor before Shopify publishing."
      },
      {
        question: "Does copy generation have to cost credits?",
        answer: "The product is ready for credit-based billing. You can keep copy generation cheaper or free while charging more for image generation."
      }
    ]
  },
  shopifySeoGeoOptimizer: {
    path: "/shopify-seo-geo-optimizer",
    eyebrow: "Shopify SEO and GEO optimizer",
    title: "Shopify SEO and GEO optimizer for AI-ready product pages",
    description:
      "AceStudio audits Shopify product pages for search basics, AI-answer clarity, media context, and trust signals, then lets merchants approve selected improvements before writing back.",
    primaryCta: "Optimize a Shopify product",
    benefits: [
      "Score product title, SEO title, meta description, tags, and description depth.",
      "Find missing buyer Q&A, use cases, product facts, comparison context, and trust signals.",
      "Review generated fixes for SEO copy, FAQ blocks, tags, and answer-friendly product details.",
      "Write approved improvements back to Shopify only after merchant confirmation."
    ],
    proof: {
      eyebrow: "Proof-driven workflow",
      title: "See the audit, preview the fix, then approve the Shopify write-back.",
      body:
        "The page is built around the same review flow merchants use in Growth Studio: live product audit, editable before/after drafts, image SEO checks, internal link suggestions, and rich-result readiness.",
      metrics: [
        { label: "SEO/GEO fields checked", value: "20+" },
        { label: "Write-back modes", value: "4" },
        { label: "Default publish mode", value: "Draft" }
      ],
      media: [
        {
          src: "/marketing/growth-lifestyle-media.png",
          alt: "Generated lifestyle product image used in an AceStudio Shopify optimization workflow",
          label: "Lifestyle media"
        },
        {
          src: "/marketing/growth-detail-media.png",
          alt: "Generated product detail image for Shopify image SEO review",
          label: "Detail media"
        },
        {
          src: "/marketing/growth-clean-product-media.png",
          alt: "Generated white background product image for Shopify product media order",
          label: "Clean product media"
        }
      ],
      resultCards: [
        {
          title: "Before",
          detail: "Thin title, missing meta description, weak image alt text, no buyer FAQ, and no internal product context."
        },
        {
          title: "After draft",
          detail: "Editable SEO title, meta description, buyer questions, alt text, and internal links ready for merchant approval."
        }
      ]
    },
    richResults: {
      eyebrow: "Structured data validation",
      title: "Rich-result checks stay grounded in real Shopify data.",
      body:
        "AceStudio separates readiness from automation: it checks Product, Offer, Breadcrumb, FAQ, and Review prerequisites, then asks the merchant to validate live pages after deployment.",
      checks: [
        "Product schema has name, description, images, URL, brand/category context.",
        "Offer readiness uses real Shopify price, currency, availability, and product URL.",
        "FAQ and Review readiness are marked partial until visible FAQs and real customer review data exist.",
        "Google Rich Results Test should be run after deployment on the canonical page URL."
      ]
    },
    sections: [
      {
        title: "From product creation to product optimization",
        body: "AceStudio starts with the product workflow, then uses Growth Studio to audit the finished product page. This keeps optimization tied to the real listing instead of becoming a separate SEO checklist."
      },
      {
        title: "Built for Google and AI answer engines",
        body: "The audit checks traditional search fields and GEO content: product facts, buyer questions, use cases, comparisons, and clear claims that AI tools can understand without keyword stuffing."
      },
      {
        title: "Review before Shopify changes",
        body: "Similar tools often automate metadata, alt text, schema, and product content. AceStudio keeps the safer workflow: preview suggested changes first, then confirm selected updates before Shopify is touched."
      }
    ],
    optimizationAreas: [
      {
        title: "Search snippet quality",
        body: "Traditional Shopify SEO still starts with fields Google can show in search results.",
        checks: [
          "SEO title length and clarity",
          "Meta description usefulness",
          "Product tags and buyer keywords"
        ]
      },
      {
        title: "Product page depth",
        body: "Thin product pages are hard for shoppers, Google, and AI assistants to understand.",
        checks: [
          "Description depth and product facts",
          "Materials, fit, compatibility, or care details",
          "Comparison and use-case context"
        ]
      },
      {
        title: "Answer-ready content",
        body: "GEO needs direct blocks that answer common shopper questions clearly.",
        checks: [
          "Buyer Q&A and FAQ sections",
          "Audience and purchase intent",
          "Trust signals such as shipping, returns, and support"
        ]
      },
      {
        title: "Media and technical signals",
        body: "Shopify SEO tools commonly improve images, structured data, and crawlability.",
        checks: [
          "Image alt text and media labels",
          "Structured data readiness",
          "Future checks for broken links and sitemap/indexing health"
        ]
      }
    ],
    faq: [
      {
        question: "What is GEO for Shopify?",
        answer: "GEO stands for generative engine optimization. For Shopify products, it means writing clear product facts, use cases, comparisons, and FAQs that are easier for AI search tools to understand and summarize."
      },
      {
        question: "Is GEO different from SEO?",
        answer: "Yes, but they overlap. SEO focuses on traditional search visibility, while GEO focuses on clarity and usefulness for AI-generated answers. Good product pages should support both."
      },
      {
        question: "Does AceStudio guarantee Google ranking?",
        answer: "No tool can guarantee rankings. AceStudio helps merchants create clearer, more complete, reviewable product content that supports search visibility."
      }
    ]
  },
  aiShopifyDraftPublisher: {
    path: "/ai-shopify-draft-publisher",
    eyebrow: "AI Shopify draft publisher",
    title: "AI Shopify draft publisher with media, copy, price, and inventory review",
    description:
      "Connect a Shopify store with OAuth, prepare product media and SEO copy, then publish a reviewable Shopify draft with ordered images and retryable job history.",
    primaryCta: "Create a Shopify draft",
    benefits: [
      "Connect each merchant workspace to its own Shopify store.",
      "Publish as draft by default, with live publishing behind confirmation.",
      "Send generated images, SEO copy, price, SKU, and inventory together.",
      "Keep Shopify product links and publish history after success."
    ],
    sections: [
      {
        title: "Draft-first by design",
        body: "AceStudio creates a Shopify draft first so the merchant can review media, copy, price, inventory, and sales channel settings inside Shopify Admin."
      },
      {
        title: "OAuth store connection",
        body: "Users connect their own Shopify store through OAuth, so normal users do not need to paste admin API tokens into the app."
      },
      {
        title: "Publish logs merchants can trust",
        body: "Successful drafts keep their Shopify Admin link, while failed publish jobs keep the error message and retry path."
      }
    ],
    faq: [
      {
        question: "Does AceStudio publish products live automatically?",
        answer: "No. Draft publishing is the default path. Live publishing requires a separate confirmation."
      },
      {
        question: "Can different users connect different Shopify stores?",
        answer: "Yes. Each user workspace can connect its own Shopify store through OAuth."
      },
      {
        question: "What happens after a draft is created?",
        answer: "AceStudio shows a success notice and stores the Shopify Admin product link for review."
      }
    ]
  }
} as const satisfies Record<
  SeoPageKey,
  {
    path: string;
    eyebrow: string;
    title: string;
    description: string;
    primaryCta: string;
    benefits: string[];
    proof?: {
      eyebrow: string;
      title: string;
      body: string;
      metrics: Array<{ label: string; value: string }>;
      media: Array<{ src: string; alt: string; label: string }>;
      resultCards: Array<{ title: string; detail: string }>;
    };
    richResults?: {
      eyebrow: string;
      title: string;
      body: string;
      checks: string[];
    };
    optimizationAreas?: Array<{
      title: string;
      body: string;
      checks: string[];
    }>;
    sections: Array<{ title: string; body: string }>;
    faq: Array<{ question: string; answer: string }>;
  }
>;

export function getSeoPageMetadata(key: SeoPageKey): Metadata {
  const page = seoPages[key];

  return {
    title: page.title,
    description: page.description,
    keywords: key === "shopifySeoGeoOptimizer"
      ? [
        "Shopify SEO optimizer",
        "Shopify GEO optimizer",
        "Shopify rich results",
        "Shopify product schema",
        "Shopify image alt text",
        "Shopify internal links",
        "AI answer readiness for Shopify"
      ]
      : undefined,
    alternates: {
      canonical: page.path
    },
    openGraph: {
      title: `${page.title} | ${siteConfig.name}`,
      description: page.description,
      url: `${siteConfig.url}${page.path}`,
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title: `${page.title} | ${siteConfig.name}`,
      description: page.description,
      images: [`${siteConfig.url}/opengraph-image`]
    }
  };
}

export function getSeoPageStructuredData(key: SeoPageKey) {
  const page = seoPages[key];
  const optimizationAreas = "optimizationAreas" in page ? page.optimizationAreas : undefined;
  const pageUrl = `${siteConfig.url}${page.path}`;
  const organizationId = `${siteConfig.url}/#organization`;
  const websiteId = `${siteConfig.url}/#website`;
  const webpageId = `${pageUrl}#webpage`;
  const serviceId = `${pageUrl}#service`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": websiteId,
        name: siteConfig.name,
        url: siteConfig.url,
        publisher: {
          "@id": organizationId
        }
      },
      {
        "@type": "Organization",
        "@id": organizationId,
        name: siteConfig.name,
        legalName: siteConfig.company,
        url: siteConfig.url,
        logo: `${siteConfig.url}/brand/ace-studio-logo.png`
      },
      {
        "@type": "WebPage",
        "@id": webpageId,
        name: page.title,
        description: page.description,
        url: pageUrl,
        isPartOf: {
          "@id": websiteId
        },
        about: {
          "@id": serviceId
        },
        publisher: {
          "@id": organizationId
        }
      },
      {
        "@type": "Service",
        "@id": serviceId,
        name: page.title,
        serviceType: key === "shopifySeoGeoOptimizer"
          ? "Shopify SEO and generative engine optimization software"
          : "Shopify AI product workflow software",
        provider: {
          "@id": organizationId
        },
        areaServed: "Worldwide",
        audience: {
          "@type": "Audience",
          audienceType: "Shopify merchants"
        },
        description: page.description
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: siteConfig.name,
            item: siteConfig.url
          },
          {
            "@type": "ListItem",
            position: 2,
            name: page.title,
            item: pageUrl
          }
        ]
      },
      optimizationAreas?.length
        ? {
          "@type": "ItemList",
          name: `${page.title} optimization coverage`,
          itemListElement: optimizationAreas.map((area, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: area.title,
            description: area.body
          }))
        }
        : null,
      {
        "@type": "FAQPage",
        mainEntity: page.faq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer
          }
        }))
      }
    ].filter(Boolean)
  };
}
