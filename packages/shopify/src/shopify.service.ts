import { readFileSync } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";

export interface ShopifyProductDraftInput {
  title: string;
  descriptionHtml: string;
  tags: string[];
  productType?: string;
  price?: string;
  compareAtPrice?: string;
  sku?: string;
  inventoryQuantity?: number;
  trackInventory?: boolean;
  publishStatus?: "DRAFT" | "ACTIVE";
  imageUrls: string[];
  shopDomain?: string;
  adminAccessToken?: string;
  clientId?: string;
  clientSecret?: string;
}

export interface ShopifyProductDraftResult {
  shopifyProductId: string;
  adminUrl?: string;
  handle?: string;
  skippedImageUrls: string[];
  uploadedImageCount: number;
  stagedUploadCount: number;
  variantId?: string;
  inventoryItemId?: string;
  publishedPublicationCount?: number;
}

interface ShopifyGraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

type ProductCreatePayload = {
  productCreate: {
    product: {
      id: string;
      title: string;
          handle?: string;
          status?: string;
          variants?: {
            nodes: Array<{
              id: string;
              price?: string;
              inventoryItem?: {
                id: string;
                tracked?: boolean;
              };
            }>;
          };
        } | null;
    userErrors: Array<{ field?: string[]; message: string }>;
  };
};

type StagedUploadsCreatePayload = {
  stagedUploadsCreate: {
    stagedTargets: Array<{
      url: string;
      resourceUrl: string;
      parameters: Array<{ name: string; value: string }>;
    }>;
    userErrors: Array<{ field?: string[]; message: string }>;
  };
};

type ProductVariantsBulkUpdatePayload = {
  productVariantsBulkUpdate: {
    productVariants: Array<{
      id: string;
      price?: string;
      compareAtPrice?: string;
      inventoryItem?: {
        id: string;
        tracked?: boolean;
        sku?: string;
      };
    }>;
    userErrors: Array<{ field?: string[]; message: string }>;
  };
};

type PrimaryLocationPayload = {
  location: {
    id: string;
    name?: string;
  } | null;
};

type InventorySetQuantitiesPayload = {
  inventorySetQuantities: {
    userErrors: Array<{ field?: string[]; message: string }>;
  };
};

type PublicationsPayload = {
  publications: {
    nodes: Array<{ id: string; name: string }>;
  };
};

type PublishablePublishPayload = {
  publishablePublish: {
    userErrors: Array<{ field?: string[]; message: string }>;
  };
};

const defaultApiVersion = "2026-04";

function readLocalEnvValue(name: string) {
  const candidates = [
    path.join(process.cwd(), ".env.local"),
    path.join(process.cwd(), "../..", ".env.local")
  ];

  for (const filePath of candidates) {
    try {
      const env = readFileSync(filePath, "utf8");
      const match = env.match(new RegExp(`^${name}=(.*)$`, "m"));
      if (!match) continue;
      return match[1].trim().replace(/^["']|["']$/g, "");
    } catch {
      // Missing env files are expected in deployed environments.
    }
  }

  return undefined;
}

function getConfigValue(name: string) {
  return readLocalEnvValue(name) || process.env[name]?.trim() || undefined;
}

function localImagePathFromUrl(url: string) {
  if (!url.startsWith("/uploads/")) return undefined;
  return path.join(process.cwd(), "public", url);
}

function mimeTypeForPath(filePath: string) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  return "image/jpeg";
}

function normalizeShopDomain(input?: string) {
  const value = input?.trim();
  if (!value) return undefined;

  try {
    const parsed = new URL(value.startsWith("http") ? value : `https://${value}`);
    const hostname = parsed.hostname.replace(/^www\./, "").toLowerCase();
    if (hostname === "admin.shopify.com") {
      const storeHandle = parsed.pathname.match(/\/store\/([^/?#]+)/)?.[1];
      return storeHandle ? `${storeHandle.toLowerCase()}.myshopify.com` : undefined;
    }
    return hostname.endsWith(".myshopify.com") ? hostname : undefined;
  } catch {
    const cleaned = value
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .replace(/\/.*$/, "")
      .toLowerCase();
    if (cleaned.endsWith(".myshopify.com")) return cleaned;
    if (/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(cleaned)) return `${cleaned}.myshopify.com`;
    return undefined;
  }
}

function getPublicBaseUrl() {
  const explicit = getConfigValue("APP_PUBLIC_URL") || getConfigValue("NEXT_PUBLIC_APP_URL");
  if (explicit) return explicit.replace(/\/$/, "");

  const vercelUrl = getConfigValue("VERCEL_URL");
  if (vercelUrl) return `https://${vercelUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")}`;

  return undefined;
}

function isPublicImageUrl(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && !["localhost", "127.0.0.1", "::1"].includes(parsed.hostname);
  } catch {
    return false;
  }
}

function prepareImageUrls(imageUrls: string[]) {
  const publicBaseUrl = getPublicBaseUrl();
  const usable: string[] = [];
  const skipped: string[] = [];

  for (const imageUrl of imageUrls) {
    if (isPublicImageUrl(imageUrl)) {
      usable.push(imageUrl);
      continue;
    }

    if (imageUrl.startsWith("/") && publicBaseUrl?.startsWith("https://")) {
      usable.push(new URL(imageUrl, publicBaseUrl).toString());
      continue;
    }

    skipped.push(imageUrl);
  }

  return { usable, skipped };
}

async function shopifyGraphQL<T>(input: {
  shopDomain: string;
  apiVersion: string;
  accessToken: string;
  query: string;
  variables: Record<string, unknown>;
}) {
  const response = await fetch(`https://${input.shopDomain}/admin/api/${input.apiVersion}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": input.accessToken
    },
    body: JSON.stringify({
      query: input.query,
      variables: input.variables
    })
  });

  const payload = (await response.json()) as ShopifyGraphQLResponse<T>;
  if (!response.ok) {
    throw new Error(`Shopify GraphQL request failed (${response.status}): ${JSON.stringify(payload)}`);
  }
  if (payload.errors?.length) {
    throw new Error(payload.errors.map((error) => error.message).join("; "));
  }

  return payload;
}

async function uploadLocalImageToShopify(input: {
  shopDomain: string;
  apiVersion: string;
  accessToken: string;
  imageUrl: string;
}) {
  const filePath = localImagePathFromUrl(input.imageUrl);
  if (!filePath) return null;

  const fileInfo = await stat(filePath);
  const mimeType = mimeTypeForPath(filePath);
  const filename = path.basename(filePath);
  const mutation = `
    mutation StagedUploadsCreate($input: [StagedUploadInput!]!) {
      stagedUploadsCreate(input: $input) {
        stagedTargets {
          url
          resourceUrl
          parameters {
            name
            value
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const payload = await shopifyGraphQL<StagedUploadsCreatePayload>({
    shopDomain: input.shopDomain,
    apiVersion: input.apiVersion,
    accessToken: input.accessToken,
    query: mutation,
    variables: {
      input: [
        {
          resource: "IMAGE",
          filename,
          mimeType,
          httpMethod: "PUT",
          fileSize: fileInfo.size.toString()
        }
      ]
    }
  });

  const result = payload.data?.stagedUploadsCreate;
  const userErrors = result?.userErrors ?? [];
  if (userErrors.length) {
    throw new Error(userErrors.map((error) => error.message).join("; "));
  }

  const target = result?.stagedTargets[0];
  if (!target) throw new Error("Shopify did not return a staged upload target.");

  const bytes = await readFile(filePath);
  const headers = new Headers();
  for (const parameter of target.parameters) {
    headers.set(parameter.name, parameter.value);
  }
  if (!headers.has("content_type")) headers.set("content_type", mimeType);

  const uploadResponse = await fetch(target.url, {
    method: "PUT",
    headers,
    body: new Blob([bytes], { type: mimeType })
  });

  if (!uploadResponse.ok) {
    const text = await uploadResponse.text();
    throw new Error(`Shopify image upload failed (${uploadResponse.status}): ${text.slice(0, 500)}`);
  }

  return target.resourceUrl;
}

async function prepareShopifyMediaSources(input: {
  shopDomain: string;
  apiVersion: string;
  accessToken: string;
  imageUrls: string[];
}) {
  const publicUrls = prepareImageUrls(input.imageUrls);
  const stagedUrls: string[] = [];
  const skipped = [...publicUrls.skipped];

  for (const imageUrl of input.imageUrls) {
    if (!localImagePathFromUrl(imageUrl)) continue;
    try {
      const stagedUrl = await uploadLocalImageToShopify({
        shopDomain: input.shopDomain,
        apiVersion: input.apiVersion,
        accessToken: input.accessToken,
        imageUrl
      });
      if (stagedUrl) {
        stagedUrls.push(stagedUrl);
        const skippedIndex = skipped.indexOf(imageUrl);
        if (skippedIndex >= 0) skipped.splice(skippedIndex, 1);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown upload error.";
      throw new Error(`Could not upload ${imageUrl} to Shopify: ${message}`);
    }
  }

  return {
    usable: [...publicUrls.usable, ...stagedUrls],
    skipped,
    stagedUploadCount: stagedUrls.length
  };
}

async function getAdminAccessToken(input: {
  shopDomain: string;
  adminAccessToken?: string;
  clientId?: string;
  clientSecret?: string;
}) {
  const directToken = input.adminAccessToken?.trim();
  if (directToken) return directToken;

  const clientId = input.clientId?.trim();
  const clientSecret = input.clientSecret?.trim();
  if (!clientId || !clientSecret) {
    throw new Error(
      "Save a Shopify Admin API token, or save both Client ID and Client secret before publishing."
    );
  }

  const response = await fetch(`https://${input.shopDomain}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret
    })
  });

  if (!response.ok) {
    const text = await response.text();
    const isHtml = response.headers.get("content-type")?.includes("text/html") || text.trim().startsWith("<");
    if (isHtml) {
      throw new Error(
        `Shopify token request failed (${response.status}). Use the store's .myshopify.com domain, not the public storefront domain, and make sure the Dev Dashboard app is released and installed on that store.`
      );
    }
    throw new Error(`Shopify token request failed (${response.status}): ${text}`);
  }

  const payload = (await response.json()) as { access_token?: string };
  if (!payload.access_token) throw new Error("Shopify token response did not include an access token.");
  return payload.access_token;
}

function numericProductId(shopifyProductId: string) {
  return shopifyProductId.split("/").pop() ?? shopifyProductId;
}

function normalizeMoney(value?: string) {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  const amount = Number(trimmed);
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error(`Invalid price value: ${value}`);
  }
  return amount.toFixed(2);
}

function normalizeInventoryQuantity(value?: number) {
  if (value === undefined || value === null) return undefined;
  if (!Number.isFinite(value) || value < 0) {
    throw new Error("Inventory quantity must be zero or greater.");
  }
  return Math.floor(value);
}

export function getShopifyCredentialStatus(input?: {
  shopDomain?: string;
  adminAccessToken?: string;
  clientId?: string;
  clientSecret?: string;
}) {
  const shopDomain = normalizeShopDomain(input?.shopDomain);
  const hasAdminToken = Boolean(
    "adminAccessToken" in (input ?? {}) &&
      (input as { adminAccessToken?: string }).adminAccessToken?.trim()
  );
  const hasClientCredentials = Boolean(
    "clientId" in (input ?? {}) &&
      "clientSecret" in (input ?? {}) &&
      (input as { clientId?: string }).clientId?.trim() &&
      (input as { clientSecret?: string }).clientSecret?.trim()
  );

  return {
    configured: Boolean(shopDomain && (hasAdminToken || hasClientCredentials)),
    shopDomain: shopDomain ?? null,
    authMode: hasAdminToken ? "admin-token" : hasClientCredentials ? "client-credentials" : "missing",
    imagesCanPublish: Boolean(getPublicBaseUrl())
  };
}

export async function createShopifyProductDraft(
  input: ShopifyProductDraftInput
): Promise<ShopifyProductDraftResult> {
  const shopDomain = normalizeShopDomain(input.shopDomain);
  if (!shopDomain) {
    throw new Error("Save a valid Shopify shop domain, such as your-store.myshopify.com.");
  }

  const accessToken = await getAdminAccessToken({
    shopDomain,
    adminAccessToken: input.adminAccessToken,
    clientId: input.clientId,
    clientSecret: input.clientSecret
  });
  const apiVersion = getConfigValue("SHOPIFY_API_VERSION") || defaultApiVersion;
  const price = normalizeMoney(input.price);
  const compareAtPrice = normalizeMoney(input.compareAtPrice);
  const inventoryQuantity = normalizeInventoryQuantity(input.inventoryQuantity);
  const { usable, skipped, stagedUploadCount } = await prepareShopifyMediaSources({
    shopDomain,
    apiVersion,
    accessToken,
    imageUrls: input.imageUrls
  });

  const mutation = `
    mutation CreateProduct($product: ProductCreateInput!, $media: [CreateMediaInput!]) {
      productCreate(product: $product, media: $media) {
        product {
          id
          title
          handle
          status
          variants(first: 1) {
            nodes {
              id
              price
              inventoryItem {
                id
                tracked
              }
            }
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const payload = await shopifyGraphQL<ProductCreatePayload>({
    shopDomain,
    apiVersion,
    accessToken,
    query: mutation,
    variables: {
        product: {
          title: input.title,
          descriptionHtml: input.descriptionHtml,
          productType: input.productType || undefined,
          tags: input.tags,
          status: input.publishStatus || "DRAFT"
        },
      media: usable.map((imageUrl) => ({
        originalSource: imageUrl,
        alt: input.title,
        mediaContentType: "IMAGE"
      }))
    }
  });

  const result = payload.data?.productCreate;
  const userErrors = result?.userErrors ?? [];
  if (userErrors.length) {
    throw new Error(userErrors.map((error) => error.message).join("; "));
  }
  if (!result?.product?.id) {
    throw new Error("Shopify did not return a product ID.");
  }

  const productId = result.product.id;
  const firstVariant = result.product.variants?.nodes[0];
  if (firstVariant && (price || compareAtPrice || input.sku || input.trackInventory || inventoryQuantity !== undefined)) {
    await updateDefaultVariant({
      shopDomain,
      apiVersion,
      accessToken,
      productId,
      variantId: firstVariant.id,
      inventoryItemId: firstVariant.inventoryItem?.id,
      price,
      compareAtPrice,
      sku: input.sku,
      trackInventory: input.trackInventory,
      inventoryQuantity
    });
  }
  const publishedPublicationCount =
    input.publishStatus === "ACTIVE"
      ? await publishProductToAvailablePublications({
          shopDomain,
          apiVersion,
          accessToken,
          productId
        })
      : 0;

  return {
    shopifyProductId: productId,
    adminUrl: `https://${shopDomain}/admin/products/${numericProductId(productId)}`,
    handle: result.product.handle,
    skippedImageUrls: skipped,
    uploadedImageCount: usable.length,
    stagedUploadCount,
    variantId: firstVariant?.id,
    inventoryItemId: firstVariant?.inventoryItem?.id,
    publishedPublicationCount
  };
}

async function updateDefaultVariant(input: {
  shopDomain: string;
  apiVersion: string;
  accessToken: string;
  productId: string;
  variantId: string;
  inventoryItemId?: string;
  price?: string;
  compareAtPrice?: string;
  sku?: string;
  trackInventory?: boolean;
  inventoryQuantity?: number;
}) {
  const variant: Record<string, unknown> = { id: input.variantId };
  if (input.price) variant.price = input.price;
  if (input.compareAtPrice) variant.compareAtPrice = input.compareAtPrice;
  if (input.sku || input.trackInventory) {
    variant.inventoryItem = {
      ...(input.sku ? { sku: input.sku.trim() } : {}),
      ...(input.trackInventory ? { tracked: true } : {})
    };
  }

  const mutation = `
    mutation ProductVariantsBulkUpdate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
      productVariantsBulkUpdate(productId: $productId, variants: $variants) {
        productVariants {
          id
          price
          compareAtPrice
          inventoryItem {
            id
            sku
            tracked
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const payload = await shopifyGraphQL<ProductVariantsBulkUpdatePayload>({
    shopDomain: input.shopDomain,
    apiVersion: input.apiVersion,
    accessToken: input.accessToken,
    query: mutation,
    variables: {
      productId: input.productId,
      variants: [variant]
    }
  });

  const userErrors = payload.data?.productVariantsBulkUpdate.userErrors ?? [];
  if (userErrors.length) {
    throw new Error(userErrors.map((error) => error.message).join("; "));
  }

  if (input.trackInventory && input.inventoryQuantity !== undefined && input.inventoryItemId) {
    await setInventoryQuantity({
      shopDomain: input.shopDomain,
      apiVersion: input.apiVersion,
      accessToken: input.accessToken,
      inventoryItemId: input.inventoryItemId,
      quantity: input.inventoryQuantity
    });
  }
}

async function getPrimaryLocationId(input: {
  shopDomain: string;
  apiVersion: string;
  accessToken: string;
}) {
  const payload = await shopifyGraphQL<PrimaryLocationPayload>({
    shopDomain: input.shopDomain,
    apiVersion: input.apiVersion,
    accessToken: input.accessToken,
    query: `
      query PrimaryLocation {
        location {
          id
          name
        }
      }
    `,
    variables: {}
  });

  const locationId = payload.data?.location?.id;
  if (!locationId) throw new Error("Shopify did not return a primary location for inventory.");
  return locationId;
}

async function setInventoryQuantity(input: {
  shopDomain: string;
  apiVersion: string;
  accessToken: string;
  inventoryItemId: string;
  quantity: number;
}) {
  const locationId = await getPrimaryLocationId(input);
  const payload = await shopifyGraphQL<InventorySetQuantitiesPayload>({
    shopDomain: input.shopDomain,
    apiVersion: input.apiVersion,
    accessToken: input.accessToken,
    query: `
      mutation InventorySet($input: InventorySetQuantitiesInput!, $idempotencyKey: String!) {
        inventorySetQuantities(input: $input) @idempotent(key: $idempotencyKey) {
          userErrors {
            field
            message
          }
        }
      }
    `,
    variables: {
      idempotencyKey: randomUUID(),
      input: {
        name: "available",
        reason: "correction",
        referenceDocumentUri: `gid://ai-product-studio/ProductPublish/${randomUUID()}`,
        quantities: [
          {
            inventoryItemId: input.inventoryItemId,
            locationId,
            quantity: input.quantity,
            changeFromQuantity: null
          }
        ]
      }
    }
  });

  const userErrors = payload.data?.inventorySetQuantities.userErrors ?? [];
  if (userErrors.length) {
    throw new Error(userErrors.map((error) => error.message).join("; "));
  }
}

async function publishProductToAvailablePublications(input: {
  shopDomain: string;
  apiVersion: string;
  accessToken: string;
  productId: string;
}) {
  const publications = await shopifyGraphQL<PublicationsPayload>({
    shopDomain: input.shopDomain,
    apiVersion: input.apiVersion,
    accessToken: input.accessToken,
    query: `
      query Publications {
        publications(first: 10) {
          nodes {
            id
            name
          }
        }
      }
    `,
    variables: {}
  });

  const publicationIds = publications.data?.publications.nodes.map((publication) => publication.id) ?? [];
  if (!publicationIds.length) return 0;

  const payload = await shopifyGraphQL<PublishablePublishPayload>({
    shopDomain: input.shopDomain,
    apiVersion: input.apiVersion,
    accessToken: input.accessToken,
    query: `
      mutation PublishProduct($id: ID!, $input: [PublicationInput!]!) {
        publishablePublish(id: $id, input: $input) {
          userErrors {
            field
            message
          }
        }
      }
    `,
    variables: {
      id: input.productId,
      input: publicationIds.map((publicationId) => ({ publicationId }))
    }
  });

  const userErrors = payload.data?.publishablePublish.userErrors ?? [];
  if (userErrors.length) {
    throw new Error(userErrors.map((error) => error.message).join("; "));
  }

  return publicationIds.length;
}
