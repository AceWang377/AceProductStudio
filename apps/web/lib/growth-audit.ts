import "server-only";
import type { Product, ShopifyConnection } from "@/lib/types";

const SHOPIFY_API_VERSION = "2026-04";

type IssueSeverity = "high" | "medium" | "low";
type AuditSource = "shopify" | "workspace";
type GrowthAuditIssueCategory =
  | "content"
  | "schema"
  | "image"
  | "technical"
  | "search-console"
  | "ai-visibility";

type GrowthCapabilityStatus = "ready" | "partial" | "needs-setup";
type GrowthOptimizationEffort = "low" | "medium" | "high";
type GrowthIntentStage = "transactional" | "comparison" | "informational" | "trust";

type GrowthAuditImage = {
  url?: string;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
};

export type GrowthAuditIssue = {
  key: string;
  category: GrowthAuditIssueCategory;
  label: string;
  detail: string;
  severity: IssueSeverity;
  suggestedFix: string;
};

export type GrowthAuditProduct = {
  id: string;
  title: string;
  handle?: string;
  status?: string;
  source: AuditSource;
  adminUrl?: string;
  productType?: string;
  tags: string[];
  descriptionText: string;
  seoTitle?: string;
  seoDescription?: string;
  onlineStoreUrl?: string;
  publishedAt?: string | null;
  imageCount: number;
  imagesWithAlt: number;
  images: GrowthAuditImage[];
  faqCount: number;
  updatedAt?: string;
};

export type GrowthAuditCollection = {
  id: string;
  title: string;
  handle?: string;
  source: AuditSource;
  descriptionText: string;
  seoTitle?: string;
  seoDescription?: string;
  onlineStoreUrl?: string;
  image?: GrowthAuditImage;
  updatedAt?: string;
};

export type GrowthAuditCapability = {
  key:
    | "schema"
    | "image-seo"
    | "technical-seo"
    | "search-console"
    | "ai-visibility"
    | "collection-seo"
    | "internal-linking"
    | "review-schema";
  title: string;
  score: number;
  status: GrowthCapabilityStatus;
  description: string;
  recommendations: string[];
};

export type GrowthAuditResult = {
  storeName?: string;
  shopDomain?: string;
  primaryDomain?: string;
  productCount: number;
  averageSeoScore: number;
  averageGeoScore: number;
  averageSchemaScore: number;
  averageImageSeoScore: number;
  averageTechnicalSeoScore: number;
  averageCollectionSeoScore: number;
  aiVisibilityScore: number;
  highPriorityIssueCount: number;
  excludedProductCount: number;
  capabilities: GrowthAuditCapability[];
  optimizationTasks: GrowthOptimizationTask[];
  storeOpportunities: GrowthStoreOpportunity[];
  products: GrowthProductScore[];
  collections: GrowthCollectionScore[];
  internalLinkSuggestions: GrowthInternalLinkSuggestion[];
  source: AuditSource;
  error?: string;
};

export type GrowthProductScore = {
  product: GrowthAuditProduct;
  seoScore: number;
  geoScore: number;
  schemaScore: number;
  imageSeoScore: number;
  technicalSeoScore: number;
  aiVisibilityScore: number;
  aiAnswerReadiness: GrowthAnswerReadiness;
  schemaSuggestions: GrowthSchemaSuggestion[];
  overallScore: number;
  intentStage: GrowthIntentStage;
  snippetPreview: GrowthSnippetPreview;
  issues: GrowthAuditIssue[];
  strengths: string[];
  suggestedFix: GrowthSuggestedFix;
};

export type GrowthCollectionScore = {
  collection: GrowthAuditCollection;
  seoScore: number;
  geoScore: number;
  schemaScore: number;
  imageSeoScore: number;
  technicalSeoScore: number;
  overallScore: number;
  snippetPreview: GrowthSnippetPreview;
  issues: GrowthAuditIssue[];
  suggestedFix: GrowthSuggestedFix;
};

export type GrowthSuggestedFix = {
  seoTitle: string;
  seoDescription: string;
  tags: string[];
  descriptionAppendHtml: string;
  summary: string[];
};

export type GrowthSnippetPreview = {
  title: string;
  description: string;
  urlPath: string;
  warnings: string[];
};

export type GrowthAnswerReadiness = {
  score: number;
  factors: Array<{
    key: string;
    label: string;
    passed: boolean;
    detail: string;
    recommendedAction: string;
  }>;
};

export type GrowthSchemaSuggestion = {
  type: "Product" | "Offer" | "BreadcrumbList" | "FAQPage" | "Review";
  status: "ready" | "partial" | "blocked";
  fields: string[];
  missing: string[];
  note: string;
  jsonLdPreview?: string;
};

export type GrowthOptimizationTask = {
  key: string;
  productId?: string;
  productTitle?: string;
  category: GrowthAuditIssueCategory;
  priority: IssueSeverity;
  priorityScore: number;
  effort: GrowthOptimizationEffort;
  title: string;
  whyItMatters: string;
  recommendedAction: string;
  expectedImpact: string;
  canWriteBack: boolean;
  writeBackScope: string[];
  targetUrl?: string;
};

export type GrowthInternalLinkSuggestion = {
  key: string;
  sourceTitle: string;
  sourceUrl?: string;
  targetTitle: string;
  targetUrl?: string;
  linkType: "product_to_collection" | "collection_to_product" | "product_to_product" | "blog_to_product";
  anchorText: string;
  reason: string;
  priority: IssueSeverity;
};

export type GrowthStoreOpportunity = {
  key: string;
  title: string;
  detail: string;
  benchmark: string;
  recommendedAction: string;
  impact: "traffic" | "ctr" | "rich-results" | "ai-visibility" | "technical";
  status: GrowthCapabilityStatus;
};

type ShopifyGraphQLResponse<T> = {
  data?: T;
  errors?: Array<{ message: string }>;
};

type ShopifyProductsPayload = {
  shop: {
    name?: string;
    myshopifyDomain?: string;
    primaryDomain?: {
      url?: string;
      host?: string;
    } | null;
  };
  products: {
    nodes: Array<{
      id: string;
      title?: string;
      handle?: string;
      status?: string;
      descriptionHtml?: string;
      productType?: string;
      tags?: string[];
      updatedAt?: string;
      seo?: {
        title?: string | null;
        description?: string | null;
      } | null;
      images?: {
        nodes: Array<{
          url?: string;
          altText?: string | null;
          width?: number | null;
          height?: number | null;
        }>;
      };
      onlineStoreUrl?: string | null;
      publishedAt?: string | null;
    }>;
  };
};

type ShopifyCollectionsPayload = {
  shop: {
    primaryDomain?: {
      url?: string;
      host?: string;
    } | null;
  };
  collections: {
    nodes: Array<{
      id: string;
      title?: string;
      handle?: string;
      descriptionHtml?: string;
      updatedAt?: string;
      seo?: {
        title?: string | null;
        description?: string | null;
      } | null;
      image?: {
        url?: string;
        altText?: string | null;
        width?: number | null;
        height?: number | null;
      } | null;
      availablePublicationsCount?: {
        count?: number;
      } | null;
    }>;
  };
};

function stripHtml(value?: string) {
  return (value ?? "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function wordCount(value: string) {
  return value.split(/\s+/).filter(Boolean).length;
}

function hasQuestionContent(value: string) {
  return /\?|faq|frequently asked|how to|what is|who is|where to|when to|why/i.test(value);
}

function estimateFaqCountFromHtml(value?: string) {
  const html = value ?? "";
  const headingMatches = html.match(/<h[2-5][^>]*>[\s\S]*?\?/gi)?.length ?? 0;
  const questionMatches = stripHtml(html).match(/\?/g)?.length ?? 0;
  return Math.max(headingMatches, Math.min(questionMatches, 6));
}

function issue(
  key: string,
  category: GrowthAuditIssueCategory,
  severity: IssueSeverity,
  label: string,
  detail: string,
  suggestedFix: string
): GrowthAuditIssue {
  return { key, category, severity, label, detail, suggestedFix };
}

function sentenceCase(value: string) {
  const cleaned = value.replace(/\s+/g, " ").trim();
  if (!cleaned) return cleaned;
  return `${cleaned.charAt(0).toUpperCase()}${cleaned.slice(1)}`;
}

function truncateWords(value: string, maxLength: number) {
  const cleaned = value.replace(/\s+/g, " ").trim();
  if (cleaned.length <= maxLength) return cleaned;
  const truncated = cleaned.slice(0, maxLength - 1).replace(/\s+\S*$/, "");
  return `${truncated.trim()}.`;
}

function keywordFromTitle(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2)
    .slice(0, 5);
}

function buildSuggestedFix(product: GrowthAuditProduct): GrowthSuggestedFix {
  const baseTitle = sentenceCase(product.title || "Shopify product");
  const typePrefix = product.productType ? `${product.productType} - ` : "";
  const seoTitle = truncateWords(`${typePrefix}${baseTitle} for Online Shoppers`, 68);
  const factSource = product.descriptionText || `${baseTitle} from ${product.productType || "this collection"}`;
  const seoDescription = truncateWords(
    `${baseTitle} with clear product details, buyer benefits, and use cases. Review features, fit, and care before adding it to your cart.`,
    155
  );
  const tags = Array.from(
    new Set([
      ...product.tags,
      ...keywordFromTitle(baseTitle),
      product.productType,
      "shopify seo",
      "product page"
    ].filter((tag): tag is string => Boolean(tag && tag.trim())))
  ).slice(0, 12);
  const productFacts = truncateWords(factSource, 220);
  const descriptionAppendHtml = `
    <section>
      <h3>Product details for search and AI discovery</h3>
      <p>${escapeHtml(productFacts)}</p>
      <h3>Best for</h3>
      <p>${escapeHtml(baseTitle)} is best for shoppers who want a clear product choice with visible details, practical use cases, and buying confidence before checkout.</p>
      <h3>Why choose this product</h3>
      <ul>
        <li>Clear product facts help shoppers compare options quickly.</li>
        <li>Use-case language makes the page easier for Google and AI answer engines to understand.</li>
        <li>Buyer questions reduce uncertainty before purchase.</li>
      </ul>
      <h3>Common buyer questions</h3>
      <h4>Who is this product best for?</h4>
      <p>This product is suited for shoppers comparing similar options and looking for clear details before purchase.</p>
      <h4>What should shoppers know before buying?</h4>
      <p>Review the product features, use case, sizing or compatibility details, and store policies before checkout.</p>
      <h4>How should shoppers compare it with similar products?</h4>
      <p>Compare the product by its main use case, visible attributes, material or fit details, price, shipping expectations, and return policy.</p>
    </section>
  `.replace(/\n\s+/g, "").trim();

  return {
    seoTitle,
    seoDescription,
    tags,
    descriptionAppendHtml,
    summary: [
      "Rewrite SEO title and meta description.",
      "Add search-intent tags where missing.",
      "Append answer-friendly product facts and buyer Q&A."
    ]
  };
}

function buildCollectionSuggestedFix(collection: GrowthAuditCollection): GrowthSuggestedFix {
  const baseTitle = sentenceCase(collection.title || "Shopify collection");
  const seoTitle = truncateWords(`${baseTitle} Collection | Shop Curated Products`, 68);
  const seoDescription = truncateWords(
    `Shop ${baseTitle} with curated product choices, buyer guidance, and clear details to compare the best options for your needs.`,
    155
  );
  const collectionFacts = truncateWords(collection.descriptionText || `${baseTitle} collection`, 220);
  const tags = Array.from(new Set([...keywordFromTitle(baseTitle), "collection", "shopify seo", "buying guide"])).slice(0, 10);
  const descriptionAppendHtml = `
    <section>
      <h3>${escapeHtml(baseTitle)} buying guide</h3>
      <p>${escapeHtml(collectionFacts)}</p>
      <h3>How to choose from this collection</h3>
      <p>Compare products by use case, material, size or fit, visual style, price, shipping expectations, and return policy before checkout.</p>
      <h3>Popular questions</h3>
      <h4>Who is this collection best for?</h4>
      <p>This collection is best for shoppers comparing related products and looking for a clear starting point.</p>
      <h4>How should shoppers compare products in this collection?</h4>
      <p>Review product details, images, specifications, customer proof, and policy context before choosing the best option.</p>
    </section>
  `.replace(/\n\s+/g, "").trim();

  return {
    seoTitle,
    seoDescription,
    tags,
    descriptionAppendHtml,
    summary: [
      "Rewrite collection SEO title and meta description.",
      "Add a collection-level buying guide.",
      "Link from the collection to priority live products."
    ]
  };
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function scoreIssuePriority(issueItem: GrowthAuditIssue, product: GrowthProductScore) {
  const severityScore = issueItem.severity === "high" ? 45 : issueItem.severity === "medium" ? 28 : 14;
  const categoryScore: Record<GrowthAuditIssueCategory, number> = {
    content: 18,
    schema: 14,
    image: 12,
    technical: 20,
    "search-console": 24,
    "ai-visibility": 16
  };
  const lowScoreBoost = product.overallScore < 50 ? 18 : product.overallScore < 70 ? 10 : 4;
  return clampScore(severityScore + categoryScore[issueItem.category] + lowScoreBoost);
}

function effortForIssue(issueItem: GrowthAuditIssue): GrowthOptimizationEffort {
  if (issueItem.category === "technical" || issueItem.category === "search-console") return "medium";
  if (issueItem.key === "thin-description" || issueItem.key === "ai-visibility") return "medium";
  if (issueItem.category === "schema") return "medium";
  return "low";
}

function expectedImpactForIssue(issueItem: GrowthAuditIssue) {
  if (issueItem.key === "seo-title" || issueItem.key === "seo-description") {
    return "Higher search-result clarity and stronger click-through potential.";
  }
  if (issueItem.key === "thin-description" || issueItem.category === "ai-visibility") {
    return "Better long-tail keyword coverage and stronger AI-answer readiness.";
  }
  if (issueItem.category === "schema") {
    return "Improves readiness for rich results and answer-friendly FAQ blocks.";
  }
  if (issueItem.category === "image") {
    return "Improves image search, accessibility, and product media understanding.";
  }
  if (issueItem.category === "technical") {
    return "Reduces crawl waste and prevents ranking signals from splitting across weak URLs.";
  }
  return "Improves product page quality signals for organic discovery.";
}

function writeBackScopeForIssue(issueItem: GrowthAuditIssue) {
  if (issueItem.key === "seo-title") return ["SEO title"];
  if (issueItem.key === "seo-description") return ["Meta description"];
  if (issueItem.key === "tags") return ["Product tags"];
  if (issueItem.key === "faq" || issueItem.key === "thin-description") return ["Description HTML", "Buyer FAQ"];
  if (issueItem.category === "ai-visibility") return ["Description HTML", "AI-ready Q&A"];
  if (issueItem.category === "schema") return ["Description HTML", "FAQ readiness"];
  return [];
}

function canWriteBackIssue(issueItem: GrowthAuditIssue) {
  return writeBackScopeForIssue(issueItem).length > 0;
}

function inferIntentStage(product: GrowthAuditProduct): GrowthIntentStage {
  const text = `${product.title} ${product.descriptionText} ${product.tags.join(" ")}`.toLowerCase();
  if (/return|shipping|warranty|guarantee|secure|support/.test(text)) return "trust";
  if (/compare|alternative|versus|vs|similar|unlike|better for/.test(text)) return "comparison";
  if (hasQuestionContent(text) || /how to|what is|guide|care/.test(text)) return "informational";
  return "transactional";
}

function buildSnippetPreview(product: GrowthAuditProduct, suggestedFix: GrowthSuggestedFix): GrowthSnippetPreview {
  const title = product.seoTitle?.trim() || suggestedFix.seoTitle;
  const description = product.seoDescription?.trim() || suggestedFix.seoDescription;
  let urlPath = product.handle ? `/products/${product.handle}` : "/products/product-handle";
  if (product.onlineStoreUrl) {
    try {
      urlPath = new URL(product.onlineStoreUrl).pathname;
    } catch {
      urlPath = product.onlineStoreUrl;
    }
  }
  const warnings = [
    title.length < 35 ? "Title may be too short for commercial intent." : "",
    title.length > 70 ? "Title may truncate in Google results." : "",
    description.length < 110 ? "Meta description needs stronger benefit and use-case detail." : "",
    description.length > 165 ? "Meta description may truncate in Google results." : ""
  ].filter(Boolean);

  return { title, description, urlPath, warnings };
}

function imageAltRatio(product: GrowthAuditProduct) {
  if (!product.imageCount) return 0;
  return product.imagesWithAlt / product.imageCount;
}

function imageFileNameScore(images: GrowthAuditImage[]) {
  if (!images.length) return 0;
  const descriptiveCount = images.filter((image) => {
    const fileName = image.url?.split("?")[0]?.split("/").pop()?.toLowerCase() ?? "";
    if (!fileName) return false;
    return /[a-z0-9]+-[a-z0-9-]+/.test(fileName) && !/(image|photo|upload|file)[-_]?\d{0,4}\./.test(fileName);
  }).length;
  return descriptiveCount / images.length;
}

function imageSizeScore(images: GrowthAuditImage[]) {
  if (!images.length) return 0;
  const usableCount = images.filter((image) => {
    if (!image.width || !image.height) return false;
    return image.width >= 800 && image.height >= 800 && image.width <= 4096 && image.height <= 4096;
  }).length;
  return usableCount / images.length;
}

function scoreSchemaReadiness(product: GrowthAuditProduct) {
  let score = 0;
  if (product.title.trim().length >= 20) score += 18;
  if (product.descriptionText.trim().length >= 120) score += 18;
  if (product.imageCount > 0) score += 14;
  if (product.seoDescription && product.seoDescription.trim().length >= 80) score += 12;
  if (product.tags.length >= 3) score += 10;
  if (product.faqCount >= 2) score += 16;
  if (/review|rating|testimonial|stars?/i.test(product.descriptionText)) score += 12;
  return clampScore(score);
}

function scoreImageSeoReadiness(product: GrowthAuditProduct) {
  const altScore = imageAltRatio(product) * 42;
  const countScore = product.imageCount >= 4 ? 18 : product.imageCount >= 2 ? 10 : product.imageCount ? 5 : 0;
  const fileScore = imageFileNameScore(product.images) * 20;
  const sizeScore = imageSizeScore(product.images) * 20;
  return clampScore(altScore + countScore + fileScore + sizeScore);
}

function scoreTechnicalSeoReadiness(product: GrowthAuditProduct) {
  let score = 0;
  if (product.handle && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(product.handle)) score += 24;
  if (product.status === "ACTIVE" || product.status === "READY" || product.status === "PUBLISHED_AS_DRAFT") score += 16;
  if (product.onlineStoreUrl || product.adminUrl) score += 14;
  if (product.seoTitle && product.seoDescription) score += 18;
  if (product.descriptionText.length > 300) score += 14;
  if (!/(click here|read more|http:\/\/)/i.test(product.descriptionText)) score += 14;
  return clampScore(score);
}

function scoreAiVisibilityReadiness(product: GrowthAuditProduct) {
  let score = 0;
  if (product.faqCount >= 2 || hasQuestionContent(product.descriptionText)) score += 24;
  if (/best for|ideal for|designed for|use case|who is this for/i.test(product.descriptionText)) score += 20;
  if (/compare|alternative|unlike|better for|similar/i.test(product.descriptionText)) score += 18;
  if (/material|size|dimension|fit|weight|capacity|color|care/i.test(product.descriptionText)) score += 18;
  if (/shipping|return|warranty|support|guarantee/i.test(product.descriptionText)) score += 10;
  if (product.seoDescription && product.seoDescription.length >= 90) score += 10;
  return clampScore(score);
}

function answerFactor({
  key,
  label,
  passed,
  detail,
  recommendedAction
}: {
  key: string;
  label: string;
  passed: boolean;
  detail: string;
  recommendedAction: string;
}) {
  return { key, label, passed, detail, recommendedAction };
}

function buildAiAnswerReadiness(product: GrowthAuditProduct): GrowthAnswerReadiness {
  const text = product.descriptionText;
  const factors = [
    answerFactor({
      key: "sourceable-summary",
      label: "Sourceable product summary",
      passed: wordCount(text) >= 120,
      detail: "AI answers need a clear, factual paragraph that can be summarized without guessing.",
      recommendedAction: "Add a direct product summary with product type, use case, visible attributes, and buyer outcome."
    }),
    answerFactor({
      key: "buyer-faq",
      label: "Buyer FAQ coverage",
      passed: product.faqCount >= 2 || hasQuestionContent(text),
      detail: "Question-and-answer content is easier for AI search tools to quote and for shoppers to scan.",
      recommendedAction: "Add 3-5 FAQs about fit, materials, use cases, shipping, returns, and care."
    }),
    answerFactor({
      key: "product-facts",
      label: "Concrete product facts",
      passed: /material|size|dimension|fit|weight|capacity|color|care|compatib/i.test(text),
      detail: "Generative search systems need specific facts to avoid vague or incorrect summaries.",
      recommendedAction: "Add material, dimensions, color, fit, compatibility, care, or other factual attributes."
    }),
    answerFactor({
      key: "comparison-context",
      label: "Comparison context",
      passed: /compare|alternative|unlike|better for|similar|instead/i.test(text),
      detail: "Comparison wording helps answer engines understand when this product is the right choice.",
      recommendedAction: "Add a short comparison block explaining what this product is best for versus similar options."
    }),
    answerFactor({
      key: "trust-and-policies",
      label: "Trust and policy signals",
      passed: /shipping|return|warranty|support|guarantee|secure/i.test(text),
      detail: "AI shopping answers often need buying confidence signals, not just product attributes.",
      recommendedAction: "Mention real shipping, returns, warranty, support, or guarantee context when available."
    }),
    answerFactor({
      key: "review-readiness",
      label: "Review readiness",
      passed: /review|rating|testimonial|customer|stars?/i.test(text),
      detail: "Review schema should only use real review data, but the page can still prepare customer-proof context.",
      recommendedAction: "Connect a real review source later, and never fabricate ratings or review counts."
    })
  ];
  const score = clampScore((factors.filter((factor) => factor.passed).length / factors.length) * 100);
  return { score, factors };
}

function buildJsonLdPreview(value: Record<string, unknown>) {
  return JSON.stringify(value, null, 2);
}

function buildSchemaSuggestions(product: GrowthAuditProduct): GrowthSchemaSuggestion[] {
  const imageUrls = product.images.map((image) => image.url).filter((url): url is string => Boolean(url)).slice(0, 4);
  const hasDescription = product.descriptionText.trim().length >= 80;
  const reviewAppConfigured = Boolean(process.env.JUDGEME_API_TOKEN || process.env.LOOX_API_KEY || process.env.SHOPIFY_REVIEWS_APP_ENABLED === "true");
  const productSchemaMissing = [
    product.title ? "" : "name",
    hasDescription ? "" : "description",
    imageUrls.length ? "" : "image",
    product.onlineStoreUrl ? "" : "url"
  ].filter(Boolean);

  return [
    {
      type: "Product",
      status: productSchemaMissing.length ? "partial" : "ready",
      fields: ["name", "description", "image", "url", "brand/category context"],
      missing: productSchemaMissing,
      note: "Product schema should describe the real product facts already visible on the page.",
      jsonLdPreview: buildJsonLdPreview({
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.title,
        description: truncateWords(product.descriptionText || product.seoDescription || product.title, 240),
        image: imageUrls,
        url: product.onlineStoreUrl,
        category: product.productType,
        brand: product.tags[0] || undefined
      })
    },
    {
      type: "Offer",
      status: "partial",
      fields: ["price", "priceCurrency", "availability", "url", "shipping/returns context"],
      missing: ["variant price", "currency", "availability"],
      note: "Offer schema becomes useful after the audit reads Shopify variant price, currency, and inventory availability.",
      jsonLdPreview: buildJsonLdPreview({
        "@type": "Offer",
        url: product.onlineStoreUrl,
        availability: "https://schema.org/InStock",
        price: "Connect Shopify variant price",
        priceCurrency: "Connect store currency"
      })
    },
    {
      type: "BreadcrumbList",
      status: product.onlineStoreUrl && product.productType ? "ready" : "partial",
      fields: ["home", "collection/category", "product"],
      missing: [product.productType ? "" : "collection/category", product.onlineStoreUrl ? "" : "product URL"].filter(Boolean),
      note: "Breadcrumb schema helps Google understand page hierarchy and category context.",
      jsonLdPreview: buildJsonLdPreview({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: product.onlineStoreUrl ? new URL("/", product.onlineStoreUrl).toString() : undefined },
          { "@type": "ListItem", position: 2, name: product.productType || "Collection" },
          { "@type": "ListItem", position: 3, name: product.title, item: product.onlineStoreUrl }
        ]
      })
    },
    {
      type: "FAQPage",
      status: product.faqCount >= 2 || hasQuestionContent(product.descriptionText) ? "ready" : "partial",
      fields: ["real buyer questions", "visible answers", "page-visible FAQ block"],
      missing: product.faqCount >= 2 || hasQuestionContent(product.descriptionText) ? [] : ["FAQ questions and answers"],
      note: "FAQ schema should match visible FAQ content on the product page.",
      jsonLdPreview: buildJsonLdPreview({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: `What should shoppers know about ${product.title}?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: "Use the visible product FAQ content from Shopify here."
            }
          }
        ]
      })
    },
    {
      type: "Review",
      status: reviewAppConfigured ? "partial" : "blocked",
      fields: ["real rating value", "real review count", "review source"],
      missing: reviewAppConfigured ? ["validated review feed"] : ["Judge.me, Loox, Shopify reviews, or another real review source"],
      note: "Review schema must never use generated or fake ratings. It should only be enabled with real customer review data."
    }
  ];
}

function statusFromScore(score: number): GrowthCapabilityStatus {
  if (score >= 75) return "ready";
  if (score >= 45) return "partial";
  return "needs-setup";
}

function averageScore(products: GrowthProductScore[], getScore: (product: GrowthProductScore) => number) {
  if (!products.length) return 0;
  return clampScore(products.reduce((sum, product) => sum + getScore(product), 0) / products.length);
}

function averageCollectionScore(collections: GrowthCollectionScore[], getScore: (collection: GrowthCollectionScore) => number) {
  if (!collections.length) return 0;
  return clampScore(collections.reduce((sum, collection) => sum + getScore(collection), 0) / collections.length);
}

function hasSearchConsoleConfig() {
  return Boolean(
    process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL ||
      process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL ||
      process.env.GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY
  );
}

function hasAiVisibilityConfig() {
  return process.env.AI_VISIBILITY_TRACKING_ENABLED === "true";
}

function buildCapabilities({
  scoredProducts,
  scoredCollections,
  averageSchemaScore,
  averageImageSeoScore,
  averageTechnicalSeoScore,
  averageCollectionSeoScore,
  aiVisibilityScore,
  internalLinkSuggestions,
  primaryDomain
}: {
  scoredProducts: GrowthProductScore[];
  scoredCollections: GrowthCollectionScore[];
  averageSchemaScore: number;
  averageImageSeoScore: number;
  averageTechnicalSeoScore: number;
  averageCollectionSeoScore: number;
  aiVisibilityScore: number;
  internalLinkSuggestions: GrowthInternalLinkSuggestion[];
  primaryDomain?: string;
}): GrowthAuditCapability[] {
  const searchConsoleConfigured = hasSearchConsoleConfig();
  const aiVisibilityConfigured = hasAiVisibilityConfig();
  const productsWithFaq = scoredProducts.filter((product) => product.product.faqCount >= 2).length;
  const reviewReadyProducts = scoredProducts.filter((product) => /review|rating|testimonial|stars?/i.test(product.product.descriptionText)).length;
  const reviewAppConfigured = Boolean(process.env.JUDGEME_API_TOKEN || process.env.LOOX_API_KEY || process.env.SHOPIFY_REVIEWS_APP_ENABLED === "true");
  const internalLinkScore = scoredProducts.length || scoredCollections.length
    ? clampScore(35 + Math.min(internalLinkSuggestions.length * 8, 45) + (scoredCollections.length ? 20 : 0))
    : 0;
  const reviewScore = clampScore(
    (reviewAppConfigured ? 45 : 15) +
      (scoredProducts.length ? (reviewReadyProducts / scoredProducts.length) * 45 : 0) +
      (productsWithFaq ? 10 : 0)
  );

  return [
    {
      key: "collection-seo",
      title: "Collection page SEO",
      score: averageCollectionSeoScore,
      status: scoredCollections.length ? statusFromScore(averageCollectionSeoScore) : "needs-setup",
      description: "Scores live collection/category pages for titles, meta descriptions, buying-guide copy, FAQs, image context, and public URLs.",
      recommendations: [
        scoredCollections.length
          ? `${scoredCollections.length} live collections are included in the audit.`
          : "Publish collections to Online Store so category pages can build broader keyword authority.",
        "Add collection buying guides that link to priority products.",
        "Use collection FAQs for category-level long-tail searches."
      ]
    },
    {
      key: "internal-linking",
      title: "Internal linking suggestions",
      score: internalLinkScore,
      status: statusFromScore(internalLinkScore),
      description: "Finds product-to-collection, collection-to-product, product-to-product, and blog-to-product link opportunities.",
      recommendations: [
        internalLinkSuggestions.length
          ? `${internalLinkSuggestions.length} internal link opportunities are ready to review.`
          : "Add collections or more related live products to generate richer link suggestions.",
        "Use descriptive anchors rather than generic text like click here.",
        "Create buyer guides that link back to the strongest revenue pages."
      ]
    },
    {
      key: "schema",
      title: "Schema / rich snippets",
      score: averageSchemaScore,
      status: statusFromScore(averageSchemaScore),
      description: "Checks Product schema, FAQ schema, and review schema readiness from visible product fields.",
      recommendations: [
        "Keep Product schema fields complete: title, description, image, URL, offer data, and brand context.",
        productsWithFaq
          ? `${productsWithFaq} products already have FAQ-style content.`
          : "Add buyer FAQ blocks so FAQ schema can be enabled later.",
        "Collect review/rating data before enabling review schema."
      ]
    },
    {
      key: "review-schema",
      title: "Review schema readiness",
      score: reviewScore,
      status: reviewAppConfigured ? statusFromScore(reviewScore) : "needs-setup",
      description: "Prepares review/rating schema checks without fabricating review data. Judge.me, Loox, or Shopify review data can be connected later.",
      recommendations: [
        reviewAppConfigured
          ? "A review app integration flag is present. Validate real review counts and ratings before writing schema."
          : "Connect Judge.me, Loox, or another real review source later if merchants want review rich-result readiness.",
        `${reviewReadyProducts} live products currently mention reviews, ratings, testimonials, or customer proof.`,
        "Never generate fake ratings or review counts for schema."
      ]
    },
    {
      key: "image-seo",
      title: "Image SEO depth",
      score: averageImageSeoScore,
      status: statusFromScore(averageImageSeoScore),
      description: "Scores alt text, image count, filename quality, dimensions, compression readiness, and ordering.",
      recommendations: [
        "Keep lifestyle or context image first and white-background image last.",
        "Use descriptive filenames when exporting generated images.",
        "Prefer compressed 800-4096px product images with meaningful alt text."
      ]
    },
    {
      key: "technical-seo",
      title: "Broken links / redirects / sitemap",
      score: averageTechnicalSeoScore,
      status: statusFromScore(averageTechnicalSeoScore),
      description: "Prepares checks for crawlable handles, canonical product URLs, HTTPS, sitemap inclusion, and broken-link risk.",
      recommendations: [
        primaryDomain
          ? `Use ${primaryDomain} as the canonical store domain.`
          : "Connect Shopify primary domain before running live technical checks.",
        "Add a live crawler step for 404 links, redirect chains, and sitemap health.",
        "Avoid temporary or duplicated product handles."
      ]
    },
    {
      key: "search-console",
      title: "Google Search Console",
      score: searchConsoleConfigured ? 55 : 15,
      status: searchConsoleConfigured ? "partial" : "needs-setup",
      description: "Future layer for impressions, clicks, CTR, average position, and query-to-product optimization.",
      recommendations: [
        "Add Google Search Console OAuth or service-account verification for connected domains.",
        "Use low-CTR queries to rewrite SEO titles and meta descriptions.",
        "Use high-impression product queries to prioritize content refreshes."
      ]
    },
    {
      key: "ai-visibility",
      title: "AI visibility tracking",
      score: aiVisibilityConfigured ? Math.max(aiVisibilityScore, 45) : aiVisibilityScore,
      status: aiVisibilityConfigured ? statusFromScore(Math.max(aiVisibilityScore, 45)) : statusFromScore(aiVisibilityScore),
      description: "Tracks readiness for ChatGPT, Perplexity, Google AI Overviews, and other answer engines.",
      recommendations: [
        "Add direct buyer Q&A, factual product summaries, and comparison context.",
        "Track whether brand/product pages are cited in AI answers once monitoring is enabled.",
        "Use AI visibility gaps to generate new FAQ and comparison sections."
      ]
    }
  ];
}

export function scoreGrowthProduct(product: GrowthAuditProduct): GrowthProductScore {
  const issues: GrowthAuditIssue[] = [];
  const strengths: string[] = [];
  const titleLength = product.title.trim().length;
  const seoTitleLength = (product.seoTitle || product.title).trim().length;
  const seoDescriptionLength = (product.seoDescription || "").trim().length;
  const descriptionWords = wordCount(product.descriptionText);
  const tags = product.tags.filter(Boolean);
  const altRatio = imageAltRatio(product);

  let seoScore = 0;
  let geoScore = 0;

  if (titleLength >= 35 && titleLength <= 80) {
    seoScore += 15;
    strengths.push("Product title is descriptive enough for search snippets.");
  } else {
    issues.push(issue(
      "title-length",
      "content",
      titleLength < 20 ? "high" : "medium",
      "Improve product title clarity",
      "Titles should describe the product, key attribute, and buyer use case without becoming too long.",
      "Rewrite the title with product type, material/style, and one buyer-intent phrase."
    ));
    seoScore += titleLength >= 20 ? 8 : 3;
  }

  if (seoTitleLength >= 35 && seoTitleLength <= 70) {
    seoScore += 15;
  } else {
    issues.push(issue(
      "seo-title",
      "content",
      "medium",
      "Add a stronger SEO title",
      "The SEO title should be concise enough for Google but specific enough to earn clicks.",
      "Generate a 45-65 character SEO title focused on product type, attribute, and target buyer."
    ));
    seoScore += seoTitleLength ? 7 : 0;
  }

  if (seoDescriptionLength >= 110 && seoDescriptionLength <= 165) {
    seoScore += 15;
    strengths.push("Meta description is within a useful search-snippet range.");
  } else {
    issues.push(issue(
      "seo-description",
      "content",
      seoDescriptionLength < 50 ? "high" : "medium",
      "Rewrite meta description",
      "A useful meta description can improve search result clarity and click-through rate.",
      "Generate a 130-155 character meta description that explains product benefit, use case, and audience."
    ));
    seoScore += seoDescriptionLength >= 50 ? 8 : 0;
  }

  if (descriptionWords >= 120) {
    seoScore += 20;
    geoScore += 20;
    strengths.push("Description has enough depth for buyer intent and AI summaries.");
  } else {
    issues.push(issue(
      "thin-description",
      "content",
      descriptionWords < 50 ? "high" : "medium",
      "Expand product description",
      "Thin product descriptions make it harder for Google and AI answer engines to understand the product.",
      "Add product facts, materials, fit, use cases, care details, and buying context."
    ));
    seoScore += descriptionWords >= 60 ? 10 : 2;
    geoScore += descriptionWords >= 60 ? 8 : 2;
  }

  if (product.imageCount >= 3 && altRatio >= 0.75) {
    seoScore += 15;
    strengths.push("Most product images include alt text.");
  } else {
    issues.push(issue(
      "image-alt",
      "image",
      product.imageCount === 0 ? "medium" : "high",
      "Improve image SEO context",
      "Image alt text helps Google understand product media and improves accessibility.",
      "Generate descriptive alt text for each product image using product type, color, material, and use case."
    ));
    seoScore += product.imageCount ? Math.round(8 * altRatio) : 0;
  }

  if (tags.length >= 5) {
    seoScore += 10;
  } else {
    issues.push(issue(
      "tags",
      "content",
      "low",
      "Add product tags or keywords",
      "Tags help organize product intent and can support internal discovery.",
      "Add 5-8 tags covering product type, style, color, material, audience, and use case."
    ));
    seoScore += Math.min(tags.length * 2, 8);
  }

  if (product.faqCount >= 2 || hasQuestionContent(product.descriptionText)) {
    seoScore += 10;
    geoScore += 20;
    strengths.push("Buyer questions are present for answer-style discovery.");
  } else {
    issues.push(issue(
      "faq",
      "schema",
      "medium",
      "Add buyer Q&A",
      "Question-and-answer content helps shoppers and gives AI search tools cleaner answer blocks.",
      "Generate 3-5 FAQs around fit, use cases, materials, shipping expectations, and care."
    ));
  }

  if (/for |best for|ideal for|designed for|use|wear|gift|work|travel|home/i.test(product.descriptionText)) {
    geoScore += 20;
  } else {
    issues.push(issue(
      "use-cases",
      "ai-visibility",
      "medium",
      "Add use cases",
      "GEO content should make it clear who the product is for and when someone should buy it.",
      "Add 2-3 concrete use cases and the buyer profile this product fits."
    ));
  }

  if (/material|cotton|polyester|leather|steel|size|dimension|fit|weight|capacity|color/i.test(product.descriptionText)) {
    geoScore += 20;
  } else {
    issues.push(issue(
      "product-facts",
      "ai-visibility",
      "medium",
      "Add specific product facts",
      "AI answer engines need concrete attributes to summarize products accurately.",
      "Add material, dimensions, compatibility, fit, color, and care details where relevant."
    ));
  }

  if (/compare|alternative|instead|similar|unlike|better for/i.test(product.descriptionText)) {
    geoScore += 10;
  } else {
    issues.push(issue(
      "comparison",
      "ai-visibility",
      "low",
      "Add comparison context",
      "Comparison-friendly wording can help users and AI systems understand when this product is the right choice.",
      "Add a short line explaining what this product is best for compared with similar options."
    ));
  }

  if (/return|shipping|warranty|support|guarantee|secure/i.test(product.descriptionText)) {
    geoScore += 10;
  } else {
    issues.push(issue(
      "trust-context",
      "ai-visibility",
      "low",
      "Add trust context",
      "Product pages often perform better when they answer basic buying-confidence questions.",
      "Add relevant shipping, returns, support, care, or guarantee context if available."
    ));
  }

  const finalSeoScore = clampScore(seoScore);
  const finalGeoScore = clampScore(geoScore);
  const schemaScore = scoreSchemaReadiness(product);
  const imageSeoScore = scoreImageSeoReadiness(product);
  const technicalSeoScore = scoreTechnicalSeoReadiness(product);
  const aiAnswerReadiness = buildAiAnswerReadiness(product);
  const schemaSuggestions = buildSchemaSuggestions(product);
  const aiVisibilityScore = clampScore((scoreAiVisibilityReadiness(product) + aiAnswerReadiness.score) / 2);

  if (schemaScore < 70) {
    issues.push(issue(
      "schema-readiness",
      "schema",
      schemaScore < 45 ? "high" : "medium",
      "Improve rich snippet readiness",
      "Product schema needs complete product facts, image context, SEO description, FAQ blocks, and review readiness before Google can show richer results.",
      "Prepare Product schema fields, add FAQ content, and collect review/rating data before enabling rich snippets."
    ));
  } else {
    strengths.push("Product has the core fields needed for Product and FAQ schema readiness.");
  }

  if (imageSeoScore < 70) {
    issues.push(issue(
      "image-seo-depth",
      "image",
      imageSeoScore < 45 ? "high" : "medium",
      "Deepen image SEO",
      "Image SEO should cover alt text, image count, descriptive filenames, dimensions, compression readiness, and media ordering.",
      "Rename exported files with product keywords, keep lifestyle media first, add alt text, and use 800-4096px compressed images."
    ));
  }

  if (technicalSeoScore < 70) {
    issues.push(issue(
      "technical-seo-health",
      "technical",
      technicalSeoScore < 45 ? "high" : "medium",
      "Check technical SEO health",
      "Broken links, redirect loops, weak handles, missing canonical pages, and sitemap/indexing gaps can block good content from ranking.",
      "Check product handles, crawlable URLs, sitemap inclusion, HTTPS canonical links, and broken links before publishing updates."
    ));
  }

  if (aiVisibilityScore < 70) {
    issues.push(issue(
      "ai-visibility",
      "ai-visibility",
      aiVisibilityScore < 45 ? "high" : "medium",
      "Improve AI visibility signals",
      "AI answer engines need direct facts, buyer questions, comparison context, and trust information to cite or summarize a product confidently.",
      "Add answer-ready product facts, buyer FAQs, comparison blocks, and trust context that can be reused in AI search results."
    ));
  }

  const overallScore = clampScore(
    (finalSeoScore + finalGeoScore + schemaScore + imageSeoScore + technicalSeoScore + aiVisibilityScore) / 6
  );
  const suggestedFix = buildSuggestedFix(product);

  return {
    product,
    seoScore: finalSeoScore,
    geoScore: finalGeoScore,
    schemaScore,
    imageSeoScore,
    technicalSeoScore,
    aiVisibilityScore,
    aiAnswerReadiness,
    schemaSuggestions,
    overallScore,
    intentStage: inferIntentStage(product),
    snippetPreview: buildSnippetPreview(product, suggestedFix),
    issues,
    strengths: strengths.slice(0, 3),
    suggestedFix
  };
}

function buildCollectionSnippetPreview(collection: GrowthAuditCollection, suggestedFix: GrowthSuggestedFix): GrowthSnippetPreview {
  const title = collection.seoTitle?.trim() || suggestedFix.seoTitle;
  const description = collection.seoDescription?.trim() || suggestedFix.seoDescription;
  let urlPath = collection.handle ? `/collections/${collection.handle}` : "/collections/collection-handle";
  if (collection.onlineStoreUrl) {
    try {
      urlPath = new URL(collection.onlineStoreUrl).pathname;
    } catch {
      urlPath = collection.onlineStoreUrl;
    }
  }
  const warnings = [
    title.length < 35 ? "Collection title may be too short for buyer intent." : "",
    title.length > 70 ? "Collection title may truncate in Google results." : "",
    description.length < 110 ? "Meta description needs clearer collection value and selection guidance." : "",
    description.length > 165 ? "Meta description may truncate in Google results." : ""
  ].filter(Boolean);

  return { title, description, urlPath, warnings };
}

export function scoreGrowthCollection(collection: GrowthAuditCollection): GrowthCollectionScore {
  const issues: GrowthAuditIssue[] = [];
  const titleLength = collection.title.trim().length;
  const seoTitleLength = (collection.seoTitle || collection.title).trim().length;
  const seoDescriptionLength = (collection.seoDescription || "").trim().length;
  const descriptionWords = wordCount(collection.descriptionText);
  const hasImageAlt = Boolean(collection.image?.altText?.trim());
  let seoScore = 0;
  let geoScore = 0;
  let schemaScore = 0;
  let imageSeoScore = 0;
  let technicalSeoScore = 0;

  if (titleLength >= 25 && titleLength <= 80) {
    seoScore += 18;
    schemaScore += 12;
  } else {
    issues.push(issue(
      "collection-title",
      "content",
      titleLength < 18 ? "high" : "medium",
      "Improve collection title",
      "Collection pages should target a clear category, use case, or buyer intent instead of a vague label.",
      "Rewrite the collection title with category, style, material, audience, or shopping intent."
    ));
    seoScore += titleLength >= 18 ? 8 : 3;
  }

  if (seoTitleLength >= 35 && seoTitleLength <= 70) {
    seoScore += 18;
  } else {
    issues.push(issue(
      "collection-seo-title",
      "content",
      "medium",
      "Add collection SEO title",
      "Collection SEO titles help category pages rank for broader commercial keywords than individual products.",
      "Generate a 45-65 character collection SEO title around the main product category and buyer intent."
    ));
    seoScore += seoTitleLength ? 8 : 0;
  }

  if (seoDescriptionLength >= 110 && seoDescriptionLength <= 165) {
    seoScore += 18;
  } else {
    issues.push(issue(
      "collection-meta-description",
      "content",
      seoDescriptionLength < 50 ? "high" : "medium",
      "Rewrite collection meta description",
      "Collection descriptions should make the category promise clear and help users choose between products.",
      "Write a 130-155 character meta description with category, selection value, and buyer outcome."
    ));
    seoScore += seoDescriptionLength >= 50 ? 8 : 0;
  }

  if (descriptionWords >= 100) {
    seoScore += 22;
    geoScore += 26;
    schemaScore += 16;
  } else {
    issues.push(issue(
      "collection-thin-description",
      "content",
      descriptionWords < 35 ? "high" : "medium",
      "Expand collection buying guide",
      "Thin collection pages miss category keywords and give AI answer engines little context to summarize.",
      "Add a short buying guide that explains who the collection is for, how to compare products, and what matters before purchase."
    ));
    seoScore += descriptionWords >= 50 ? 10 : 2;
    geoScore += descriptionWords >= 50 ? 10 : 2;
  }

  if (hasQuestionContent(collection.descriptionText)) {
    geoScore += 24;
    schemaScore += 20;
  } else {
    issues.push(issue(
      "collection-faq",
      "schema",
      "medium",
      "Add collection FAQs",
      "Category-level FAQs can support long-tail SEO and give answer engines a clean summary of shopper decisions.",
      "Add 2-4 FAQs about how to choose from the collection, product differences, sizing/materials, and shipping or returns."
    ));
  }

  if (/compare|choose|guide|best for|ideal for|gift|style|material|size|occasion/i.test(collection.descriptionText)) {
    geoScore += 24;
  } else {
    issues.push(issue(
      "collection-selection-context",
      "ai-visibility",
      "medium",
      "Add selection context",
      "GEO-ready collection pages should explain how products differ and when a buyer should choose one option over another.",
      "Add comparison and selection language that links the collection theme to shopper needs."
    ));
  }

  if (collection.image?.url) {
    imageSeoScore += 35;
    seoScore += 12;
  } else {
    issues.push(issue(
      "collection-image",
      "image",
      "low",
      "Add collection image",
      "A representative collection image improves social previews, category context, and visual trust.",
      "Add a clean category image or use the strongest product lifestyle image as the collection image."
    ));
  }

  if (hasImageAlt) {
    imageSeoScore += 45;
  } else if (collection.image?.url) {
    issues.push(issue(
      "collection-image-alt",
      "image",
      "medium",
      "Add collection image alt text",
      "Collection image alt text helps accessibility and image search understand the category theme.",
      "Write alt text that names the collection category, style, and buyer use case."
    ));
    imageSeoScore += 12;
  }

  if (collection.handle && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(collection.handle)) technicalSeoScore += 35;
  else {
    issues.push(issue(
      "collection-handle",
      "technical",
      "medium",
      "Use clean collection handle",
      "Readable handles help canonical category URLs stay stable and understandable.",
      "Use lowercase hyphenated handles such as gemstone-rings or summer-dresses."
    ));
  }

  if (collection.onlineStoreUrl) technicalSeoScore += 35;
  else {
    issues.push(issue(
      "collection-online-store-url",
      "technical",
      "high",
      "Publish collection to Online Store",
      "Only public collection URLs can be crawled, linked internally, and improved for rankings.",
      "Publish the collection to the Online Store channel before prioritizing SEO work."
    ));
  }

  if (!/(click here|read more|http:\/\/)/i.test(collection.descriptionText)) technicalSeoScore += 20;
  if (collection.seoTitle && collection.seoDescription) schemaScore += 20;
  if (collection.image?.url) schemaScore += 12;
  if (/review|rating|testimonial|customer/i.test(collection.descriptionText)) schemaScore += 8;

  const suggestedFix = buildCollectionSuggestedFix(collection);
  const finalSeoScore = clampScore(seoScore);
  const finalGeoScore = clampScore(geoScore);
  const finalSchemaScore = clampScore(schemaScore);
  const finalImageSeoScore = clampScore(imageSeoScore);
  const finalTechnicalSeoScore = clampScore(technicalSeoScore);

  return {
    collection,
    seoScore: finalSeoScore,
    geoScore: finalGeoScore,
    schemaScore: finalSchemaScore,
    imageSeoScore: finalImageSeoScore,
    technicalSeoScore: finalTechnicalSeoScore,
    overallScore: clampScore((finalSeoScore + finalGeoScore + finalSchemaScore + finalImageSeoScore + finalTechnicalSeoScore) / 5),
    snippetPreview: buildCollectionSnippetPreview(collection, suggestedFix),
    issues,
    suggestedFix
  };
}

export function buildGrowthSuggestedFix(product: GrowthAuditProduct) {
  return buildSuggestedFix(product);
}

function mapWorkspaceProduct(product: Product): GrowthAuditProduct {
  const generatedImages = product.images.filter((image) => image.type !== "ORIGINAL");
  const descriptionText = [
    product.description,
    product.bulletPoints.join(". "),
    product.faq.map((item) => `${item.question} ${item.answer}`).join(" ")
  ]
    .filter(Boolean)
    .join(" ");

  return {
    id: product.id,
    title: product.title || product.name || "Untitled product",
    status: product.shopifyStatus,
    source: "workspace",
    adminUrl: undefined,
    productType: product.category,
    tags: product.tags,
    descriptionText,
    seoTitle: product.title,
    seoDescription: product.description,
    imageCount: generatedImages.length || product.images.length,
    imagesWithAlt: 0,
    images: generatedImages.length
      ? generatedImages.map((image) => ({ url: image.url, altText: null }))
      : product.images.map((image) => ({ url: image.url, altText: null })),
    faqCount: product.faq.length,
    updatedAt: product.updatedAt
  };
}

async function shopifyGraphQL<T>({
  shopDomain,
  accessToken,
  query,
  variables
}: {
  shopDomain: string;
  accessToken: string;
  query: string;
  variables?: Record<string, unknown>;
}) {
  const response = await fetch(`https://${shopDomain}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": accessToken
    },
    body: JSON.stringify({ query, variables: variables ?? {} }),
    cache: "no-store"
  });
  const payload = (await response.json()) as ShopifyGraphQLResponse<T>;
  if (!response.ok) {
    throw new Error(`Shopify GraphQL request failed (${response.status}).`);
  }
  if (payload.errors?.length) {
    throw new Error(payload.errors.map((error) => error.message).join("; "));
  }
  return payload.data;
}

function shopifyAdminProductUrl(shopDomain: string, productId: string) {
  const numericId = productId.match(/Product\/(\d+)/)?.[1];
  if (!numericId) return undefined;
  return `https://admin.shopify.com/store/${shopDomain.replace(".myshopify.com", "")}/products/${numericId}`;
}

async function fetchShopifyProducts(connection: ShopifyConnection): Promise<{
  storeName?: string;
  shopDomain?: string;
  primaryDomain?: string;
  excludedProductCount: number;
  products: GrowthAuditProduct[];
}> {
  if (!connection.shopDomain || !connection.adminAccessToken) {
    return { products: [], excludedProductCount: 0 };
  }

  const data = await fetchShopifyProductsPayload(connection);

  const shopDomain = data?.shop.myshopifyDomain || connection.shopDomain;
  const allProducts = (data?.products.nodes ?? []).map((product) => {
    const images = product.images?.nodes ?? [];
    return {
      id: product.id,
      title: product.title || "Untitled Shopify product",
      handle: product.handle,
      status: product.status,
      source: "shopify" as const,
      adminUrl: shopifyAdminProductUrl(shopDomain, product.id),
      productType: product.productType,
      tags: product.tags ?? [],
      descriptionText: stripHtml(product.descriptionHtml),
      seoTitle: product.seo?.title || product.title,
      seoDescription: product.seo?.description || "",
      onlineStoreUrl: product.onlineStoreUrl || undefined,
      publishedAt: product.publishedAt ?? null,
      imageCount: images.length,
      imagesWithAlt: images.filter((image) => Boolean(image.altText?.trim())).length,
      images: images.map((image) => ({
        url: image.url,
        altText: image.altText,
        width: image.width,
        height: image.height
      })),
      faqCount: estimateFaqCountFromHtml(product.descriptionHtml),
      updatedAt: product.updatedAt
    };
  });
  const liveProducts = allProducts.filter((product) => isLiveShopifyProduct(product));

  return {
    storeName: data?.shop.name,
    shopDomain,
    primaryDomain: data?.shop.primaryDomain?.url || (data?.shop.primaryDomain?.host ? `https://${data.shop.primaryDomain.host}` : undefined),
    excludedProductCount: allProducts.length - liveProducts.length,
    products: liveProducts
  };
}

async function fetchShopifyProductsPayload(connection: ShopifyConnection) {
  const liveOnlineStoreQuery = "status:active AND published_status:published";
  try {
    return await runShopifyProductsQuery(connection, liveOnlineStoreQuery, 100);
  } catch {
    try {
      return await runShopifyProductsQuery(connection, "status:active", 100);
    } catch {
      return runShopifyProductsQuery(connection, undefined, 100);
    }
  }
}

async function runShopifyProductsQuery(connection: ShopifyConnection, productQuery?: string, first = 100) {
  return shopifyGraphQL<ShopifyProductsPayload>({
    shopDomain: connection.shopDomain!,
    accessToken: connection.adminAccessToken!,
    query: `
      query GrowthAuditProducts($first: Int!, $query: String) {
        shop {
          name
          myshopifyDomain
          primaryDomain {
            url
            host
          }
        }
        products(first: $first, sortKey: UPDATED_AT, reverse: true, query: $query) {
          nodes {
            id
            title
            handle
            status
            publishedAt
            descriptionHtml
            productType
            tags
            updatedAt
            seo {
              title
              description
            }
            images(first: 8) {
              nodes {
                url
                altText
                width
                height
              }
            }
            onlineStoreUrl
          }
        }
      }
    `,
    variables: { first, query: productQuery }
  });
}

async function fetchShopifyCollections(connection: ShopifyConnection): Promise<GrowthAuditCollection[]> {
  if (!connection.shopDomain || !connection.adminAccessToken) return [];

  try {
    const data = await shopifyGraphQL<ShopifyCollectionsPayload>({
      shopDomain: connection.shopDomain,
      accessToken: connection.adminAccessToken,
      query: `
        query GrowthAuditCollections($first: Int!) {
          shop {
            primaryDomain {
              url
              host
            }
          }
          collections(first: $first, sortKey: UPDATED_AT, reverse: true) {
            nodes {
              id
              title
              handle
              descriptionHtml
              updatedAt
              seo {
                title
                description
              }
              image {
                url
                altText
                width
                height
              }
              availablePublicationsCount {
                count
              }
            }
          }
        }
      `,
      variables: { first: 40 }
    });
    const primaryDomain = data?.shop.primaryDomain?.url || (data?.shop.primaryDomain?.host ? `https://${data.shop.primaryDomain.host}` : undefined);

    return (data?.collections.nodes ?? [])
      .map((collection) => ({
        id: collection.id,
        title: collection.title || "Untitled collection",
        handle: collection.handle,
        source: "shopify" as const,
        descriptionText: stripHtml(collection.descriptionHtml),
        seoTitle: collection.seo?.title || collection.title,
        seoDescription: collection.seo?.description || "",
        onlineStoreUrl: primaryDomain && collection.handle ? new URL(`/collections/${collection.handle}`, primaryDomain).toString() : undefined,
        image: collection.image?.url
          ? {
            url: collection.image.url,
            altText: collection.image.altText,
            width: collection.image.width,
            height: collection.image.height
          }
          : undefined,
        updatedAt: collection.updatedAt
      }))
      .filter((collection, index) =>
        hasPublicOnlineStoreUrl(collection.onlineStoreUrl) &&
        Number(data?.collections.nodes[index]?.availablePublicationsCount?.count ?? 0) > 0
      );
  } catch {
    return [];
  }
}

function hasPastPublishedAt(value?: string | null) {
  if (!value) return false;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) && timestamp <= Date.now();
}

function hasPublicOnlineStoreUrl(value?: string) {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && Boolean(url.hostname) && !url.pathname.includes("/admin");
  } catch {
    return false;
  }
}

export function isLiveShopifyProduct(product: Pick<GrowthAuditProduct, "status" | "onlineStoreUrl" | "publishedAt">) {
  // Unlisted products can still render by direct URL, but Shopify noindexes them and keeps them out of sitemap/search.
  return product.status === "ACTIVE" && hasPastPublishedAt(product.publishedAt) && hasPublicOnlineStoreUrl(product.onlineStoreUrl);
}

function liveWorkspaceProducts(products: Product[]) {
  return products.filter((product) => product.shopifyStatus === "PUBLISHED_LIVE");
}

function buildOptimizationTasks(products: GrowthProductScore[]): GrowthOptimizationTask[] {
  return products
    .flatMap((product) =>
      product.issues.map((issueItem) => {
        const writeBackScope = writeBackScopeForIssue(issueItem);
        return {
          key: `${product.product.id}-${issueItem.key}`,
          productId: product.product.id,
          productTitle: product.product.title,
          category: issueItem.category,
          priority: issueItem.severity,
          priorityScore: scoreIssuePriority(issueItem, product),
          effort: effortForIssue(issueItem),
          title: issueItem.label,
          whyItMatters: issueItem.detail,
          recommendedAction: issueItem.suggestedFix,
          expectedImpact: expectedImpactForIssue(issueItem),
          canWriteBack: product.product.source === "shopify" && canWriteBackIssue(issueItem),
          writeBackScope,
          targetUrl: product.product.onlineStoreUrl || product.product.adminUrl
        } satisfies GrowthOptimizationTask;
      })
    )
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, 24);
}

function scoreCollectionIssuePriority(issueItem: GrowthAuditIssue, collection: GrowthCollectionScore) {
  const severityScore = issueItem.severity === "high" ? 42 : issueItem.severity === "medium" ? 26 : 12;
  const categoryScore: Record<GrowthAuditIssueCategory, number> = {
    content: 18,
    schema: 14,
    image: 10,
    technical: 20,
    "search-console": 24,
    "ai-visibility": 18
  };
  const lowScoreBoost = collection.overallScore < 50 ? 16 : collection.overallScore < 70 ? 9 : 3;
  return clampScore(severityScore + categoryScore[issueItem.category] + lowScoreBoost);
}

function buildCollectionOptimizationTasks(collections: GrowthCollectionScore[]): GrowthOptimizationTask[] {
  return collections.flatMap((collection) =>
    collection.issues.map((issueItem) => ({
      key: `${collection.collection.id}-${issueItem.key}`,
      productId: collection.collection.id,
      productTitle: `${collection.collection.title} collection`,
      category: issueItem.category,
      priority: issueItem.severity,
      priorityScore: scoreCollectionIssuePriority(issueItem, collection),
      effort: effortForIssue(issueItem),
      title: issueItem.label,
      whyItMatters: issueItem.detail,
      recommendedAction: issueItem.suggestedFix,
      expectedImpact: expectedImpactForIssue(issueItem),
      canWriteBack: false,
      writeBackScope: [],
      targetUrl: collection.collection.onlineStoreUrl
    } satisfies GrowthOptimizationTask))
  );
}

function tokenSet(values: Array<string | undefined>) {
  return new Set(
    values
      .join(" ")
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, " ")
      .split(/\s+/)
      .map((token) => token.trim())
      .filter((token) => token.length > 2 && !["the", "and", "for", "with", "shop", "buy"].includes(token))
  );
}

function sharedTokenCount(left: Set<string>, right: Set<string>) {
  let count = 0;
  left.forEach((token) => {
    if (right.has(token)) count += 1;
  });
  return count;
}

function buildInternalLinkSuggestions(
  products: GrowthProductScore[],
  collections: GrowthCollectionScore[]
): GrowthInternalLinkSuggestion[] {
  const suggestions: GrowthInternalLinkSuggestion[] = [];
  const productTokens = products.map((product) => ({
    item: product,
    tokens: tokenSet([
      product.product.title,
      product.product.productType,
      product.product.handle,
      ...product.product.tags
    ])
  }));
  const collectionTokens = collections.map((collection) => ({
    item: collection,
    tokens: tokenSet([
      collection.collection.title,
      collection.collection.handle,
      collection.collection.descriptionText
    ])
  }));

  for (const productEntry of productTokens) {
    const bestCollection = collectionTokens
      .map((collectionEntry) => ({
        collection: collectionEntry.item,
        overlap: sharedTokenCount(productEntry.tokens, collectionEntry.tokens)
      }))
      .filter((match) => match.overlap > 0)
      .sort((a, b) => b.overlap - a.overlap)[0];

    if (bestCollection) {
      suggestions.push({
        key: `product-collection-${productEntry.item.product.id}-${bestCollection.collection.collection.id}`,
        sourceTitle: productEntry.item.product.title,
        sourceUrl: productEntry.item.product.onlineStoreUrl,
        targetTitle: bestCollection.collection.collection.title,
        targetUrl: bestCollection.collection.collection.onlineStoreUrl,
        linkType: "product_to_collection",
        anchorText: `Explore ${bestCollection.collection.collection.title}`,
        reason: "Linking a product to its closest collection helps Google understand category context and gives shoppers a path to related options.",
        priority: productEntry.item.overallScore < 60 || bestCollection.collection.overallScore < 60 ? "high" : "medium"
      });
    }
  }

  for (const collectionEntry of collectionTokens) {
    const bestProducts = productTokens
      .map((productEntry) => ({
        product: productEntry.item,
        overlap: sharedTokenCount(collectionEntry.tokens, productEntry.tokens)
      }))
      .filter((match) => match.overlap > 0)
      .sort((a, b) => b.overlap - a.overlap || a.product.overallScore - b.product.overallScore)
      .slice(0, 2);

    for (const match of bestProducts) {
      suggestions.push({
        key: `collection-product-${collectionEntry.item.collection.id}-${match.product.product.id}`,
        sourceTitle: collectionEntry.item.collection.title,
        sourceUrl: collectionEntry.item.collection.onlineStoreUrl,
        targetTitle: match.product.product.title,
        targetUrl: match.product.product.onlineStoreUrl,
        linkType: "collection_to_product",
        anchorText: `Shop ${match.product.product.title}`,
        reason: "Collection buying guides should link to priority live products so category authority flows into revenue pages.",
        priority: collectionEntry.item.overallScore < 65 ? "high" : "medium"
      });
    }
  }

  for (let index = 0; index < productTokens.length; index += 1) {
    for (let nextIndex = index + 1; nextIndex < productTokens.length; nextIndex += 1) {
      const left = productTokens[index];
      const right = productTokens[nextIndex];
      if (sharedTokenCount(left.tokens, right.tokens) < 2) continue;
      const weaker = left.item.overallScore <= right.item.overallScore ? left.item : right.item;
      const stronger = weaker === left.item ? right.item : left.item;
      suggestions.push({
        key: `product-product-${weaker.product.id}-${stronger.product.id}`,
        sourceTitle: weaker.product.title,
        sourceUrl: weaker.product.onlineStoreUrl,
        targetTitle: stronger.product.title,
        targetUrl: stronger.product.onlineStoreUrl,
        linkType: "product_to_product",
        anchorText: `Compare with ${stronger.product.title}`,
        reason: "Related product links support comparison intent and help shoppers move between similar options.",
        priority: "low"
      });
    }
  }

  const lowestProduct = products[0];
  if (lowestProduct) {
    suggestions.push({
      key: `blog-to-product-${lowestProduct.product.id}`,
      sourceTitle: "Buying guide or blog post",
      targetTitle: lowestProduct.product.title,
      targetUrl: lowestProduct.product.onlineStoreUrl,
      linkType: "blog_to_product",
      anchorText: `Best ${lowestProduct.product.productType || lowestProduct.product.title} options`,
      reason: "A buyer guide can target informational searches, answer comparison questions, and pass internal links to the product page.",
      priority: lowestProduct.overallScore < 60 ? "high" : "medium"
    });
  }

  const seen = new Set<string>();
  return suggestions
    .filter((suggestion) => {
      const fingerprint = `${suggestion.linkType}:${suggestion.sourceTitle}:${suggestion.targetTitle}`;
      if (seen.has(fingerprint)) return false;
      seen.add(fingerprint);
      return Boolean(suggestion.targetUrl || suggestion.linkType === "blog_to_product");
    })
    .sort((a, b) => {
      const priorityScore = { high: 3, medium: 2, low: 1 };
      return priorityScore[b.priority] - priorityScore[a.priority];
    })
    .slice(0, 12);
}

function countProductsWithIssue(products: GrowthProductScore[], key: string) {
  return products.filter((product) => product.issues.some((issueItem) => issueItem.key === key)).length;
}

function buildStoreOpportunities({
  scoredProducts,
  scoredCollections,
  internalLinkSuggestions,
  averageSeoScore,
  averageGeoScore,
  averageSchemaScore,
  averageImageSeoScore,
  averageCollectionSeoScore,
  averageTechnicalSeoScore,
  aiVisibilityScore
}: {
  scoredProducts: GrowthProductScore[];
  scoredCollections: GrowthCollectionScore[];
  internalLinkSuggestions: GrowthInternalLinkSuggestion[];
  averageSeoScore: number;
  averageGeoScore: number;
  averageSchemaScore: number;
  averageImageSeoScore: number;
  averageCollectionSeoScore: number;
  averageTechnicalSeoScore: number;
  aiVisibilityScore: number;
}): GrowthStoreOpportunity[] {
  const productCount = scoredProducts.length || 1;
  const thinDescriptions = countProductsWithIssue(scoredProducts, "thin-description");
  const metaDescriptionGaps = countProductsWithIssue(scoredProducts, "seo-description");
  const faqGaps = countProductsWithIssue(scoredProducts, "faq");
  const imageGaps = countProductsWithIssue(scoredProducts, "image-alt");
  const technicalGaps = countProductsWithIssue(scoredProducts, "technical-seo-health");
  const weakCollections = scoredCollections.filter((collection) => collection.overallScore < 70).length;

  return [
    {
      key: "query-to-page-refresh",
      title: "Search intent refresh queue",
      detail: `${metaDescriptionGaps} of ${productCount} products need stronger search snippets or query-led titles.`,
      benchmark: "Commercial SEO tools prioritize low CTR pages before broad rewrites.",
      recommendedAction: "Connect Search Console, then rewrite titles and meta descriptions around high-impression buyer queries.",
      impact: "ctr",
      status: averageSeoScore >= 80 ? "ready" : averageSeoScore >= 55 ? "partial" : "needs-setup"
    },
    {
      key: "faq-and-answer-engine-rollout",
      title: "Answer-engine content rollout",
      detail: `${faqGaps} of ${productCount} products need buyer questions, use cases, or comparison context.`,
      benchmark: "GEO products focus on answer blocks, sourceable facts, and comparison-ready copy.",
      recommendedAction: "Generate FAQ, best-for, why-choose, and comparison sections for weak products before writing back.",
      impact: "ai-visibility",
      status: averageGeoScore >= 80 ? "ready" : averageGeoScore >= 55 ? "partial" : "needs-setup"
    },
    {
      key: "collection-authority-system",
      title: "Collection authority system",
      detail: `${weakCollections} live collections need stronger category copy, FAQs, image context, or internal links.`,
      benchmark: "Commercial Shopify SEO tools treat collection pages as category landing pages, not just product grids.",
      recommendedAction: "Create collection buying guides, link them to priority products, and use category FAQs for long-tail searches.",
      impact: "traffic",
      status: averageCollectionSeoScore >= 80 ? "ready" : averageCollectionSeoScore >= 55 ? "partial" : "needs-setup"
    },
    {
      key: "internal-linking-map",
      title: "Internal linking map",
      detail: `${internalLinkSuggestions.length} product, collection, or blog link opportunities are available for review.`,
      benchmark: "Mature SEO workflows recommend links from category and informational pages into revenue pages.",
      recommendedAction: "Add descriptive anchors between matching products, collections, and buyer guides before broader content production.",
      impact: "technical",
      status: internalLinkSuggestions.length >= 6 ? "ready" : internalLinkSuggestions.length ? "partial" : "needs-setup"
    },
    {
      key: "rich-result-readiness",
      title: "Product rich-result readiness",
      detail: `${faqGaps || thinDescriptions} products are missing fields that help Product and FAQ schema become useful.`,
      benchmark: "Shopify SEO apps commonly surface JSON-LD, FAQ, and review readiness as a core trust feature.",
      recommendedAction: "Complete title, offer, image, FAQ, review readiness, and policy context before expecting rich snippets.",
      impact: "rich-results",
      status: averageSchemaScore >= 80 ? "ready" : averageSchemaScore >= 55 ? "partial" : "needs-setup"
    },
    {
      key: "image-search-system",
      title: "Image SEO batch system",
      detail: `${imageGaps} products need stronger alt text, media order, image sizing, or descriptive filename guidance.`,
      benchmark: "Image optimization apps combine alt text, compression, naming, and product media ordering.",
      recommendedAction: "Generate image alt text from product attributes and keep lifestyle first with white-background last.",
      impact: "traffic",
      status: averageImageSeoScore >= 80 ? "ready" : averageImageSeoScore >= 55 ? "partial" : "needs-setup"
    },
    {
      key: "technical-crawl-control",
      title: "Technical crawl control",
      detail: `${technicalGaps} products need better handles, canonical URLs, sitemap readiness, or broken-link checks.`,
      benchmark: "Mature SEO suites expose crawl health because rankings fail when pages are duplicated or unreachable.",
      recommendedAction: "Run the live crawler, fix redirects and 404s, and keep one canonical store domain.",
      impact: "technical",
      status: averageTechnicalSeoScore >= 80 ? "ready" : averageTechnicalSeoScore >= 55 ? "partial" : "needs-setup"
    },
    {
      key: "ai-visibility-monitoring",
      title: "AI visibility watchlist",
      detail: `Current AI visibility readiness is ${aiVisibilityScore || 0}/100 across audited products.`,
      benchmark: "New GEO platforms track whether brands and pages are mentioned by AI answer engines.",
      recommendedAction: "Create brand/product prompts, monitor citations, then add missing facts and comparison pages.",
      impact: "ai-visibility",
      status: aiVisibilityScore >= 80 ? "ready" : aiVisibilityScore >= 55 ? "partial" : "needs-setup"
    }
  ];
}

function summarizeAudit({
  products,
  collections = [],
  source,
  storeName,
  shopDomain,
  primaryDomain,
  excludedProductCount,
  error
}: {
  products: GrowthAuditProduct[];
  collections?: GrowthAuditCollection[];
  source: AuditSource;
  storeName?: string;
  shopDomain?: string;
  primaryDomain?: string;
  excludedProductCount?: number;
  error?: string;
}): GrowthAuditResult {
  const scoredProducts = products.map(scoreGrowthProduct).sort((a, b) => a.overallScore - b.overallScore);
  const scoredCollections = collections.map(scoreGrowthCollection).sort((a, b) => a.overallScore - b.overallScore);
  const productCount = scoredProducts.length;
  const averageSeoScore = averageScore(scoredProducts, (item) => item.seoScore);
  const averageGeoScore = averageScore(scoredProducts, (item) => item.geoScore);
  const averageSchemaScore = averageScore(scoredProducts, (item) => item.schemaScore);
  const averageImageSeoScore = averageScore(scoredProducts, (item) => item.imageSeoScore);
  const averageTechnicalSeoScore = averageScore(scoredProducts, (item) => item.technicalSeoScore);
  const averageCollectionSeoScore = averageCollectionScore(scoredCollections, (item) => item.overallScore);
  const aiVisibilityScore = averageScore(scoredProducts, (item) => item.aiVisibilityScore);
  const internalLinkSuggestions = buildInternalLinkSuggestions(scoredProducts, scoredCollections);
  const highPriorityIssueCount = scoredProducts.reduce(
    (sum, item) => sum + item.issues.filter((issueItem) => issueItem.severity === "high").length,
    0
  ) + scoredCollections.reduce(
    (sum, item) => sum + item.issues.filter((issueItem) => issueItem.severity === "high").length,
    0
  );
  const capabilities = buildCapabilities({
    scoredProducts,
    scoredCollections,
    averageSchemaScore,
    averageImageSeoScore,
    averageTechnicalSeoScore,
    averageCollectionSeoScore,
    aiVisibilityScore,
    internalLinkSuggestions,
    primaryDomain
  });
  const optimizationTasks = [
    ...buildOptimizationTasks(scoredProducts),
    ...buildCollectionOptimizationTasks(scoredCollections)
  ]
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, 28);
  const storeOpportunities = buildStoreOpportunities({
    scoredProducts,
    scoredCollections,
    internalLinkSuggestions,
    averageSeoScore,
    averageGeoScore,
    averageSchemaScore,
    averageImageSeoScore,
    averageCollectionSeoScore,
    averageTechnicalSeoScore,
    aiVisibilityScore
  });

  return {
    storeName,
    shopDomain,
    primaryDomain,
    productCount,
    averageSeoScore,
    averageGeoScore,
    averageSchemaScore,
    averageImageSeoScore,
    averageTechnicalSeoScore,
    averageCollectionSeoScore,
    aiVisibilityScore,
    highPriorityIssueCount,
    excludedProductCount: excludedProductCount ?? 0,
    capabilities,
    optimizationTasks,
    storeOpportunities,
    products: scoredProducts,
    collections: scoredCollections,
    internalLinkSuggestions,
    source,
    error
  };
}

export async function getGrowthAudit({
  connection,
  workspaceProducts
}: {
  connection?: ShopifyConnection;
  workspaceProducts: Product[];
}) {
  if (connection?.isActive && connection.adminAccessToken) {
    try {
      const [shopify, collections] = await Promise.all([
        fetchShopifyProducts(connection),
        fetchShopifyCollections(connection)
      ]);
      if (shopify.products.length) {
        return summarizeAudit({
          ...shopify,
          products: shopify.products,
          collections,
          source: "shopify",
          excludedProductCount: shopify.excludedProductCount
        });
      }
      return summarizeAudit({
        ...shopify,
        products: [],
        collections,
        source: "shopify",
        excludedProductCount: shopify.excludedProductCount
      });
    } catch (error) {
      const liveProducts = liveWorkspaceProducts(workspaceProducts);
      return summarizeAudit({
        products: liveProducts.map(mapWorkspaceProduct),
        source: "workspace",
        shopDomain: connection.shopDomain,
        excludedProductCount: workspaceProducts.length - liveProducts.length,
        error: error instanceof Error ? error.message : "Could not load Shopify products."
      });
    }
  }

  const liveProducts = liveWorkspaceProducts(workspaceProducts);
  return summarizeAudit({
    products: liveProducts.map(mapWorkspaceProduct),
    source: "workspace",
    shopDomain: connection?.shopDomain,
    excludedProductCount: workspaceProducts.length - liveProducts.length
  });
}
