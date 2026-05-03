import type { Product } from "@/lib/types";

export interface LatestShopifyPublish {
  adminUrl: string;
  publishedAt: string;
  uploadedImageCount?: number;
  handle?: string;
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
