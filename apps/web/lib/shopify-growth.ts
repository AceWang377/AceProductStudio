import "server-only";
import {
  buildGrowthSuggestedFix,
  isLiveShopifyProduct,
  scoreGrowthProduct,
  type GrowthAuditProduct
} from "@/lib/growth-audit";
import {
  buildGrowthRewritePlan,
  type GrowthRewriteDraft
} from "@/lib/growth-rewrite-plan";
import {
  buildGrowthFixPlan,
  type GrowthFixField,
  type GrowthFixOverrides
} from "@/lib/growth-fix-plan";
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

type ShopifyGrowthProduct = NonNullable<ShopifyProductPayload["product"]>;

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

function assertGrowthWriteBackInput({
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
}

async function fetchShopifyGrowthProduct({
  connection,
  productId
}: {
  connection: ShopifyConnection;
  productId: string;
}): Promise<ShopifyGrowthProduct> {
  assertGrowthWriteBackInput({ connection, productId });
  const data = await shopifyGraphQL<ShopifyProductPayload>({
    shopDomain: connection.shopDomain!,
    accessToken: connection.adminAccessToken!,
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

  return product;
}

function shopifyProductToAuditProduct(product: ShopifyGrowthProduct): GrowthAuditProduct {
  return {
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
}

async function updateShopifyGrowthProduct({
  connection,
  product
}: {
  connection: ShopifyConnection;
  product: Record<string, unknown>;
}) {
  const updated = await shopifyGraphQL<ProductUpdatePayload>({
    shopDomain: connection.shopDomain!,
    accessToken: connection.adminAccessToken!,
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
    variables: { product }
  });

  const result = updated?.productUpdate;
  const userErrors = result?.userErrors ?? [];
  if (userErrors.length) {
    throw new Error(userErrors.map((error) => error.message).join("; "));
  }
  return result?.product ?? null;
}

export async function previewGrowthRewriteForShopify({
  connection,
  productId,
  rewrite
}: {
  connection: ShopifyConnection;
  productId: string;
  rewrite: GrowthRewriteDraft;
}) {
  const product = await fetchShopifyGrowthProduct({ connection, productId });
  const auditProduct = shopifyProductToAuditProduct(product);
  const beforeScore = scoreGrowthProduct(auditProduct);
  const plan = buildGrowthRewritePlan({
    product: {
      id: product.id,
      title: product.title,
      seoTitle: product.seo?.title,
      seoDescription: product.seo?.description,
      descriptionHtml: product.descriptionHtml
    },
    rewrite
  });

  return {
    productId: product.id,
    title: product.title,
    handle: product.handle,
    onlineStoreUrl: product.onlineStoreUrl,
    beforeScore: beforeScore.overallScore,
    after: {
      seoTitle: plan.changes.seo?.title ?? product.seo?.title ?? product.title,
      seoDescription: plan.changes.seo?.description ?? product.seo?.description ?? "",
      descriptionAppended: plan.descriptionAppended
    },
    plan
  };
}

export async function previewGrowthFixForShopify({
  connection,
  productId,
  selectedFields,
  overrides
}: {
  connection: ShopifyConnection;
  productId: string;
  selectedFields?: GrowthFixField[];
  overrides?: GrowthFixOverrides;
}) {
  const product = await fetchShopifyGrowthProduct({ connection, productId });
  const auditProduct = shopifyProductToAuditProduct(product);
  const beforeScore = scoreGrowthProduct(auditProduct);
  const suggestedFix = buildGrowthSuggestedFix(auditProduct);
  const plan = buildGrowthFixPlan({
    product: {
      id: product.id,
      title: product.title,
      seoTitle: product.seo?.title,
      seoDescription: product.seo?.description,
      tags: product.tags,
      descriptionHtml: product.descriptionHtml
    },
    suggestedFix,
    selectedFields,
    overrides
  });

  return {
    productId: product.id,
    title: product.title,
    handle: product.handle,
    onlineStoreUrl: product.onlineStoreUrl,
    beforeScore: beforeScore.overallScore,
    after: {
      seoTitle: plan.changes.seo?.title ?? product.seo?.title ?? product.title,
      seoDescription: plan.changes.seo?.description ?? product.seo?.description ?? "",
      tags: plan.changes.tags ?? product.tags ?? [],
      descriptionAppended: plan.descriptionAppended
    },
    plan
  };
}

export async function applyGrowthRewriteToShopify({
  connection,
  productId,
  rewrite
}: {
  connection: ShopifyConnection;
  productId: string;
  rewrite: GrowthRewriteDraft;
}) {
  const preview = await previewGrowthRewriteForShopify({ connection, productId, rewrite });
  if (!preview.plan.hasChanges) {
    throw new Error("This Search Console rewrite is already applied to Shopify.");
  }

  const productUpdate: Record<string, unknown> = { id: preview.productId };
  if (preview.plan.changes.descriptionHtml) {
    productUpdate.descriptionHtml = preview.plan.changes.descriptionHtml;
  }
  if (preview.plan.changes.seo) {
    productUpdate.seo = preview.plan.changes.seo;
  }

  const result = await updateShopifyGrowthProduct({ connection, product: productUpdate });

  return {
    productId: preview.productId,
    handle: result?.handle ?? preview.handle,
    onlineStoreUrl: preview.onlineStoreUrl,
    beforeScore: preview.beforeScore,
    applied: {
      rewrite: {
        seoTitle: preview.after.seoTitle,
        seoDescription: preview.after.seoDescription,
        descriptionAppended: preview.plan.descriptionAppended
      },
      changedFields: preview.plan.summary
    },
    diff: preview.plan.diff
  };
}

export async function applyGrowthFixToShopify({
  connection,
  productId,
  selectedFields,
  overrides
}: {
  connection: ShopifyConnection;
  productId: string;
  selectedFields?: GrowthFixField[];
  overrides?: GrowthFixOverrides;
}) {
  const preview = await previewGrowthFixForShopify({ connection, productId, selectedFields, overrides });
  if (!preview.plan.hasChanges) {
    throw new Error("The suggested SEO/GEO fixes are already applied to Shopify.");
  }

  const productUpdate: Record<string, unknown> = { id: preview.productId };
  if (preview.plan.changes.descriptionHtml) productUpdate.descriptionHtml = preview.plan.changes.descriptionHtml;
  if (preview.plan.changes.tags) productUpdate.tags = preview.plan.changes.tags;
  if (preview.plan.changes.seo) productUpdate.seo = preview.plan.changes.seo;

  const result = await updateShopifyGrowthProduct({ connection, product: productUpdate });

  return {
    productId: preview.productId,
    handle: result?.handle ?? preview.handle,
    onlineStoreUrl: preview.onlineStoreUrl,
    beforeScore: preview.beforeScore,
    applied: {
      seoTitle: preview.after.seoTitle,
      seoDescription: preview.after.seoDescription,
      tags: preview.after.tags,
      descriptionAppended: preview.plan.descriptionAppended,
      changedFields: preview.plan.summary
    },
    diff: preview.plan.diff
  };
}
