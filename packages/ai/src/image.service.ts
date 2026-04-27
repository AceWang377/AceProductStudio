export type ImageGenerationStyle =
  | "white_background"
  | "lifestyle_home"
  | "minimal"
  | "luxury"
  | "outdoor"
  | "tiktok_style"
  | "product_detail"
  | "product_intro"
  | "reference_style";

export interface GenerateWhiteBackgroundInput {
  productId: string;
  imageUrl: string;
}

export interface GenerateLifestyleImagesInput {
  productId: string;
  imageUrl: string;
  style: ImageGenerationStyle;
  count: number;
}

export interface GenerateReferenceStyleImageInput {
  productId: string;
  productImageUrl: string;
  referenceImageUrl: string;
}

export interface GeneratedImageResult {
  url: string;
  storageKey: string;
  prompt: string;
  type: string;
}

export async function generateWhiteBackgroundImage(
  input: GenerateWhiteBackgroundInput
): Promise<GeneratedImageResult> {
  return {
    url: input.imageUrl,
    storageKey: `products/${input.productId}/white-background-local.png`,
    prompt:
      "Create a clean ecommerce product photo using the uploaded product image on a pure white background.",
    type: "WHITE_BACKGROUND"
  };
}

export async function generateLifestyleImages(
  input: GenerateLifestyleImagesInput
): Promise<GeneratedImageResult[]> {
  return Array.from({ length: input.count }).map((_, index) => ({
    url: input.imageUrl,
    storageKey: `products/${input.productId}/lifestyle-${index + 1}-local.png`,
    prompt: `Create a realistic ecommerce lifestyle product photo in ${input.style} style.`,
    type: "LIFESTYLE"
  }));
}

export async function generateReferenceStyleImage(
  input: GenerateReferenceStyleImageInput
): Promise<GeneratedImageResult> {
  return {
    url: input.productImageUrl,
    storageKey: `products/${input.productId}/reference-style-local.png`,
    prompt:
      "Use the first image as the actual product and the second image only as lighting, composition, and mood reference.",
    type: "REFERENCE_STYLE"
  };
}
