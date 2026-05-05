import type { Metadata } from "next";
import { seoPages } from "@/lib/seo-pages";
import { siteConfig } from "@/lib/site";

export type SeoResourceSlug =
  | "how-to-write-shopify-product-descriptions-with-ai"
  | "ai-product-photography-for-shopify"
  | "shopify-product-draft-workflow";

export const seoResources = {
  "how-to-write-shopify-product-descriptions-with-ai": {
    slug: "how-to-write-shopify-product-descriptions-with-ai",
    title: "How to write Shopify product descriptions with AI",
    description:
      "A practical workflow for generating Shopify product titles, descriptions, bullets, tags, and FAQ content with AI while keeping merchant review in control.",
    excerpt:
      "Learn a review-first AI workflow for Shopify SEO product copy, from product brief to draft-ready listing content.",
    category: "Shopify SEO copy",
    readingTime: "6 min read",
    publishedAt: "2026-05-05",
    updatedAt: "2026-05-05",
    relatedPath: seoPages.shopifySeoProductDescriptionGenerator.path,
    sections: [
      {
        title: "Start with a product brief, not a blank prompt",
        body: "Good Shopify product descriptions need more than a product name. Capture the product category, target market, tone, brand voice, materials, use cases, and keywords before generating copy. This gives the AI enough context to write copy that sounds specific instead of generic."
      },
      {
        title: "Generate copy in listing parts",
        body: "Ask for a title, short description, bullet points, SEO tags, and FAQ separately. Shopify merchants usually review these fields one by one, so the AI output should match the real editing workflow instead of returning one long paragraph."
      },
      {
        title: "Keep human review before publishing",
        body: "AI copy can be useful, but merchants still need to check claims, materials, sizes, compliance language, and brand tone. A draft-first workflow keeps generated copy editable before it reaches Shopify Admin."
      }
    ],
    checklist: [
      "Use a specific target customer and product category.",
      "Include 3-8 SEO keywords without keyword stuffing.",
      "Keep the title readable for humans, not only search engines.",
      "Review claims, care instructions, and sizing before publishing.",
      "Save the final copy with the product job history."
    ],
    faq: [
      {
        question: "Can AI write Shopify product descriptions that rank?",
        answer: "AI can help create a strong first draft, but ranking also depends on product-market fit, page quality, internal links, store authority, and merchant review."
      },
      {
        question: "Should Shopify product descriptions be long?",
        answer: "They should be long enough to answer buyer questions clearly. For many products, a concise intro, useful bullets, and FAQ content work better than a long generic block."
      },
      {
        question: "Where should keywords go?",
        answer: "Use the primary keyword in the title or first sentence when natural, then include related terms in bullets, tags, and FAQ answers."
      }
    ]
  },
  "ai-product-photography-for-shopify": {
    slug: "ai-product-photography-for-shopify",
    title: "AI product photography for Shopify: a draft-first workflow",
    description:
      "How Shopify merchants can use AI product photography to create lifestyle, detail, intro, and white-background images while keeping final review in Shopify.",
    excerpt:
      "A practical guide to using AI-generated product media without losing control of the Shopify review process.",
    category: "AI product images",
    readingTime: "5 min read",
    publishedAt: "2026-05-05",
    updatedAt: "2026-05-05",
    relatedPath: seoPages.shopifyProductImageGenerator.path,
    sections: [
      {
        title: "Keep the original image separate",
        body: "The original product photo is useful as source material, but it should not be mixed up with generated publish media. Keep it as the reference image and publish only the generated images that pass review."
      },
      {
        title: "Generate multiple image types",
        body: "A strong Shopify listing usually needs more than one image. Create a lifestyle image for context, a detail image for close inspection, an intro image for the product story, and a white-background image for clean catalog presentation."
      },
      {
        title: "Order media before Shopify publishing",
        body: "Image order affects buyer perception. Put the most useful lifestyle or hero image first, keep supporting images in the middle, and place the white-background image last when that matches the product strategy."
      }
    ],
    checklist: [
      "Use one clear source image with the product visible.",
      "Generate at least four useful images before publishing.",
      "Label image types so review is easy.",
      "Check for visual artifacts before sending to Shopify.",
      "Publish as draft first and review in Shopify Admin."
    ],
    faq: [
      {
        question: "Can AI product photography replace real product photos?",
        answer: "It can help create additional listing media, but merchants should still use accurate source photos and review generated images for realism and product accuracy."
      },
      {
        question: "Which image should be first on a Shopify product page?",
        answer: "Usually the image that best explains the product quickly. For many products that is a lifestyle or hero image, but it depends on the category."
      },
      {
        question: "Should white-background images still be used?",
        answer: "Yes. White-background images are useful for catalog clarity, comparison, and some ad or marketplace workflows."
      }
    ]
  },
  "shopify-product-draft-workflow": {
    slug: "shopify-product-draft-workflow",
    title: "Shopify product draft workflow for AI-generated listings",
    description:
      "A safe Shopify product workflow for AI-generated images, SEO copy, pricing, inventory, and draft publishing.",
    excerpt:
      "Use a draft-first workflow to review AI-generated product media and copy before publishing Shopify listings live.",
    category: "Shopify publishing",
    readingTime: "6 min read",
    publishedAt: "2026-05-05",
    updatedAt: "2026-05-05",
    relatedPath: seoPages.aiShopifyDraftPublisher.path,
    sections: [
      {
        title: "Why draft-first matters",
        body: "AI can speed up content creation, but product publishing still carries business risk. Draft-first publishing gives merchants a final checkpoint for media, copy, price, SKU, inventory, and sales channel settings."
      },
      {
        title: "Use a checklist before publishing",
        body: "A clear checklist reduces mistakes. Review generated images, product title, description, tags, FAQ, price, SKU, inventory tracking, and Shopify connection status before creating the draft."
      },
      {
        title: "Keep retryable job history",
        body: "Failures should not disappear into screenshots. Store image generation, copy generation, and Shopify publish jobs with their status, error message, retry path, and final Shopify Admin link."
      }
    ],
    checklist: [
      "Connect the correct Shopify store with OAuth.",
      "Generate and review the publish image set.",
      "Review title, description, bullets, tags, and FAQ.",
      "Set price, SKU, and inventory fields.",
      "Create a Shopify draft and review it before live publishing."
    ],
    faq: [
      {
        question: "Should AI-generated Shopify products publish live automatically?",
        answer: "For most merchants, no. Draft-first publishing is safer because the store owner can review the listing before customers see it."
      },
      {
        question: "What should be checked in Shopify Admin?",
        answer: "Review image order, copy, product organization, pricing, inventory, sales channels, and any claims made by the generated content."
      },
      {
        question: "Why keep publish history?",
        answer: "Publish history helps support, debugging, accountability, and repeated workflows when a product needs to be retried."
      }
    ]
  }
} as const satisfies Record<
  SeoResourceSlug,
  {
    slug: SeoResourceSlug;
    title: string;
    description: string;
    excerpt: string;
    category: string;
    readingTime: string;
    publishedAt: string;
    updatedAt: string;
    relatedPath: string;
    sections: Array<{ title: string; body: string }>;
    checklist: string[];
    faq: Array<{ question: string; answer: string }>;
  }
>;

export const seoResourceList = Object.values(seoResources);

export function getSeoResourceMetadata(slug: SeoResourceSlug): Metadata {
  const article = seoResources[slug];
  const path = `/resources/${article.slug}`;

  return {
    title: article.title,
    description: article.description,
    alternates: {
      canonical: path
    },
    openGraph: {
      title: `${article.title} | ${siteConfig.name}`,
      description: article.description,
      url: `${siteConfig.url}${path}`,
      type: "article",
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      images: [`${siteConfig.url}/opengraph-image`]
    },
    twitter: {
      card: "summary_large_image",
      title: `${article.title} | ${siteConfig.name}`,
      description: article.description,
      images: [`${siteConfig.url}/opengraph-image`]
    }
  };
}

export function getSeoResourceStructuredData(slug: SeoResourceSlug) {
  const article = seoResources[slug];
  const path = `/resources/${article.slug}`;

  return [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: article.title,
      description: article.description,
      url: `${siteConfig.url}${path}`,
      image: `${siteConfig.url}/opengraph-image`,
      datePublished: article.publishedAt,
      dateModified: article.updatedAt,
      inLanguage: "en-US",
      author: {
        "@type": "Organization",
        name: siteConfig.company,
        url: siteConfig.url
      },
      publisher: {
        "@type": "Organization",
        name: siteConfig.company,
        url: siteConfig.url
      },
      mainEntityOfPage: `${siteConfig.url}${path}`
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
          name: "Resources",
          item: `${siteConfig.url}/resources`
        },
        {
          "@type": "ListItem",
          position: 3,
          name: article.title,
          item: `${siteConfig.url}${path}`
        }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: article.faq.map((item) => ({
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
