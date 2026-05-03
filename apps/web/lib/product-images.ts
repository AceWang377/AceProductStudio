import type { ProductImage } from "./types";

export function getOrderedPublishImages(images: ProductImage[]) {
  const publishable = images.filter((image) => image.type !== "ORIGINAL");
  const hasManualCover = publishable.some((image) => image.isSelected && image.sortOrder === 1);

  return [...publishable].sort((a, b) => {
    if (hasManualCover) {
      if (a.isSelected && a.sortOrder === 1) return -1;
      if (b.isSelected && b.sortOrder === 1) return 1;
      return a.sortOrder - b.sortOrder;
    }

    if (a.type === "LIFESTYLE" && b.type !== "LIFESTYLE") return -1;
    if (a.type !== "LIFESTYLE" && b.type === "LIFESTYLE") return 1;
    if (a.type === "WHITE_BACKGROUND" && b.type !== "WHITE_BACKGROUND") return 1;
    if (a.type !== "WHITE_BACKGROUND" && b.type === "WHITE_BACKGROUND") return -1;
    return a.sortOrder - b.sortOrder;
  });
}

export function getOrderedMediaImages(images: ProductImage[]) {
  const publishable = getOrderedPublishImages(images);
  return [
    ...publishable,
    ...images
      .filter((image) => image.type === "ORIGINAL")
      .sort((a, b) => a.sortOrder - b.sortOrder)
  ];
}
