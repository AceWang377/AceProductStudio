export type ProductStatus = "DRAFT" | "GENERATING" | "READY" | "PUBLISHED" | "FAILED";
export type ShopifyStatus =
  | "NOT_CONNECTED"
  | "READY_TO_PUBLISH"
  | "PUBLISHED_AS_DRAFT"
  | "PUBLISHED_LIVE"
  | "FAILED";
export type ProductImageType =
  | "ORIGINAL"
  | "CUTOUT"
  | "WHITE_BACKGROUND"
  | "LIFESTYLE"
  | "PRODUCT_DETAIL"
  | "PRODUCT_INTRO"
  | "REFERENCE_STYLE";
export type JobType = "IMAGE_GENERATION" | "COPY_GENERATION" | "SHOPIFY_PUBLISH";
export type JobStatus = "QUEUED" | "PROCESSING" | "COMPLETED" | "FAILED";
export type ShopifyWebhookStatus = "not_configured" | "registered" | "already_registered" | "warning";

export interface ProductImage {
  id: string;
  productId: string;
  type: ProductImageType;
  url: string;
  storageKey?: string;
  prompt?: string;
  isSelected: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface GenerationJob {
  id: string;
  productId: string;
  type: JobType;
  status: JobStatus;
  progress: number;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name?: string;
  category?: string;
  style?: string;
  targetMarket?: string;
  tone?: string;
  seoKeywords: string[];
  language?: string;
  brandVoice?: string;
  imageStylePreset?: string;
  status: ProductStatus;
  originalImageUrl: string;
  backgroundRemovedImageUrl?: string;
  title?: string;
  description?: string;
  bulletPoints: string[];
  tags: string[];
  faq: Array<{ question: string; answer: string }>;
  price?: string;
  compareAtPrice?: string;
  sku?: string;
  inventoryQuantity?: number;
  trackInventory?: boolean;
  shopifyProductId?: string;
  shopifyStatus: ShopifyStatus;
  images: ProductImage[];
  jobs: GenerationJob[];
  createdAt: string;
  updatedAt: string;
}

export interface ShopifyConnection {
  id: string;
  shopDomain: string;
  adminAccessToken?: string;
  clientId?: string;
  clientSecret?: string;
  accessTokenHint: string;
  clientIdHint?: string;
  clientSecretHint?: string;
  webhookStatus: ShopifyWebhookStatus;
  webhookSubscriptionId?: string;
  webhookCallbackUrl?: string;
  webhookLastRegisteredAt?: string;
  webhookLastError?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AppState {
  products: Product[];
  shopifyConnection?: ShopifyConnection;
}
