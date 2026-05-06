import "server-only";
import type { Product, ShopifyConnection } from "@/lib/types";

const SHOPIFY_API_VERSION = "2026-04";

type IssueSeverity = "high" | "medium" | "low";
type AuditSource = "shopify" | "workspace";

export type GrowthAuditIssue = {
  key: string;
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
  imageCount: number;
  imagesWithAlt: number;
  faqCount: number;
  updatedAt?: string;
};

export type GrowthAuditResult = {
  storeName?: string;
  shopDomain?: string;
  primaryDomain?: string;
  productCount: number;
  averageSeoScore: number;
  averageGeoScore: number;
  highPriorityIssueCount: number;
  products: GrowthProductScore[];
  source: AuditSource;
  error?: string;
};

export type GrowthProductScore = {
  product: GrowthAuditProduct;
  seoScore: number;
  geoScore: number;
  overallScore: number;
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
        }>;
      };
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
  severity: IssueSeverity,
  label: string,
  detail: string,
  suggestedFix: string
): GrowthAuditIssue {
  return { key, severity, label, detail, suggestedFix };
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
      <h3>Common buyer questions</h3>
      <h4>Who is this product best for?</h4>
      <p>This product is suited for shoppers comparing similar options and looking for clear details before purchase.</p>
      <h4>What should shoppers know before buying?</h4>
      <p>Review the product features, use case, sizing or compatibility details, and store policies before checkout.</p>
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

function imageAltRatio(product: GrowthAuditProduct) {
  if (!product.imageCount) return 0;
  return product.imagesWithAlt / product.imageCount;
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
      "low",
      "Add trust context",
      "Product pages often perform better when they answer basic buying-confidence questions.",
      "Add relevant shipping, returns, support, care, or guarantee context if available."
    ));
  }

  const finalSeoScore = clampScore(seoScore);
  const finalGeoScore = clampScore(geoScore);

  return {
    product,
    seoScore: finalSeoScore,
    geoScore: finalGeoScore,
    overallScore: clampScore((finalSeoScore + finalGeoScore) / 2),
    issues,
    strengths: strengths.slice(0, 3),
    suggestedFix: buildSuggestedFix(product)
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
  products: GrowthAuditProduct[];
}> {
  if (!connection.shopDomain || !connection.adminAccessToken) {
    return { products: [] };
  }

  const data = await shopifyGraphQL<ShopifyProductsPayload>({
    shopDomain: connection.shopDomain,
    accessToken: connection.adminAccessToken,
    query: `
      query GrowthAuditProducts($first: Int!) {
        shop {
          name
          myshopifyDomain
          primaryDomain {
            url
            host
          }
        }
        products(first: $first, sortKey: UPDATED_AT, reverse: true) {
          nodes {
            id
            title
            handle
            status
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
              }
            }
          }
        }
      }
    `,
    variables: { first: 50 }
  });

  const shopDomain = data?.shop.myshopifyDomain || connection.shopDomain;
  return {
    storeName: data?.shop.name,
    shopDomain,
    primaryDomain: data?.shop.primaryDomain?.url || data?.shop.primaryDomain?.host,
    products: (data?.products.nodes ?? []).map((product) => {
      const images = product.images?.nodes ?? [];
      return {
        id: product.id,
        title: product.title || "Untitled Shopify product",
        handle: product.handle,
        status: product.status,
        source: "shopify",
        adminUrl: shopifyAdminProductUrl(shopDomain, product.id),
        productType: product.productType,
        tags: product.tags ?? [],
        descriptionText: stripHtml(product.descriptionHtml),
        seoTitle: product.seo?.title || product.title,
        seoDescription: product.seo?.description || "",
        imageCount: images.length,
        imagesWithAlt: images.filter((image) => Boolean(image.altText?.trim())).length,
        faqCount: estimateFaqCountFromHtml(product.descriptionHtml),
        updatedAt: product.updatedAt
      };
    })
  };
}

function summarizeAudit({
  products,
  source,
  storeName,
  shopDomain,
  primaryDomain,
  error
}: {
  products: GrowthAuditProduct[];
  source: AuditSource;
  storeName?: string;
  shopDomain?: string;
  primaryDomain?: string;
  error?: string;
}): GrowthAuditResult {
  const scoredProducts = products.map(scoreGrowthProduct).sort((a, b) => a.overallScore - b.overallScore);
  const productCount = scoredProducts.length;
  const averageSeoScore = productCount
    ? clampScore(scoredProducts.reduce((sum, item) => sum + item.seoScore, 0) / productCount)
    : 0;
  const averageGeoScore = productCount
    ? clampScore(scoredProducts.reduce((sum, item) => sum + item.geoScore, 0) / productCount)
    : 0;
  const highPriorityIssueCount = scoredProducts.reduce(
    (sum, item) => sum + item.issues.filter((issueItem) => issueItem.severity === "high").length,
    0
  );

  return {
    storeName,
    shopDomain,
    primaryDomain,
    productCount,
    averageSeoScore,
    averageGeoScore,
    highPriorityIssueCount,
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
          source: "shopify"
        });
      }
    } catch (error) {
      return summarizeAudit({
        products: workspaceProducts.map(mapWorkspaceProduct),
        source: "workspace",
        shopDomain: connection.shopDomain,
        error: error instanceof Error ? error.message : "Could not load Shopify products."
      });
    }
  }

  return summarizeAudit({
    products: workspaceProducts.map(mapWorkspaceProduct),
    source: "workspace",
    shopDomain: connection?.shopDomain
  });
}
