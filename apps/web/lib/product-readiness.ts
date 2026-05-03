import type { Product, ProductImage } from "@/lib/types";
import { getOrderedPublishImages } from "@/lib/product-images";

export type ReadinessGroup = "connection" | "media" | "copy" | "commerce";
export type ReadinessTab = "brief" | "media" | "copy" | "commerce" | "publish";

export interface ReadinessItem {
  id: string;
  group: ReadinessGroup;
  label: string;
  detail: string;
  complete: boolean;
  weight: number;
  tab: ReadinessTab;
}

export interface ProductReadiness {
  score: number;
  completedWeight: number;
  totalWeight: number;
  level: "Needs work" | "Almost ready" | "Ready";
  items: ReadinessItem[];
  nextItem?: ReadinessItem;
}

export function getProductReadiness({
  product,
  publishImages,
  shopifyConnected
}: {
  product: Product;
  publishImages?: ProductImage[];
  shopifyConnected: boolean | null;
}): ProductReadiness {
  const orderedImages = publishImages ?? getOrderedPublishImages(product.images);
  const hasGeneratedImages = orderedImages.length >= 4;
  const coverImage = orderedImages[0];
  const hasLifestyleCover = Boolean(coverImage && coverImage.type !== "WHITE_BACKGROUND");
  const hasWhiteBackground = orderedImages.some((image) => image.type === "WHITE_BACKGROUND");
  const titleLength = product.title?.trim().length ?? 0;
  const descriptionLength = product.description?.trim().length ?? 0;
  const priceValue = Number.parseFloat(product.price ?? "");
  const hasValidPrice = Number.isFinite(priceValue) && priceValue > 0;
  const hasInventoryDecision = product.trackInventory
    ? product.inventoryQuantity !== undefined && product.inventoryQuantity >= 0
    : true;

  const items: ReadinessItem[] = [
    {
      id: "shopify",
      group: "connection",
      label: "Shopify store connected",
      complete: Boolean(shopifyConnected),
      detail:
        shopifyConnected === null
          ? "Checking connection"
          : shopifyConnected
            ? "Store is ready for publishing"
            : "Connect a store before publishing",
      weight: 10,
      tab: "publish"
    },
    {
      id: "media-count",
      group: "media",
      label: "Four generated publish images",
      complete: hasGeneratedImages,
      detail: `${orderedImages.length}/4 generated images ready`,
      weight: 16,
      tab: "media"
    },
    {
      id: "cover",
      group: "media",
      label: "Strong Shopify cover image",
      complete: hasLifestyleCover,
      detail: hasLifestyleCover
        ? "First image is a generated product visual"
        : "Set a lifestyle or product image as the first image",
      weight: 8,
      tab: "media"
    },
    {
      id: "white-background",
      group: "media",
      label: "White-background product image",
      complete: hasWhiteBackground,
      detail: hasWhiteBackground
        ? "Clean ecommerce image is included"
        : "Generate or keep a white-background image",
      weight: 6,
      tab: "media"
    },
    {
      id: "title",
      group: "copy",
      label: "SEO title",
      complete: titleLength >= 35 && titleLength <= 90,
      detail: titleLength
        ? `${titleLength} characters; aim for 35-90`
        : "Generate or write a product title",
      weight: 10,
      tab: "copy"
    },
    {
      id: "description",
      group: "copy",
      label: "Product description",
      complete: descriptionLength >= 180,
      detail: descriptionLength
        ? `${descriptionLength} characters; aim for 180+`
        : "Generate or write a product description",
      weight: 12,
      tab: "copy"
    },
    {
      id: "bullets",
      group: "copy",
      label: "Benefit bullets",
      complete: product.bulletPoints.length >= 3,
      detail: `${product.bulletPoints.length}/3 bullets ready`,
      weight: 8,
      tab: "copy"
    },
    {
      id: "tags",
      group: "copy",
      label: "Shopify tags",
      complete: product.tags.length >= 5,
      detail: `${product.tags.length}/5 tags ready`,
      weight: 7,
      tab: "copy"
    },
    {
      id: "faq",
      group: "copy",
      label: "FAQ content",
      complete: product.faq.length >= 2,
      detail: `${product.faq.length}/2 FAQ answers ready`,
      weight: 5,
      tab: "copy"
    },
    {
      id: "price",
      group: "commerce",
      label: "Valid price",
      complete: hasValidPrice,
      detail: hasValidPrice ? product.price! : "Set a price greater than 0",
      weight: 12,
      tab: "commerce"
    },
    {
      id: "inventory",
      group: "commerce",
      label: "Inventory decision",
      complete: hasInventoryDecision,
      detail: product.trackInventory
        ? `${product.inventoryQuantity ?? 0} units tracked`
        : "Inventory tracking is off",
      weight: 6,
      tab: "commerce"
    }
  ];

  const totalWeight = items.reduce((total, item) => total + item.weight, 0);
  const completedWeight = items
    .filter((item) => item.complete)
    .reduce((total, item) => total + item.weight, 0);
  const score = Math.round((completedWeight / totalWeight) * 100);

  return {
    score,
    completedWeight,
    totalWeight,
    level: score >= 90 ? "Ready" : score >= 70 ? "Almost ready" : "Needs work",
    items,
    nextItem: items.find((item) => !item.complete)
  };
}
