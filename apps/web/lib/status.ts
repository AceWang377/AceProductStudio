import type { JobStatus, JobType, ProductImageType, ProductStatus, ShopifyStatus } from "./types";

export function statusLabel(status: ProductStatus | ShopifyStatus | JobStatus | JobType) {
  return status
    .split("_")
    .map((word) => word[0] + word.slice(1).toLowerCase())
    .join(" ");
}

export function imageTypeLabel(type: ProductImageType) {
  const labels: Record<ProductImageType, string> = {
    ORIGINAL: "Original",
    CUTOUT: "Cutout",
    WHITE_BACKGROUND: "White background",
    LIFESTYLE: "Lifestyle",
    PRODUCT_DETAIL: "Product detail",
    PRODUCT_INTRO: "Product intro",
    REFERENCE_STYLE: "Reference style"
  };

  return labels[type];
}
