export interface GenerateProductCopyInput {
  productId: string;
  productName?: string;
  category?: string;
  imageUrls: string[];
  userNotes?: string;
}

export interface ProductCopyResult {
  title: string;
  bulletPoints: string[];
  description: string;
  tags: string[];
  faq?: Array<{
    question: string;
    answer: string;
  }>;
}

export async function generateProductCopy(
  input: GenerateProductCopyInput
): Promise<ProductCopyResult> {
  const name = input.productName || "Featured Product";
  const category = input.category || "ecommerce";

  return {
    title: `${name} for ${category} Sellers`,
    bulletPoints: [
      "Clean product presentation designed for Shopify product pages.",
      "Review-ready copy that keeps claims realistic and editable.",
      "Image set organized for main, gallery, and lifestyle placement.",
      "Draft workflow keeps publishing under your control.",
      "Tags and details structured for faster product setup."
    ],
    description: `${name} is prepared as a Shopify-ready product draft with clean imagery, benefit-led copy, and editable merchandising details.`,
    tags: [category.toLowerCase(), "shopify", "product-draft", "ai-content"],
    faq: [
      {
        question: "Can I edit this content before publishing?",
        answer: "Yes. Review and edit every generated field before creating a Shopify draft."
      }
    ]
  };
}
