export interface BriefPreset {
  id: string;
  label: string;
  category: string;
  imageStylePreset: string;
  targetMarket: string;
  tone: string;
  seoKeywords: string[];
  brandVoice: string;
}

export const imageStyleOptions = [
  "minimal studio",
  "modern home",
  "luxury product",
  "outdoor lifestyle",
  "streetwear editorial",
  "clean marketplace"
];

export const toneOptions = [
  "clear and trustworthy",
  "premium and concise",
  "friendly and practical",
  "bold and trend-led",
  "minimal and editorial"
];

export const briefPresets: BriefPreset[] = [
  {
    id: "clean-marketplace",
    label: "Clean marketplace",
    category: "General ecommerce",
    imageStylePreset: "clean marketplace",
    targetMarket: "online shoppers comparing products quickly",
    tone: "clear and trustworthy",
    seoKeywords: ["shopify product", "online store", "customer ready"],
    brandVoice: "Clear, accurate, benefit-led, and easy to scan. Avoid exaggerated claims."
  },
  {
    id: "premium-fashion",
    label: "Premium fashion",
    category: "Apparel and accessories",
    imageStylePreset: "streetwear editorial",
    targetMarket: "style-conscious fashion shoppers",
    tone: "minimal and editorial",
    seoKeywords: ["fashion", "outfit essential", "premium style"],
    brandVoice: "Concise, confident, editorial, and product-led. Keep claims grounded in visible details."
  },
  {
    id: "home-lifestyle",
    label: "Home lifestyle",
    category: "Home and living",
    imageStylePreset: "modern home",
    targetMarket: "home decor and everyday lifestyle buyers",
    tone: "friendly and practical",
    seoKeywords: ["home decor", "everyday home", "lifestyle product"],
    brandVoice: "Warm, useful, and practical. Highlight how the product fits into everyday spaces."
  },
  {
    id: "giftable-product",
    label: "Giftable product",
    category: "Gifts and accessories",
    imageStylePreset: "luxury product",
    targetMarket: "gift buyers looking for polished, ready-to-give products",
    tone: "premium and concise",
    seoKeywords: ["gift idea", "premium gift", "thoughtful present"],
    brandVoice: "Polished and concise. Emphasize presentation, usefulness, and gift appeal without overpromising."
  },
  {
    id: "outdoor-utility",
    label: "Outdoor utility",
    category: "Outdoor lifestyle",
    imageStylePreset: "outdoor lifestyle",
    targetMarket: "outdoor, travel, and practical gear shoppers",
    tone: "friendly and practical",
    seoKeywords: ["outdoor gear", "travel essential", "practical accessory"],
    brandVoice: "Practical, durable-sounding, and straightforward. Focus on visible use cases and avoid unsupported performance claims."
  }
];
