import "server-only";
import {
  buildGrowthCollectionSuggestedFix,
  buildGrowthSuggestedFix,
  isLiveShopifyProduct,
  scoreGrowthCollection,
  scoreGrowthProduct,
  type GrowthAuditCollection,
  type GrowthAuditProduct
} from "@/lib/growth-audit";
import {
  buildGrowthCollectionFixPlan,
  type GrowthCollectionFixField,
  type GrowthCollectionFixOverrides
} from "@/lib/growth-collection-fix-plan";
import {
  buildGrowthRewritePlan,
  type GrowthRewriteDraft
} from "@/lib/growth-rewrite-plan";
import {
  buildGrowthImageAltPlan,
  type GrowthImageAltProduct
} from "@/lib/growth-image-alt-plan";
import {
  buildGrowthInternalLinkPlan,
  type GrowthInternalLinkSuggestionInput
} from "@/lib/growth-internal-link-plan";
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
    media?: {
      nodes: Array<{
        id: string;
        alt?: string | null;
        mediaContentType?: string;
        image?: {
          url?: string;
          width?: number | null;
          height?: number | null;
        } | null;
      }>;
    };
    onlineStoreUrl?: string | null;
    publishedAt?: string | null;
  } | null;
};

type ShopifyCollectionPayload = {
  shop: {
    primaryDomain?: {
      url?: string;
      host?: string;
    } | null;
  };
  collection: {
    id: string;
    title: string;
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

type CollectionUpdatePayload = {
  collectionUpdate: {
    collection: {
      id: string;
      handle?: string;
      seo?: {
        title?: string | null;
        description?: string | null;
      } | null;
    } | null;
    userErrors: Array<{ field?: string[]; message: string }>;
  };
};

type FileUpdatePayload = {
  fileUpdate: {
    files: Array<{
      id: string;
      alt?: string | null;
    }>;
    userErrors: Array<{ field?: string[]; message: string }>;
  };
};

type ProductUpdateMediaPayload = {
  productUpdateMedia: {
    media: Array<{
      id: string;
      alt?: string | null;
    }> | null;
    mediaUserErrors: Array<{ field?: string[]; message: string }>;
  };
};

type ShopifyGrowthProduct = NonNullable<ShopifyProductPayload["product"]>;
type ShopifyGrowthCollection = NonNullable<ShopifyCollectionPayload["collection"]> & {
  onlineStoreUrl?: string;
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

function assertGrowthCollectionWriteBackInput({
  connection,
  collectionId
}: {
  connection: ShopifyConnection;
  collectionId: string;
}) {
  if (!connection.shopDomain || !connection.adminAccessToken) {
    throw new Error("Connect Shopify with OAuth before applying collection Growth Studio fixes.");
  }
  if (!collectionId.startsWith("gid://shopify/Collection/")) {
    throw new Error("Growth fixes can only be applied to live Shopify collections.");
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
          media(first: 10) {
            nodes {
              id
              alt
              mediaContentType
              ... on MediaImage {
                image {
                  url
                  width
                  height
                }
              }
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

function collectionOnlineStoreUrl({
  primaryDomain,
  handle
}: {
  primaryDomain?: ShopifyCollectionPayload["shop"]["primaryDomain"];
  handle?: string;
}) {
  const base = primaryDomain?.url || (primaryDomain?.host ? `https://${primaryDomain.host}` : undefined);
  if (!base || !handle) return undefined;
  try {
    return new URL(`/collections/${handle}`, base).toString();
  } catch {
    return undefined;
  }
}

async function fetchShopifyGrowthCollection({
  connection,
  collectionId
}: {
  connection: ShopifyConnection;
  collectionId: string;
}): Promise<ShopifyGrowthCollection> {
  assertGrowthCollectionWriteBackInput({ connection, collectionId });
  const data = await shopifyGraphQL<ShopifyCollectionPayload>({
    shopDomain: connection.shopDomain!,
    accessToken: connection.adminAccessToken!,
    query: `
      query GrowthCollection($id: ID!) {
        shop {
          primaryDomain {
            url
            host
          }
        }
        collection(id: $id) {
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
    `,
    variables: { id: collectionId }
  });

  const collection = data?.collection;
  if (!collection) throw new Error("Shopify collection was not found.");
  const onlineStoreUrl = collectionOnlineStoreUrl({
    primaryDomain: data?.shop.primaryDomain,
    handle: collection.handle
  });
  if (!onlineStoreUrl || Number(collection.availablePublicationsCount?.count ?? 0) <= 0) {
    throw new Error("Growth Studio only applies SEO/GEO fixes to live, listed Shopify collections.");
  }

  return {
    ...collection,
    onlineStoreUrl
  };
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

function shopifyCollectionToAuditCollection(collection: ShopifyGrowthCollection): GrowthAuditCollection {
  return {
    id: collection.id,
    title: collection.title,
    handle: collection.handle,
    source: "shopify",
    descriptionText: stripHtml(collection.descriptionHtml),
    seoTitle: collection.seo?.title || collection.title,
    seoDescription: collection.seo?.description || "",
    onlineStoreUrl: collection.onlineStoreUrl,
    image: collection.image?.url
      ? {
        url: collection.image.url,
        altText: collection.image.altText,
        width: collection.image.width,
        height: collection.image.height
      }
      : undefined,
    updatedAt: collection.updatedAt
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

async function updateShopifyGrowthCollection({
  connection,
  collection
}: {
  connection: ShopifyConnection;
  collection: Record<string, unknown>;
}) {
  const updated = await shopifyGraphQL<CollectionUpdatePayload>({
    shopDomain: connection.shopDomain!,
    accessToken: connection.adminAccessToken!,
    query: `
      mutation GrowthCollectionUpdate($input: CollectionInput!) {
        collectionUpdate(input: $input) {
          collection {
            id
            handle
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
    variables: { input: collection }
  });

  const result = updated?.collectionUpdate;
  const userErrors = result?.userErrors ?? [];
  if (userErrors.length) {
    throw new Error(userErrors.map((error) => error.message).join("; "));
  }
  return result?.collection ?? null;
}

async function updateShopifyMediaAltText({
  connection,
  productId,
  media
}: {
  connection: ShopifyConnection;
  productId: string;
  media: Array<{ id: string; alt: string }>;
}) {
  try {
    const updated = await shopifyGraphQL<FileUpdatePayload>({
      shopDomain: connection.shopDomain!,
      accessToken: connection.adminAccessToken!,
      query: `
        mutation GrowthImageAltUpdate($files: [FileUpdateInput!]!) {
          fileUpdate(files: $files) {
            files {
              id
              alt
            }
            userErrors {
              field
              message
            }
          }
        }
      `,
      variables: { files: media }
    });

    const result = updated?.fileUpdate;
    const userErrors = result?.userErrors ?? [];
    if (userErrors.length) {
      throw new Error(userErrors.map((error) => error.message).join("; "));
    }
    return result?.files ?? [];
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (!/access|scope|permission|fileUpdate|Field 'fileUpdate'/i.test(message)) {
      throw error;
    }
  }

  const updatedMedia = await shopifyGraphQL<ProductUpdateMediaPayload>({
    shopDomain: connection.shopDomain!,
    accessToken: connection.adminAccessToken!,
    query: `
      mutation GrowthProductMediaAltUpdate($productId: ID!, $media: [UpdateMediaInput!]!) {
        productUpdateMedia(productId: $productId, media: $media) {
          media {
            id
            alt
          }
          mediaUserErrors {
            field
            message
          }
        }
      }
    `,
    variables: { productId, media }
  });

  const result = updatedMedia?.productUpdateMedia;
  const userErrors = result?.mediaUserErrors ?? [];
  if (userErrors.length) {
    throw new Error(userErrors.map((error) => error.message).join("; "));
  }
  return result?.media ?? [];
}

function shopifyProductToImageAltProduct(product: ShopifyGrowthProduct): GrowthImageAltProduct {
  const media = product.media?.nodes
    .filter((node) => node.mediaContentType === "IMAGE" || Boolean(node.image?.url))
    .map((node) => ({
      id: node.id,
      url: node.image?.url,
      alt: node.alt
    })) ?? [];

  return {
    id: product.id,
    title: product.title,
    productType: product.productType,
    tags: product.tags ?? [],
    media
  };
}

export async function previewGrowthImageAltForShopify({
  connection,
  productId
}: {
  connection: ShopifyConnection;
  productId: string;
}) {
  const product = await fetchShopifyGrowthProduct({ connection, productId });
  const plan = buildGrowthImageAltPlan({
    product: shopifyProductToImageAltProduct(product)
  });

  return {
    productId: product.id,
    title: product.title,
    handle: product.handle,
    onlineStoreUrl: product.onlineStoreUrl,
    plan
  };
}

export async function applyGrowthImageAltToShopify({
  connection,
  productId
}: {
  connection: ShopifyConnection;
  productId: string;
}) {
  const preview = await previewGrowthImageAltForShopify({ connection, productId });
  if (!preview.plan.hasChanges) {
    throw new Error("Image alt text is already strong enough for this Shopify product.");
  }

  await updateShopifyMediaAltText({
    connection,
    productId,
    media: preview.plan.mediaUpdates
  });

  return {
    productId: preview.productId,
    handle: preview.handle,
    onlineStoreUrl: preview.onlineStoreUrl,
    applied: {
      changedFields: preview.plan.summary
    },
    diff: preview.plan.diff
  };
}

async function fetchInternalLinkSource({
  connection,
  suggestion
}: {
  connection: ShopifyConnection;
  suggestion: GrowthInternalLinkSuggestionInput;
}) {
  if (suggestion.sourceType === "product") {
    const product = await fetchShopifyGrowthProduct({ connection, productId: suggestion.sourceId });
    return {
      id: product.id,
      title: product.title,
      descriptionHtml: product.descriptionHtml,
      handle: product.handle,
      onlineStoreUrl: product.onlineStoreUrl,
      sourceType: "product" as const
    };
  }

  const collection = await fetchShopifyGrowthCollection({ connection, collectionId: suggestion.sourceId });
  return {
    id: collection.id,
    title: collection.title,
    descriptionHtml: collection.descriptionHtml,
    handle: collection.handle,
    onlineStoreUrl: collection.onlineStoreUrl,
    sourceType: "collection" as const
  };
}

export async function previewGrowthInternalLinkForShopify({
  connection,
  suggestion
}: {
  connection: ShopifyConnection;
  suggestion: GrowthInternalLinkSuggestionInput;
}) {
  const source = await fetchInternalLinkSource({ connection, suggestion });
  const plan = buildGrowthInternalLinkPlan({ source, suggestion });

  return {
    sourceId: source.id,
    sourceType: source.sourceType,
    title: source.title,
    handle: source.handle,
    onlineStoreUrl: source.onlineStoreUrl,
    plan
  };
}

export async function applyGrowthInternalLinkToShopify({
  connection,
  suggestion
}: {
  connection: ShopifyConnection;
  suggestion: GrowthInternalLinkSuggestionInput;
}) {
  const preview = await previewGrowthInternalLinkForShopify({ connection, suggestion });
  if (!preview.plan.hasChanges || !preview.plan.changes.descriptionHtml) {
    throw new Error(preview.plan.reason || "This internal link is already applied to Shopify.");
  }

  if (preview.sourceType === "product") {
    await updateShopifyGrowthProduct({
      connection,
      product: {
        id: preview.sourceId,
        descriptionHtml: preview.plan.changes.descriptionHtml
      }
    });
  } else {
    await updateShopifyGrowthCollection({
      connection,
      collection: {
        id: preview.sourceId,
        descriptionHtml: preview.plan.changes.descriptionHtml
      }
    });
  }

  return {
    sourceId: preview.sourceId,
    sourceType: preview.sourceType,
    handle: preview.handle,
    onlineStoreUrl: preview.onlineStoreUrl,
    applied: {
      changedFields: preview.plan.summary
    },
    diff: preview.plan.diff
  };
}

export async function previewGrowthCollectionFixForShopify({
  connection,
  collectionId,
  selectedFields,
  overrides
}: {
  connection: ShopifyConnection;
  collectionId: string;
  selectedFields?: GrowthCollectionFixField[];
  overrides?: GrowthCollectionFixOverrides;
}) {
  const collection = await fetchShopifyGrowthCollection({ connection, collectionId });
  const auditCollection = shopifyCollectionToAuditCollection(collection);
  const beforeScore = scoreGrowthCollection(auditCollection);
  const suggestedFix = buildGrowthCollectionSuggestedFix(auditCollection);
  const plan = buildGrowthCollectionFixPlan({
    collection: {
      id: collection.id,
      title: collection.title,
      seoTitle: collection.seo?.title,
      seoDescription: collection.seo?.description,
      descriptionHtml: collection.descriptionHtml
    },
    suggestedFix,
    selectedFields,
    overrides
  });

  return {
    collectionId: collection.id,
    title: collection.title,
    handle: collection.handle,
    onlineStoreUrl: collection.onlineStoreUrl,
    beforeScore: beforeScore.overallScore,
    after: {
      seoTitle: plan.changes.seo?.title ?? collection.seo?.title ?? collection.title,
      seoDescription: plan.changes.seo?.description ?? collection.seo?.description ?? "",
      descriptionAppended: plan.descriptionAppended
    },
    plan
  };
}

export async function applyGrowthCollectionFixToShopify({
  connection,
  collectionId,
  selectedFields,
  overrides
}: {
  connection: ShopifyConnection;
  collectionId: string;
  selectedFields?: GrowthCollectionFixField[];
  overrides?: GrowthCollectionFixOverrides;
}) {
  const preview = await previewGrowthCollectionFixForShopify({ connection, collectionId, selectedFields, overrides });
  if (!preview.plan.hasChanges) {
    throw new Error("The suggested collection SEO/GEO fixes are already applied to Shopify.");
  }

  const collectionUpdate: Record<string, unknown> = { id: preview.collectionId };
  if (preview.plan.changes.descriptionHtml) collectionUpdate.descriptionHtml = preview.plan.changes.descriptionHtml;
  if (preview.plan.changes.seo) collectionUpdate.seo = preview.plan.changes.seo;

  const result = await updateShopifyGrowthCollection({ connection, collection: collectionUpdate });

  return {
    collectionId: preview.collectionId,
    handle: result?.handle ?? preview.handle,
    onlineStoreUrl: preview.onlineStoreUrl,
    beforeScore: preview.beforeScore,
    applied: {
      seoTitle: preview.after.seoTitle,
      seoDescription: preview.after.seoDescription,
      descriptionAppended: preview.plan.descriptionAppended,
      changedFields: preview.plan.summary
    },
    diff: preview.plan.diff
  };
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
