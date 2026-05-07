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

export type GrowthAuditCapability = {
  key: "schema" | "image-seo" | "technical-seo" | "search-console" | "ai-visibility";
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
  aiVisibilityScore: number;
  highPriorityIssueCount: number;
  excludedProductCount: number;
  capabilities: GrowthAuditCapability[];
  optimizationTasks: GrowthOptimizationTask[];
  storeOpportunities: GrowthStoreOpportunity[];
  products: GrowthProductScore[];
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
  overallScore: number;
  intentStage: GrowthIntentStage;
  snippetPreview: GrowthSnippetPreview;
  issues: GrowthAuditIssue[];
  strengths: string[];
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

function statusFromScore(score: number): GrowthCapabilityStatus {
  if (score >= 75) return "ready";
  if (score >= 45) return "partial";
  return "needs-setup";
}

function averageScore(products: GrowthProductScore[], getScore: (product: GrowthProductScore) => number) {
  if (!products.length) return 0;
  return clampScore(products.reduce((sum, product) => sum + getScore(product), 0) / products.length);
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
  averageSchemaScore,
  averageImageSeoScore,
  averageTechnicalSeoScore,
  aiVisibilityScore,
  primaryDomain
}: {
  scoredProducts: GrowthProductScore[];
  averageSchemaScore: number;
  averageImageSeoScore: number;
  averageTechnicalSeoScore: number;
  aiVisibilityScore: number;
  primaryDomain?: string;
}): GrowthAuditCapability[] {
  const searchConsoleConfigured = hasSearchConsoleConfig();
  const aiVisibilityConfigured = hasAiVisibilityConfig();
  const productsWithFaq = scoredProducts.filter((product) => product.product.faqCount >= 2).length;

  return [
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
  const aiVisibilityScore = scoreAiVisibilityReadiness(product);

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
    overallScore,
    intentStage: inferIntentStage(product),
    snippetPreview: buildSnippetPreview(product, suggestedFix),
    issues,
    strengths: strengths.slice(0, 3),
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
    primaryDomain: data?.shop.primaryDomain?.url || data?.shop.primaryDomain?.host,
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

function countProductsWithIssue(products: GrowthProductScore[], key: string) {
  return products.filter((product) => product.issues.some((issueItem) => issueItem.key === key)).length;
}

function buildStoreOpportunities({
  scoredProducts,
  averageSeoScore,
  averageGeoScore,
  averageSchemaScore,
  averageImageSeoScore,
  averageTechnicalSeoScore,
  aiVisibilityScore
}: {
  scoredProducts: GrowthProductScore[];
  averageSeoScore: number;
  averageGeoScore: number;
  averageSchemaScore: number;
  averageImageSeoScore: number;
  averageTechnicalSeoScore: number;
  aiVisibilityScore: number;
}): GrowthStoreOpportunity[] {
  const productCount = scoredProducts.length || 1;
  const thinDescriptions = countProductsWithIssue(scoredProducts, "thin-description");
  const metaDescriptionGaps = countProductsWithIssue(scoredProducts, "seo-description");
  const faqGaps = countProductsWithIssue(scoredProducts, "faq");
  const imageGaps = countProductsWithIssue(scoredProducts, "image-alt");
  const technicalGaps = countProductsWithIssue(scoredProducts, "technical-seo-health");

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
  source,
  storeName,
  shopDomain,
  primaryDomain,
  excludedProductCount,
  error
}: {
  products: GrowthAuditProduct[];
  source: AuditSource;
  storeName?: string;
  shopDomain?: string;
  primaryDomain?: string;
  excludedProductCount?: number;
  error?: string;
}): GrowthAuditResult {
  const scoredProducts = products.map(scoreGrowthProduct).sort((a, b) => a.overallScore - b.overallScore);
  const productCount = scoredProducts.length;
  const averageSeoScore = averageScore(scoredProducts, (item) => item.seoScore);
  const averageGeoScore = averageScore(scoredProducts, (item) => item.geoScore);
  const averageSchemaScore = averageScore(scoredProducts, (item) => item.schemaScore);
  const averageImageSeoScore = averageScore(scoredProducts, (item) => item.imageSeoScore);
  const averageTechnicalSeoScore = averageScore(scoredProducts, (item) => item.technicalSeoScore);
  const aiVisibilityScore = averageScore(scoredProducts, (item) => item.aiVisibilityScore);
  const highPriorityIssueCount = scoredProducts.reduce(
    (sum, item) => sum + item.issues.filter((issueItem) => issueItem.severity === "high").length,
    0
  );
  const capabilities = buildCapabilities({
    scoredProducts,
    averageSchemaScore,
    averageImageSeoScore,
    averageTechnicalSeoScore,
    aiVisibilityScore,
    primaryDomain
  });
  const optimizationTasks = buildOptimizationTasks(scoredProducts);
  const storeOpportunities = buildStoreOpportunities({
    scoredProducts,
    averageSeoScore,
    averageGeoScore,
    averageSchemaScore,
    averageImageSeoScore,
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
    aiVisibilityScore,
    highPriorityIssueCount,
    excludedProductCount: excludedProductCount ?? 0,
    capabilities,
    optimizationTasks,
    storeOpportunities,
    products: scoredProducts,
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
      const shopify = await fetchShopifyProducts(connection);
      if (shopify.products.length) {
        return summarizeAudit({
          ...shopify,
          products: shopify.products,
          source: "shopify",
          excludedProductCount: shopify.excludedProductCount
        });
      }
      return summarizeAudit({
        ...shopify,
        products: [],
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
