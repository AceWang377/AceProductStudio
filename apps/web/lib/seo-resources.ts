import type { Metadata } from "next";
import { seoPages } from "@/lib/seo-pages";
import { siteConfig } from "@/lib/site";

export type SeoResourceSlug =
  | "how-to-write-shopify-product-descriptions-with-ai"
  | "ai-product-photography-for-shopify"
  | "shopify-product-draft-workflow"
  | "shopify-ai-product-listing-checklist"
  | "best-ai-product-photo-workflow-for-shopify"
  | "shopify-ai-publishing-mistakes-to-avoid"
  | "getting-started-with-acestudio"
  | "connect-shopify-store-to-acestudio"
  | "acestudio-credit-pricing-faq"
  | "shopify-seo-geo-scoring-explained";

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
  },
  "shopify-ai-product-listing-checklist": {
    slug: "shopify-ai-product-listing-checklist",
    title: "Shopify AI product listing checklist before publishing",
    description:
      "A practical checklist for reviewing AI-generated Shopify product listings, including images, SEO copy, price, SKU, inventory, tags, FAQ, and draft publishing.",
    excerpt:
      "Use this checklist to review AI-generated Shopify listings before creating a draft product in Shopify Admin.",
    category: "Shopify listing checklist",
    readingTime: "7 min read",
    publishedAt: "2026-05-05",
    updatedAt: "2026-05-05",
    relatedPath: seoPages.shopifyAiProductListingGenerator.path,
    sections: [
      {
        title: "Review the product media set first",
        body: "Before reviewing copy, check whether the generated images explain the product clearly. A strong Shopify listing usually includes a lifestyle image, a product detail image, an intro or context image, and a clean white-background image."
      },
      {
        title: "Check copy against the real product",
        body: "AI-generated copy should be treated as a draft. Review the title, short description, bullet points, tags, FAQ answers, materials, sizing details, and any claims before the product reaches Shopify."
      },
      {
        title: "Confirm commerce fields before creating the draft",
        body: "Price, SKU, inventory quantity, inventory tracking, and sales channel settings should be reviewed before publishing. A draft-first workflow gives the merchant one final checkpoint in Shopify Admin."
      }
    ],
    checklist: [
      "Confirm the first image is the strongest selling image.",
      "Place white-background media last when it is mainly for catalog clarity.",
      "Read the title out loud and remove awkward keyword stuffing.",
      "Check price, SKU, and inventory before publish.",
      "Open the Shopify draft link after publish and review the final listing."
    ],
    faq: [
      {
        question: "Why use a checklist for AI-generated Shopify listings?",
        answer: "A checklist reduces publishing mistakes by making media, copy, price, inventory, and Shopify connection status visible before the draft is created."
      },
      {
        question: "Should every AI-generated product be reviewed?",
        answer: "Yes. AI output should be reviewed for accuracy, brand tone, visual artifacts, product claims, and Shopify settings before going live."
      },
      {
        question: "What is the safest publish status?",
        answer: "For most merchants, creating a Shopify draft first is safest because the product can be reviewed in Shopify Admin before customers see it."
      }
    ]
  },
  "best-ai-product-photo-workflow-for-shopify": {
    slug: "best-ai-product-photo-workflow-for-shopify",
    title: "Best AI product photo workflow for Shopify stores",
    description:
      "A Shopify-focused workflow for turning one product photo into AI-generated lifestyle, detail, intro, and white-background product images.",
    excerpt:
      "Build a repeatable AI product photo workflow for Shopify listings without losing review control.",
    category: "AI product photography",
    readingTime: "6 min read",
    publishedAt: "2026-05-05",
    updatedAt: "2026-05-05",
    relatedPath: seoPages.shopifyProductImageGenerator.path,
    sections: [
      {
        title: "Start with one clear source photo",
        body: "The best AI product photo workflow starts with a clear original image. The product should be visible, well framed, and not blocked by hands, props, or confusing backgrounds."
      },
      {
        title: "Generate image types for different buyer questions",
        body: "Lifestyle images answer how the product fits into real life. Detail images help buyers inspect materials or finish. Intro images explain the product story. White-background images support catalog clarity."
      },
      {
        title: "Review image order before Shopify upload",
        body: "The first image should explain the product quickly, supporting images should answer questions, and the final image can be a clean catalog-style white-background version."
      }
    ],
    checklist: [
      "Use a sharp source image with the full product visible.",
      "Generate multiple image types instead of one generic image.",
      "Remove images with artifacts or inaccurate details.",
      "Use consistent product positioning across the set.",
      "Publish generated media to Shopify only after review."
    ],
    faq: [
      {
        question: "What AI product image types work best for Shopify?",
        answer: "Lifestyle, detail, intro, and white-background images cover most Shopify listing needs because they answer different buyer questions."
      },
      {
        question: "Can one product photo create a full Shopify image set?",
        answer: "It can create useful draft media, but the merchant should still review generated images for accuracy before publishing."
      },
      {
        question: "Why keep the original image separate?",
        answer: "The original photo is the source reference. Keeping it separate avoids accidentally publishing a rough upload as part of the generated media set."
      }
    ]
  },
  "shopify-ai-publishing-mistakes-to-avoid": {
    slug: "shopify-ai-publishing-mistakes-to-avoid",
    title: "Shopify AI publishing mistakes to avoid",
    description:
      "Common mistakes Shopify merchants should avoid when using AI to generate product images, SEO copy, and draft listings.",
    excerpt:
      "Avoid common AI product publishing mistakes by keeping Shopify drafts reviewable, retryable, and tied to clear product history.",
    category: "Shopify AI safety",
    readingTime: "6 min read",
    publishedAt: "2026-05-05",
    updatedAt: "2026-05-05",
    relatedPath: seoPages.aiShopifyDraftPublisher.path,
    sections: [
      {
        title: "Publishing live before review",
        body: "The biggest mistake is sending AI-generated media and copy live before a merchant checks it. Draft-first publishing keeps the store safe while still making the workflow fast."
      },
      {
        title: "Losing the error history",
        body: "If a publish job fails, the error should be saved with the product. Retryable logs make support easier and help merchants avoid repeating the same failed steps."
      },
      {
        title: "Mixing up stores or credentials",
        body: "Different users may connect different Shopify stores. OAuth and per-store connection records reduce the risk of publishing a draft to the wrong Shopify Admin."
      }
    ],
    checklist: [
      "Publish AI-generated products as drafts first.",
      "Show the connected Shopify store before publishing.",
      "Keep failed generation and publish jobs visible.",
      "Store the successful Shopify product link.",
      "Ask for a separate confirmation before live publishing."
    ],
    faq: [
      {
        question: "Is it safe to publish AI-generated Shopify products automatically?",
        answer: "It is safer to create a draft first. Automatic live publishing can create problems if images, claims, price, or inventory are incorrect."
      },
      {
        question: "What should happen when publishing fails?",
        answer: "The app should save the error, show a clear retry path, and keep the failed job attached to the product history."
      },
      {
        question: "How can stores avoid publishing to the wrong Shopify shop?",
        answer: "Show the connected store clearly and save each Shopify OAuth connection per user or workspace."
      }
    ]
  },
  "getting-started-with-acestudio": {
    slug: "getting-started-with-acestudio",
    title: "Getting started with AceStudio",
    description:
      "A first-run guide for creating a Shopify product draft with AceStudio: connect Shopify, upload a product photo, generate media and copy, review, then publish a draft.",
    excerpt:
      "Follow the core AceStudio onboarding workflow from first login to first Shopify draft.",
    category: "Getting started",
    readingTime: "5 min read",
    publishedAt: "2026-05-07",
    updatedAt: "2026-05-07",
    relatedPath: "/dashboard",
    sections: [
      {
        title: "Connect Shopify first",
        body: "Start in the Shopify settings page and connect the store you want to publish into. OAuth saves the store connection to your account so you do not need to paste private tokens into the browser."
      },
      {
        title: "Create one focused product draft",
        body: "Upload one clear product image, confirm the detected product category, then generate the four-image media set and SEO copy. Keep the original photo as source material and review generated images before publishing."
      },
      {
        title: "Review before sending to Shopify",
        body: "Check the publish checklist, price, SKU, inventory quantity, product title, description, tags, FAQ, and image order before creating the Shopify draft."
      }
    ],
    checklist: [
      "Sign in with Google or email.",
      "Connect the correct Shopify store.",
      "Upload a clear product image.",
      "Generate images and SEO copy.",
      "Review the checklist and publish as a Shopify draft."
    ],
    faq: [
      {
        question: "Does AceStudio publish products live automatically?",
        answer: "The recommended workflow creates Shopify drafts by default so merchants can review products in Shopify Admin before making them live."
      },
      {
        question: "Can one account connect multiple stores?",
        answer: "The app stores the current connected Shopify store per account. Multi-store workspace management can be expanded as the product grows."
      },
      {
        question: "What should I do after my first draft is created?",
        answer: "Open the Shopify Admin link, inspect the product page, confirm sales channels, then decide whether to publish it live."
      }
    ]
  },
  "connect-shopify-store-to-acestudio": {
    slug: "connect-shopify-store-to-acestudio",
    title: "How to connect a Shopify store to AceStudio",
    description:
      "A practical Shopify OAuth setup guide for connecting a merchant store to AceStudio without manually sharing Admin API tokens.",
    excerpt:
      "Connect Shopify through OAuth, verify the store domain, and understand the permissions used for draft publishing.",
    category: "Shopify connection",
    readingTime: "6 min read",
    publishedAt: "2026-05-07",
    updatedAt: "2026-05-07",
    relatedPath: "/settings/shopify",
    sections: [
      {
        title: "Use the original myshopify.com domain",
        body: "When connecting a store, merchants should enter the shop domain in the standard myshopify.com format. Custom storefront domains are for customers; the Admin API connection is tied to the Shopify shop domain."
      },
      {
        title: "Approve the requested permissions",
        body: "AceStudio asks for product, file, location, inventory, and publication permissions so it can create product drafts, upload generated media, set commerce fields, and optionally publish when the merchant confirms."
      },
      {
        title: "Reconnect after app setting changes",
        body: "If Shopify OAuth scopes, app URL, redirect URL, or uninstall webhook behavior changes, reconnect the store once so the saved connection reflects the newest app configuration."
      }
    ],
    checklist: [
      "Use the store's myshopify.com domain.",
      "Confirm the Shopify app URL and redirect URL are production URLs.",
      "Approve the OAuth permissions in Shopify.",
      "Return to AceStudio and look for the connected-store success message.",
      "Create one test draft before inviting a real user."
    ],
    faq: [
      {
        question: "Do users need to paste Admin API tokens?",
        answer: "No. OAuth is the intended production flow because it stores the connection automatically and avoids asking users to copy private Shopify credentials."
      },
      {
        question: "Why does AceStudio need write_products?",
        answer: "It needs write_products to create and update Shopify product drafts with generated copy, media, price, SKU, and inventory fields."
      },
      {
        question: "Can a user disconnect Shopify?",
        answer: "They can uninstall the Shopify app or reconnect a different store. The uninstall webhook marks the saved connection inactive when Shopify sends the event."
      }
    ]
  },
  "acestudio-credit-pricing-faq": {
    slug: "acestudio-credit-pricing-faq",
    title: "AceStudio credit pricing FAQ",
    description:
      "How AceStudio credits work for AI image generation, free copy generation, admin accounts, Stripe checkout, refunds, and failed payments.",
    excerpt:
      "Understand what spends credits, what stays free, and how Stripe payment confirmation adds credits to an account.",
    category: "Credits and billing",
    readingTime: "5 min read",
    publishedAt: "2026-05-07",
    updatedAt: "2026-05-07",
    relatedPath: "/billing",
    sections: [
      {
        title: "Credits are tied to expensive generation work",
        body: "The current product charges credits for generated images because image generation is the main variable AI cost. Copy generation stays free in the MVP so users can polish listings before spending more."
      },
      {
        title: "Stripe is the source of truth for purchases",
        body: "The app starts a Stripe Checkout Session, then adds credits only after receiving a verified checkout.session.completed webhook. This avoids adding credits from canceled or spoofed checkout returns."
      },
      {
        title: "Support rules should be explicit",
        body: "Before public launch, document refund boundaries, credit expiration, failed payment behavior, receipts, tax treatment, and admin/test account rules so users know what to expect."
      }
    ],
    checklist: [
      "Use live Stripe keys only after sandbox testing.",
      "Create one live webhook endpoint for /api/stripe/webhook.",
      "Listen only to checkout.session.completed for the current MVP credit flow.",
      "Document refund and expiration rules before public launch.",
      "Keep usage and credit ledger exports available for support."
    ],
    faq: [
      {
        question: "What costs credits?",
        answer: "Image generation costs 1 credit per generated image in the current MVP. Failed image jobs refund reserved credits automatically."
      },
      {
        question: "Do credits expire?",
        answer: "Credits do not expire in the current MVP. If subscriptions or promotional credits are added later, expiration rules should be clearly shown before purchase."
      },
      {
        question: "Are credit purchases refundable?",
        answer: "Credit purchases should normally be final once delivered, except where required by law or an explicit support policy."
      }
    ]
  },
  "shopify-seo-geo-scoring-explained": {
    slug: "shopify-seo-geo-scoring-explained",
    title: "Shopify SEO and GEO scoring explained",
    description:
      "How AceStudio evaluates Shopify product and collection pages for search ranking readiness, rich snippets, image SEO, internal links, technical SEO, and AI visibility.",
    excerpt:
      "Understand the SEO and GEO scoring model behind Growth Studio and how merchants can use it to improve Shopify pages.",
    category: "SEO and GEO",
    readingTime: "7 min read",
    publishedAt: "2026-05-07",
    updatedAt: "2026-05-07",
    relatedPath: "/growth",
    sections: [
      {
        title: "SEO scoring starts with page fundamentals",
        body: "A useful Shopify score should inspect titles, descriptions, headings, body copy, image alt text, internal links, schema readiness, collection context, and crawlability instead of only counting keywords."
      },
      {
        title: "GEO focuses on answerability and trust",
        body: "Generative search systems need clear product facts, FAQs, comparison language, review readiness, brand trust signals, and structured data. A GEO score highlights whether a page can be cited or summarized confidently."
      },
      {
        title: "Recommendations should be review-first",
        body: "SEO and GEO improvements should be proposed as drafts. Merchants need to approve changes before writing back to Shopify because rankings, claims, and conversion copy all affect the business."
      }
    ],
    checklist: [
      "Audit only live listed products and active collections.",
      "Score title, meta description, headings, body content, schema, image SEO, and internal links.",
      "Flag missing Product, FAQ, and review schema readiness.",
      "Suggest collection and product cross-links.",
      "Require merchant confirmation before writing optimized content back to Shopify."
    ],
    faq: [
      {
        question: "Can a score guarantee Google ranking improvement?",
        answer: "No SEO tool can guarantee rankings. A score helps merchants fix known quality, crawlability, and content gaps that can improve the chance of stronger performance."
      },
      {
        question: "What is GEO for Shopify?",
        answer: "GEO means optimizing pages so AI answer engines can understand, trust, and cite product information more easily."
      },
      {
        question: "Should the app write changes back automatically?",
        answer: "No. The safest commercial workflow is to show proposed changes first, then let the merchant explicitly approve any Shopify write-back."
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
