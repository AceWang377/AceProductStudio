import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";

export type SeoPageKey =
  | "shopifyAiProductListingGenerator"
  | "shopifyProductImageGenerator"
  | "shopifySeoProductDescriptionGenerator"
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
    sections: Array<{ title: string; body: string }>;
    faq: Array<{ question: string; answer: string }>;
  }
>;

export function getSeoPageMetadata(key: SeoPageKey): Metadata {
  const page = seoPages[key];

  return {
    title: page.title,
    description: page.description,
    alternates: {
      canonical: page.path
    },
    openGraph: {
      title: `${page.title} | ${siteConfig.name}`,
      description: page.description,
      url: `${siteConfig.url}${page.path}`,
      type: "article"
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

  return [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: page.title,
      description: page.description,
      url: `${siteConfig.url}${page.path}`,
      isPartOf: {
        "@type": "WebSite",
        name: siteConfig.name,
        url: siteConfig.url
      },
      publisher: {
        "@type": "Organization",
        name: siteConfig.company,
        url: siteConfig.url
      }
    },
    {
      "@context": "https://schema.org",
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
          item: `${siteConfig.url}${page.path}`
        }
      ]
    },
    {
      "@context": "https://schema.org",
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
  ];
}
