import { randomUUID } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import type {
  AppState,
  GenerationJob,
  Product,
  ProductImage,
  ProductImageType,
  ProductStatus,
  ShopifyConnection,
  ShopifyStatus
} from "./types";
import {
  createSupabaseAdminClient,
  isSupabaseStorageEnabled
} from "./supabase-admin";

const dataDir = path.join(process.cwd(), "data");
const dataFile = path.join(dataDir, "app-state.json");

const initialState: AppState = {
  products: []
};

type ProductPatch = Partial<
  Pick<
    Product,
    | "name"
    | "category"
    | "style"
    | "title"
    | "description"
    | "bulletPoints"
    | "tags"
    | "faq"
    | "price"
    | "compareAtPrice"
    | "sku"
    | "inventoryQuantity"
    | "trackInventory"
    | "status"
    | "shopifyStatus"
    | "shopifyProductId"
  >
>;

type ProductRow = Record<string, unknown> & {
  id: string;
  created_at?: string;
  updated_at?: string;
};

type ProductImageRow = Record<string, unknown> & {
  id: string;
  product_id: string;
  created_at?: string;
};

type JobRow = Record<string, unknown> & {
  id: string;
  product_id: string;
  created_at?: string;
  updated_at?: string;
};

type StoreRow = Record<string, unknown> & {
  id: string;
  created_at?: string;
  updated_at?: string;
};

function usingSupabase() {
  return isSupabaseStorageEnabled();
}

async function ensureStateFile() {
  await mkdir(dataDir, { recursive: true });
  try {
    await readFile(dataFile, "utf8");
  } catch {
    await writeFile(dataFile, JSON.stringify(initialState, null, 2));
  }
}

async function readLocalState(): Promise<AppState> {
  await ensureStateFile();
  const raw = await readFile(dataFile, "utf8");
  return JSON.parse(raw) as AppState;
}

async function writeLocalState(state: AppState) {
  await ensureStateFile();
  await writeFile(dataFile, JSON.stringify(state, null, 2));
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function asStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function isMissingColumnError(error: { message?: string; code?: string } | null | undefined, columnName: string) {
  return Boolean(
    error &&
      (error.code === "42703" ||
        error.message?.includes(`column stores.${columnName} does not exist`) ||
        error.message?.includes(`'${columnName}' column`) ||
        error.message?.includes(`Could not find the '${columnName}' column`))
  );
}

function asFaq(value: unknown): Product["faq"] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const record = item as Record<string, unknown>;
      return {
        question: asString(record.question),
        answer: asString(record.answer)
      };
    })
    .filter((item): item is { question: string; answer: string } => Boolean(item?.question || item?.answer));
}

function mapImage(row: ProductImageRow): ProductImage {
  return {
    id: row.id,
    productId: row.product_id,
    type: asString(row.image_type, "LIFESTYLE") as ProductImageType,
    url: asString(row.url),
    storageKey: asString(row.storage_key) || undefined,
    prompt: asString(row.prompt) || undefined,
    isSelected: Boolean(row.is_selected),
    sortOrder: Number(row.sort_order ?? 0),
    createdAt: row.created_at ?? new Date().toISOString()
  };
}

function mapJob(row: JobRow): GenerationJob {
  return {
    id: row.id,
    productId: row.product_id,
    type: asString(row.type) as GenerationJob["type"],
    status: asString(row.status, "QUEUED") as GenerationJob["status"],
    progress: Number(row.progress ?? 0),
    input: (row.input && typeof row.input === "object" ? row.input : {}) as Record<string, unknown>,
    output: (row.output && typeof row.output === "object" ? row.output : undefined) as Record<string, unknown> | undefined,
    error: typeof row.error === "string" ? row.error : null,
    createdAt: row.created_at ?? new Date().toISOString(),
    updatedAt: row.updated_at ?? row.created_at ?? new Date().toISOString()
  };
}

function mapProduct(row: ProductRow, images: ProductImage[] = [], jobs: GenerationJob[] = []): Product {
  const originalImageUrl =
    asString(row.original_image_url) ||
    images.find((image) => image.type === "ORIGINAL")?.url ||
    "";

  return {
    id: row.id,
    name: asString(row.name) || asString(row.title) || "Uploaded product",
    category: asString(row.category) || "General ecommerce",
    style: asString(row.style) || "minimal studio",
    status: asString(row.status, "DRAFT") as ProductStatus,
    originalImageUrl,
    backgroundRemovedImageUrl: asString(row.background_removed_image_url) || undefined,
    title: asString(row.title) || asString(row.name) || "Uploaded product",
    description: asString(row.description) || asString(row.description_html),
    bulletPoints: asStringArray(row.bullet_points).length
      ? asStringArray(row.bullet_points)
      : asFaq(row.bullets).map((item) => item.answer),
    tags: asStringArray(row.tags),
    faq: asFaq(row.faq),
    price: asString(row.price),
    compareAtPrice: asString(row.compare_at_price),
    sku: asString(row.sku),
    inventoryQuantity: Number(row.inventory_quantity ?? 0),
    trackInventory: Boolean(row.track_inventory),
    shopifyProductId: asString(row.shopify_product_id) || undefined,
    shopifyStatus: asString(row.shopify_status, "NOT_CONNECTED") as ShopifyStatus,
    images,
    jobs,
    createdAt: row.created_at ?? new Date().toISOString(),
    updatedAt: row.updated_at ?? row.created_at ?? new Date().toISOString()
  };
}

function mapStore(row: StoreRow): ShopifyConnection {
  const adminAccessToken = asString(row.admin_access_token) || asString(row.access_token);
  const clientId = asString(row.client_id);
  const clientSecret = asString(row.client_secret);

  return {
    id: row.id,
    shopDomain: asString(row.shop_domain),
    adminAccessToken: adminAccessToken || undefined,
    clientId: clientId || undefined,
    clientSecret: clientSecret || undefined,
    accessTokenHint: adminAccessToken ? `••••${adminAccessToken.slice(-4)}` : "not saved",
    clientIdHint: clientId ? `••••${clientId.slice(-4)}` : "not saved",
    clientSecretHint: clientSecret ? `••••${clientSecret.slice(-4)}` : "not saved",
    isActive: Boolean(row.is_active),
    createdAt: row.created_at ?? new Date().toISOString(),
    updatedAt: row.updated_at ?? row.created_at ?? new Date().toISOString()
  };
}

async function fetchProductRelations(productIds: string[]) {
  if (!productIds.length) {
    return { imagesByProductId: new Map<string, ProductImage[]>(), jobsByProductId: new Map<string, GenerationJob[]>() };
  }

  const supabase = createSupabaseAdminClient();
  const [{ data: imageRows, error: imageError }, { data: jobRows, error: jobError }] = await Promise.all([
    supabase
      .from("product_images")
      .select("*")
      .in("product_id", productIds)
      .order("sort_order", { ascending: true }),
    supabase
      .from("jobs")
      .select("*")
      .in("product_id", productIds)
      .order("created_at", { ascending: false })
  ]);

  if (imageError) throw new Error(`Could not load product images: ${imageError.message}`);
  if (jobError) throw new Error(`Could not load jobs: ${jobError.message}`);

  const imagesByProductId = new Map<string, ProductImage[]>();
  for (const row of (imageRows ?? []) as ProductImageRow[]) {
    const image = mapImage(row);
    imagesByProductId.set(image.productId, [...(imagesByProductId.get(image.productId) ?? []), image]);
  }

  const jobsByProductId = new Map<string, GenerationJob[]>();
  for (const row of (jobRows ?? []) as JobRow[]) {
    const job = mapJob(row);
    jobsByProductId.set(job.productId, [...(jobsByProductId.get(job.productId) ?? []), job]);
  }

  return { imagesByProductId, jobsByProductId };
}

async function getActiveShopifyConnection() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("stores")
    .select("*")
    .eq("is_active", true)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (isMissingColumnError(error, "is_active")) {
    const { data: fallbackData, error: fallbackError } = await supabase
      .from("stores")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fallbackError) throw new Error(`Could not load Shopify connection: ${fallbackError.message}`);
    return fallbackData ? mapStore({ ...(fallbackData as StoreRow), is_active: true }) : undefined;
  }

  if (error) throw new Error(`Could not load Shopify connection: ${error.message}`);
  return data ? mapStore(data as StoreRow) : undefined;
}

export async function readState(): Promise<AppState> {
  if (!usingSupabase()) return readLocalState();
  return {
    products: await listProducts(),
    shopifyConnection: await getActiveShopifyConnection()
  };
}

export async function writeState(state: AppState) {
  if (!usingSupabase()) return writeLocalState(state);
}

export async function listProducts() {
  if (!usingSupabase()) {
    const state = await readLocalState();
    return state.products.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Could not load products: ${error.message}`);
  const rows = (data ?? []) as ProductRow[];
  const { imagesByProductId, jobsByProductId } = await fetchProductRelations(rows.map((row) => row.id));

  return rows.map((row) =>
    mapProduct(row, imagesByProductId.get(row.id) ?? [], jobsByProductId.get(row.id) ?? [])
  );
}

export async function getProduct(id: string) {
  if (!usingSupabase()) {
    const state = await readLocalState();
    return state.products.find((product) => product.id === id) ?? null;
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Could not load product: ${error.message}`);
  if (!data) return null;

  const { imagesByProductId, jobsByProductId } = await fetchProductRelations([id]);
  return mapProduct(data as ProductRow, imagesByProductId.get(id) ?? [], jobsByProductId.get(id) ?? []);
}

export async function createProduct(input: {
  name?: string;
  category?: string;
  style?: string;
  notes?: string;
  originalImageUrl: string;
  storageKey?: string;
}) {
  if (!usingSupabase()) {
    const state = await readLocalState();
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
    await writeLocalState(state);
    return product;
  }

  const supabase = createSupabaseAdminClient();
  const now = new Date().toISOString();
  const id = randomUUID();
  const name = input.name?.trim() || "Uploaded product";
  const category = input.category?.trim() || "General ecommerce";
  const style = input.style?.trim() || "minimal studio";

  const { data, error } = await supabase
    .from("products")
    .insert({
      id,
      name,
      category,
      style,
      status: "DRAFT",
      original_image_url: input.originalImageUrl,
      title: name,
      description: "",
      bullet_points: [],
      tags: [],
      faq: [],
      price: "",
      compare_at_price: "",
      sku: "",
      inventory_quantity: 0,
      track_inventory: false,
      shopify_status: "NOT_CONNECTED",
      created_at: now,
      updated_at: now
    })
    .select("*")
    .single();

  if (error) throw new Error(`Could not create product: ${error.message}`);

  const { data: imageData, error: imageError } = await supabase
    .from("product_images")
    .insert({
      id: randomUUID(),
      product_id: id,
      image_type: "ORIGINAL",
      url: input.originalImageUrl,
      storage_key: input.storageKey,
      is_selected: true,
      sort_order: 0,
      created_at: now
    })
    .select("*")
    .single();

  if (imageError) throw new Error(`Could not create original image: ${imageError.message}`);

  return mapProduct(data as ProductRow, [mapImage(imageData as ProductImageRow)], []);
}

export async function updateProduct(id: string, patch: ProductPatch) {
  if (!usingSupabase()) {
    const state = await readLocalState();
    const product = state.products.find((item) => item.id === id);
    if (!product) return null;

    Object.assign(product, patch, { updatedAt: new Date().toISOString() });
    await writeLocalState(state);
    return product;
  }

  const update: Record<string, unknown> = {
    updated_at: new Date().toISOString()
  };

  if ("name" in patch) update.name = patch.name;
  if ("category" in patch) update.category = patch.category;
  if ("style" in patch) update.style = patch.style;
  if ("title" in patch) update.title = patch.title;
  if ("description" in patch) update.description = patch.description;
  if ("bulletPoints" in patch) update.bullet_points = patch.bulletPoints ?? [];
  if ("tags" in patch) update.tags = patch.tags ?? [];
  if ("faq" in patch) update.faq = patch.faq ?? [];
  if ("price" in patch) update.price = patch.price;
  if ("compareAtPrice" in patch) update.compare_at_price = patch.compareAtPrice;
  if ("sku" in patch) update.sku = patch.sku;
  if ("inventoryQuantity" in patch) update.inventory_quantity = patch.inventoryQuantity ?? 0;
  if ("trackInventory" in patch) update.track_inventory = patch.trackInventory ?? false;
  if ("status" in patch) update.status = patch.status;
  if ("shopifyStatus" in patch) update.shopify_status = patch.shopifyStatus;
  if ("shopifyProductId" in patch) update.shopify_product_id = patch.shopifyProductId;

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("products").update(update).eq("id", id);
  if (error) throw new Error(`Could not update product: ${error.message}`);

  return getProduct(id);
}

export async function deleteProduct(id: string) {
  if (!usingSupabase()) {
    const state = await readLocalState();
    const before = state.products.length;
    state.products = state.products.filter((product) => product.id !== id);
    await writeLocalState(state);
    return state.products.length !== before;
  }

  const supabase = createSupabaseAdminClient();
  const { error, count } = await supabase
    .from("products")
    .delete({ count: "exact" })
    .eq("id", id);

  if (error) throw new Error(`Could not delete product: ${error.message}`);
  return Boolean(count);
}

export async function addJob(
  productId: string,
  input: Omit<GenerationJob, "id" | "productId" | "createdAt" | "updatedAt">
) {
  if (!usingSupabase()) {
    const state = await readLocalState();
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
    await writeLocalState(state);
    return job;
  }

  const supabase = createSupabaseAdminClient();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("jobs")
    .insert({
      id: randomUUID(),
      product_id: productId,
      type: input.type,
      status: input.status,
      progress: input.progress,
      input: input.input,
      output: input.output ?? {},
      result: input.output ?? {},
      error: input.error ?? null,
      created_at: now,
      updated_at: now
    })
    .select("*")
    .single();

  if (error) throw new Error(`Could not create job: ${error.message}`);

  await supabase
    .from("products")
    .update({ updated_at: now })
    .eq("id", productId);

  return mapJob(data as JobRow);
}

export async function getJob(id: string) {
  if (!usingSupabase()) {
    const state = await readLocalState();
    for (const product of state.products) {
      const job = product.jobs.find((item) => item.id === id);
      if (job) return job;
    }
    return null;
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Could not load job: ${error.message}`);
  return data ? mapJob(data as JobRow) : null;
}

export async function completeImageGeneration(productId: string, styles: string[], count: number) {
  const product = await getProduct(productId);
  if (!product) return null;

  const typeForStyle = (style: string) => {
    if (style === "white_background") return "WHITE_BACKGROUND" as const;
    if (style === "product_detail") return "PRODUCT_DETAIL" as const;
    if (style === "product_intro") return "PRODUCT_INTRO" as const;
    return "LIFESTYLE" as const;
  };
  const generated = styles.flatMap((style, styleIndex) =>
    Array.from({ length: 1 }).map((_, index) => ({
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
              : `Realistic ecommerce lifestyle photo in ${style.replaceAll("_", " ")} style.`
    }))
  );

  return addGeneratedProductImages(productId, generated);
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
  if (!usingSupabase()) {
    const state = await readLocalState();
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
    await writeLocalState(state);
    return records;
  }

  const product = await getProduct(productId);
  if (!product) return null;

  const supabase = createSupabaseAdminClient();
  const now = new Date().toISOString();
  const rows = images.map((image, index) => ({
    id: randomUUID(),
    product_id: productId,
    image_type: image.type,
    url: image.url,
    storage_key: image.storageKey,
    prompt: image.prompt,
    is_selected: image.type === "WHITE_BACKGROUND",
    sort_order: product.images.length + index + 1,
    created_at: now
  }));

  const { data, error } = await supabase
    .from("product_images")
    .insert(rows)
    .select("*");

  if (error) throw new Error(`Could not save generated images: ${error.message}`);

  await supabase
    .from("products")
    .update({ status: "READY", updated_at: now })
    .eq("id", productId);

  return ((data ?? []) as ProductImageRow[]).map(mapImage);
}

export async function completeCopyGeneration(productId: string) {
  const product = await getProduct(productId);
  if (!product) return null;

  const category = product.category || "ecommerce";
  const name = product.name || "Featured Product";
  const genericName = ["Uploaded product", "Featured Product"].includes(name);
  const titleBase = genericName
    ? `${category.replaceAll(">", "").replace(/\s+/g, " ").trim()} Product`
    : name;

  return updateProduct(productId, {
    title: `${titleBase} | Quality Everyday Essential`,
    bulletPoints: [
      "Clear product presentation for everyday browsing and comparison.",
      "Benefit-led copy written for a clean Shopify product page.",
      "Editable listing content that avoids unsupported claims.",
      "Simple structure for main image, details, and lifestyle sections.",
      "Search-oriented tags ready for further product-specific refinement."
    ],
    description: `${titleBase} is presented with clear, editable product copy for a polished online store listing. The content focuses on visible product details, practical customer benefits, and a simple structure that can be refined with exact size, material, condition, and care information before publishing. Review the final images and copy, add any missing specifications you know, and keep unsupported claims out of the live listing.`,
    tags: [
      category.toLowerCase(),
      titleBase.toLowerCase(),
      "online store product",
      "everyday essential",
      "customer ready listing"
    ],
    faq: [
      {
        question: "Can I edit this content before publishing?",
        answer: "Yes. The workflow is designed for review, editing, and confirmation before any Shopify draft is created."
      }
    ],
    status: "READY"
  });
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
  return updateProduct(productId, {
    title: copy.title,
    bulletPoints: copy.bulletPoints,
    description: copy.description,
    tags: copy.tags,
    faq: copy.faq ?? [],
    status: "READY"
  });
}

export async function saveShopifyConnection(input: {
  shopDomain: string;
  adminAccessToken?: string;
  clientId?: string;
  clientSecret?: string;
}) {
  if (!usingSupabase()) {
    const state = await readLocalState();
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
    await writeLocalState(state);
    return state.shopifyConnection;
  }

  const supabase = createSupabaseAdminClient();
  const now = new Date().toISOString();
  const adminAccessToken = input.adminAccessToken?.trim() || "";
  const clientId = input.clientId?.trim() || "";
  const clientSecret = input.clientSecret?.trim() || "";
  const isActive = Boolean(input.shopDomain.trim() && (adminAccessToken || (clientId && clientSecret)));

  const existing = await getActiveShopifyConnection();

  if (existing) {
    const updatePayload = {
      shop_domain: input.shopDomain.trim(),
      access_token: adminAccessToken || null,
      admin_access_token: adminAccessToken || null,
      client_id: clientId || null,
      client_secret: clientSecret || null,
      is_active: isActive,
      updated_at: now
    };

    let { data, error } = await supabase
      .from("stores")
      .update(updatePayload)
      .eq("id", existing.id)
      .select("*")
      .single();

    if (isMissingColumnError(error, "is_active")) {
      const { is_active: _isActive, ...fallbackPayload } = updatePayload;
      const fallbackResult = await supabase
        .from("stores")
        .update(fallbackPayload)
        .eq("id", existing.id)
        .select("*")
        .single();
      data = fallbackResult.data;
      error = fallbackResult.error;
    }

    if (error) throw new Error(`Could not update Shopify connection: ${error.message}`);
    return mapStore(data as StoreRow);
  }

  const insertPayload = {
    id: randomUUID(),
    shop_domain: input.shopDomain.trim(),
    access_token: adminAccessToken || null,
    admin_access_token: adminAccessToken || null,
    client_id: clientId || null,
    client_secret: clientSecret || null,
    is_active: isActive,
    created_at: now,
    updated_at: now
  };

  let { data, error } = await supabase
    .from("stores")
    .insert(insertPayload)
    .select("*")
    .single();

  if (isMissingColumnError(error, "is_active")) {
    const { is_active: _isActive, ...fallbackPayload } = insertPayload;
    const fallbackResult = await supabase
      .from("stores")
      .insert(fallbackPayload)
      .select("*")
      .single();
    data = fallbackResult.data;
    error = fallbackResult.error;
  }

  if (error) throw new Error(`Could not save Shopify connection: ${error.message}`);
  return mapStore(data as StoreRow);
}
