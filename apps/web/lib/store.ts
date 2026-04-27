import { randomUUID } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import type { AppState, GenerationJob, Product } from "./types";

const dataDir = path.join(process.cwd(), "data");
const dataFile = path.join(dataDir, "app-state.json");

const initialState: AppState = {
  products: []
};

async function ensureStateFile() {
  await mkdir(dataDir, { recursive: true });
  try {
    await readFile(dataFile, "utf8");
  } catch {
    await writeFile(dataFile, JSON.stringify(initialState, null, 2));
  }
}

export async function readState(): Promise<AppState> {
  await ensureStateFile();
  const raw = await readFile(dataFile, "utf8");
  return JSON.parse(raw) as AppState;
}

export async function writeState(state: AppState) {
  await ensureStateFile();
  await writeFile(dataFile, JSON.stringify(state, null, 2));
}

export async function listProducts() {
  const state = await readState();
  return state.products.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getProduct(id: string) {
  const state = await readState();
  return state.products.find((product) => product.id === id) ?? null;
}

export async function createProduct(input: {
  name?: string;
  category?: string;
  style?: string;
  notes?: string;
  originalImageUrl: string;
  storageKey?: string;
}) {
  const state = await readState();
  const now = new Date().toISOString();
  const id = randomUUID();
  const product: Product = {
    id,
    name: input.name?.trim() || "Uploaded product",
    category: input.category?.trim() || "General ecommerce",
    style: input.style?.trim() || "minimal studio",
    status: "DRAFT",
    originalImageUrl: input.originalImageUrl,
    title: input.name?.trim() || "Uploaded product",
    description: "",
    bulletPoints: [],
    tags: [],
    faq: [],
    price: "",
    compareAtPrice: "",
    sku: "",
    inventoryQuantity: 0,
    trackInventory: false,
    shopifyStatus: "NOT_CONNECTED",
    images: [
      {
        id: randomUUID(),
        productId: id,
        type: "ORIGINAL",
        url: input.originalImageUrl,
        storageKey: input.storageKey,
        isSelected: true,
        sortOrder: 0,
        createdAt: now
      }
    ],
    jobs: [],
    createdAt: now,
    updatedAt: now
  };

  state.products.push(product);
  await writeState(state);
  return product;
}

export async function updateProduct(
  id: string,
  patch: Partial<Pick<Product, "name" | "category" | "style" | "title" | "description" | "bulletPoints" | "tags" | "faq" | "price" | "compareAtPrice" | "sku" | "inventoryQuantity" | "trackInventory" | "status" | "shopifyStatus" | "shopifyProductId">>
) {
  const state = await readState();
  const product = state.products.find((item) => item.id === id);
  if (!product) return null;

  Object.assign(product, patch, { updatedAt: new Date().toISOString() });
  await writeState(state);
  return product;
}

export async function deleteProduct(id: string) {
  const state = await readState();
  const before = state.products.length;
  state.products = state.products.filter((product) => product.id !== id);
  await writeState(state);
  return state.products.length !== before;
}

export async function addJob(
  productId: string,
  input: Omit<GenerationJob, "id" | "productId" | "createdAt" | "updatedAt">
) {
  const state = await readState();
  const product = state.products.find((item) => item.id === productId);
  if (!product) return null;

  const now = new Date().toISOString();
  const job: GenerationJob = {
    id: randomUUID(),
    productId,
    createdAt: now,
    updatedAt: now,
    ...input
  };

  product.jobs.unshift(job);
  product.updatedAt = now;
  await writeState(state);
  return job;
}

export async function getJob(id: string) {
  const state = await readState();
  for (const product of state.products) {
    const job = product.jobs.find((item) => item.id === id);
    if (job) return job;
  }
  return null;
}

export async function completeImageGeneration(productId: string, styles: string[], count: number) {
  const state = await readState();
  const product = state.products.find((item) => item.id === productId);
  if (!product) return null;

  const now = new Date().toISOString();
  const typeForStyle = (style: string) => {
    if (style === "white_background") return "WHITE_BACKGROUND" as const;
    if (style === "product_detail") return "PRODUCT_DETAIL" as const;
    if (style === "product_intro") return "PRODUCT_INTRO" as const;
    return "LIFESTYLE" as const;
  };
  const generated = styles.flatMap((style, styleIndex) =>
    Array.from({ length: 1 }).map((_, index) => ({
      id: randomUUID(),
      productId,
      type: typeForStyle(style),
      url: product.originalImageUrl,
      storageKey: undefined,
      prompt:
        style === "white_background"
          ? "Clean Shopify-style product image on a pure white background with soft studio lighting."
          : style === "product_detail"
            ? "Shopify detail page image showing product details, benefits, and material callouts."
            : style === "product_intro"
              ? "Product introduction image for an ecommerce product page hero section."
          : `Realistic ecommerce lifestyle photo in ${style.replaceAll("_", " ")} style.`,
      isSelected: styleIndex === 0 && index === 0,
      sortOrder: product.images.length + styleIndex + index + 1,
      createdAt: now
    }))
  );

  product.images.push(...generated);
  product.status = "READY";
  product.updatedAt = now;
  await writeState(state);
  return generated;
}

export async function addGeneratedProductImages(
  productId: string,
  images: Array<{
    type: "WHITE_BACKGROUND" | "LIFESTYLE" | "PRODUCT_DETAIL" | "PRODUCT_INTRO" | "REFERENCE_STYLE";
    url: string;
    storageKey?: string;
    prompt: string;
  }>
) {
  const state = await readState();
  const product = state.products.find((item) => item.id === productId);
  if (!product) return null;

  const now = new Date().toISOString();
  const records = images.map((image, index) => ({
    id: randomUUID(),
    productId,
    type: image.type,
    url: image.url,
    storageKey: image.storageKey,
    prompt: image.prompt,
    isSelected: image.type === "WHITE_BACKGROUND",
    sortOrder: product.images.length + index + 1,
    createdAt: now
  }));

  product.images.push(...records);
  product.status = "READY";
  product.updatedAt = now;
  await writeState(state);
  return records;
}

export async function completeCopyGeneration(productId: string) {
  const state = await readState();
  const product = state.products.find((item) => item.id === productId);
  if (!product) return null;

  const category = product.category || "ecommerce";
  const name = product.name || "Featured Product";
  const now = new Date().toISOString();
  const genericName = ["Uploaded product", "Featured Product"].includes(name);
  const titleBase = genericName
    ? `${category.replaceAll(">", "").replace(/\s+/g, " ").trim()} Product`
    : name;

  product.title = `${titleBase} | Quality Everyday Essential`;
  product.bulletPoints = [
    "Clear product presentation for everyday browsing and comparison.",
    "Benefit-led copy written for a clean Shopify product page.",
    "Editable listing content that avoids unsupported claims.",
    "Simple structure for main image, details, and lifestyle sections.",
    "Search-oriented tags ready for further product-specific refinement."
  ];
  product.description = `${titleBase} is presented with clear, editable product copy for a polished online store listing. The content focuses on visible product details, practical customer benefits, and a simple structure that can be refined with exact size, material, condition, and care information before publishing. Review the final images and copy, add any missing specifications you know, and keep unsupported claims out of the live listing.`;
  product.tags = [
    category.toLowerCase(),
    titleBase.toLowerCase(),
    "online store product",
    "everyday essential",
    "customer ready listing"
  ];
  product.faq = [
    {
      question: "Can I edit this content before publishing?",
      answer: "Yes. The workflow is designed for review, editing, and confirmation before any Shopify draft is created."
    }
  ];
  product.status = "READY";
  product.updatedAt = now;
  await writeState(state);
  return product;
}

export async function applyGeneratedCopy(
  productId: string,
  copy: {
    title: string;
    bulletPoints: string[];
    description: string;
    tags: string[];
    faq?: Array<{ question: string; answer: string }>;
  }
) {
  const state = await readState();
  const product = state.products.find((item) => item.id === productId);
  if (!product) return null;

  const now = new Date().toISOString();
  product.title = copy.title;
  product.bulletPoints = copy.bulletPoints;
  product.description = copy.description;
  product.tags = copy.tags;
  product.faq = copy.faq ?? [];
  product.status = "READY";
  product.updatedAt = now;
  await writeState(state);
  return product;
}

export async function saveShopifyConnection(input: {
  shopDomain: string;
  adminAccessToken?: string;
  clientId?: string;
  clientSecret?: string;
}) {
  const state = await readState();
  const now = new Date().toISOString();
  const adminAccessToken = input.adminAccessToken?.trim() || "";
  const clientId = input.clientId?.trim() || "";
  const clientSecret = input.clientSecret?.trim() || "";
  state.shopifyConnection = {
    id: state.shopifyConnection?.id ?? randomUUID(),
    shopDomain: input.shopDomain.trim(),
    adminAccessToken: adminAccessToken || undefined,
    clientId: clientId || undefined,
    clientSecret: clientSecret || undefined,
    accessTokenHint: adminAccessToken ? `••••${adminAccessToken.slice(-4)}` : "not saved",
    clientIdHint: clientId ? `••••${clientId.slice(-4)}` : "not saved",
    clientSecretHint: clientSecret ? `••••${clientSecret.slice(-4)}` : "not saved",
    isActive: Boolean(input.shopDomain.trim() && (adminAccessToken || (clientId && clientSecret))),
    createdAt: state.shopifyConnection?.createdAt ?? now,
    updatedAt: now
  };
  await writeState(state);
  return state.shopifyConnection;
}
