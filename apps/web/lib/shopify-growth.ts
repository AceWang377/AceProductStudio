import "server-only";
import {
  buildGrowthSuggestedFix,
  isLiveShopifyProduct,
  scoreGrowthProduct,
  type GrowthAuditProduct
} from "@/lib/growth-audit";
import type { ShopifyConnection } from "@/lib/types";

const SHOPIFY_API_VERSION = "2026-04";

type ShopifyGraphQLResponse<T> = {
  data?: T;
  errors?: Array<{ message: string }>;
};

type ShopifyProductPayload = {
  product: {
    id: string;
    title: string;
    handle?: string;
    status?: string;
    descriptionHtml?: string;
    productType?: string;
    tags?: string[];
    seo?: {
      title?: string | null;
      description?: string | null;
    } | null;
    images?: {
      nodes: Array<{ url?: string; altText?: string | null; width?: number | null; height?: number | null }>;
    };
    onlineStoreUrl?: string | null;
    publishedAt?: string | null;
  } | null;
};

type ProductUpdatePayload = {
  productUpdate: {
    product: {
      id: string;
      title: string;
      handle?: string;
      seo?: {
        title?: string | null;
        description?: string | null;
      } | null;
      tags?: string[];
    } | null;
    userErrors: Array<{ field?: string[]; message: string }>;
  };
};

async function shopifyGraphQL<T>({
  shopDomain,
  accessToken,
  query,
  variables
}: {
  shopDomain: string;
  accessToken: string;
  query: string;
  variables: Record<string, unknown>;
}) {
  const response = await fetch(`https://${shopDomain}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": accessToken
    },
    body: JSON.stringify({ query, variables }),
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

function stripHtml(value?: string) {
  return (value ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function countFaq(value?: string) {
  const text = stripHtml(value);
  return Math.min(text.match(/\?/g)?.length ?? 0, 6);
}

export async function applyGrowthFixToShopify({
  connection,
  productId
}: {
  connection: ShopifyConnection;
  productId: string;
}) {
  if (!connection.shopDomain || !connection.adminAccessToken) {
    throw new Error("Connect Shopify with OAuth before applying Growth Studio fixes.");
  }
  if (!productId.startsWith("gid://shopify/Product/")) {
    throw new Error("Growth fixes can only be applied to live Shopify products.");
  }

  const data = await shopifyGraphQL<ShopifyProductPayload>({
    shopDomain: connection.shopDomain,
    accessToken: connection.adminAccessToken,
    query: `
      query GrowthProduct($id: ID!) {
        product(id: $id) {
          id
          title
          handle
          status
          publishedAt
          descriptionHtml
          productType
          tags
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
    `,
    variables: { id: productId }
  });

  const product = data?.product;
  if (!product) throw new Error("Shopify product was not found.");
  if (
    !isLiveShopifyProduct({
      status: product.status,
      onlineStoreUrl: product.onlineStoreUrl || undefined,
      publishedAt: product.publishedAt
    })
  ) {
    throw new Error("Growth Studio only applies SEO/GEO fixes to live, listed Shopify products.");
  }

  const auditProduct: GrowthAuditProduct = {
    id: product.id,
    title: product.title,
    handle: product.handle,
    status: product.status,
    source: "shopify",
    productType: product.productType,
    tags: product.tags ?? [],
    descriptionText: stripHtml(product.descriptionHtml),
    seoTitle: product.seo?.title || product.title,
    seoDescription: product.seo?.description || "",
    onlineStoreUrl: product.onlineStoreUrl || undefined,
    publishedAt: product.publishedAt ?? null,
    imageCount: product.images?.nodes.length ?? 0,
    imagesWithAlt: product.images?.nodes.filter((image) => Boolean(image.altText?.trim())).length ?? 0,
    images: product.images?.nodes.map((image) => ({
      url: image.url,
      altText: image.altText,
      width: image.width,
      height: image.height
    })) ?? [],
    faqCount: countFaq(product.descriptionHtml)
  };
  const beforeScore = scoreGrowthProduct(auditProduct);
  const suggestedFix = buildGrowthSuggestedFix(auditProduct);
  const currentDescription = product.descriptionHtml || "";
  const alreadyApplied = currentDescription.includes("Product details for search and AI discovery");
  const nextDescription = alreadyApplied
    ? currentDescription
    : `${currentDescription}${currentDescription ? "\n" : ""}${suggestedFix.descriptionAppendHtml}`;

  const updated = await shopifyGraphQL<ProductUpdatePayload>({
    shopDomain: connection.shopDomain,
    accessToken: connection.adminAccessToken,
    query: `
      mutation GrowthProductUpdate($product: ProductUpdateInput!) {
        productUpdate(product: $product) {
          product {
            id
            title
            handle
            tags
            seo {
              title
              description
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `,
    variables: {
      product: {
        id: product.id,
        descriptionHtml: nextDescription,
        tags: suggestedFix.tags,
        seo: {
          title: suggestedFix.seoTitle,
          description: suggestedFix.seoDescription
        }
      }
    }
  });

  const result = updated?.productUpdate;
  const userErrors = result?.userErrors ?? [];
  if (userErrors.length) {
    throw new Error(userErrors.map((error) => error.message).join("; "));
  }

  return {
    productId: product.id,
    handle: result?.product?.handle,
    beforeScore: beforeScore.overallScore,
    applied: {
      seoTitle: suggestedFix.seoTitle,
      seoDescription: suggestedFix.seoDescription,
      tags: suggestedFix.tags,
      descriptionAppended: !alreadyApplied
    }
  };
}
