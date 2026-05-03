import type { Product } from "@/lib/types";

export interface LatestShopifyPublish {
  adminUrl: string;
  publishedAt: string;
  uploadedImageCount?: number;
  handle?: string;
}

export interface ShopifyPublishEvent {
  id: string;
  status: "COMPLETED" | "FAILED";
  mode: "Draft" | "Live" | "Unknown";
  updatedAt: string;
  adminUrl?: string;
  uploadedImageCount?: number;
  skippedImageCount: number;
  handle?: string;
  error?: string;
}

export function getLatestShopifyPublish(product: Product): LatestShopifyPublish | undefined {
  const job = [...product.jobs]
    .filter((item) => item.type === "SHOPIFY_PUBLISH" && item.status === "COMPLETED")
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))[0];

  const adminUrl = typeof job?.output?.adminUrl === "string" ? job.output.adminUrl : "";
  if (!job || !adminUrl) return undefined;

  return {
    adminUrl,
    publishedAt: job.updatedAt,
    uploadedImageCount:
      typeof job.output?.uploadedImageCount === "number" ? job.output.uploadedImageCount : undefined,
    handle: typeof job.output?.handle === "string" ? job.output.handle : undefined
  };
}

export function getShopifyPublishEvents(product: Product, limit = 5): ShopifyPublishEvent[] {
  return [...product.jobs]
    .filter((job) => job.type === "SHOPIFY_PUBLISH")
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
    .slice(0, limit)
    .map((job) => {
      const publishedPublicationCount =
        typeof job.output?.publishedPublicationCount === "number"
          ? job.output.publishedPublicationCount
          : undefined;
      const skippedImageUrls = Array.isArray(job.output?.skippedImageUrls)
        ? job.output.skippedImageUrls
        : [];

      return {
        id: job.id,
        status: job.status === "COMPLETED" ? "COMPLETED" : "FAILED",
        mode:
          publishedPublicationCount === undefined
            ? "Unknown"
            : publishedPublicationCount > 0
              ? "Live"
              : "Draft",
        updatedAt: job.updatedAt,
        adminUrl: typeof job.output?.adminUrl === "string" ? job.output.adminUrl : undefined,
        uploadedImageCount:
          typeof job.output?.uploadedImageCount === "number"
            ? job.output.uploadedImageCount
            : undefined,
        skippedImageCount: skippedImageUrls.length,
        handle: typeof job.output?.handle === "string" ? job.output.handle : undefined,
        error: job.error || undefined
      };
    });
}
