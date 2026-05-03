import { randomUUID } from "crypto";
import { readFileSync } from "fs";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

type ProductAnalysis = {
  name: string;
  category: string;
  style: string;
  notes: string;
};

export type GeneratedProductCopy = {
  title: string;
  bulletPoints: string[];
  description: string;
  tags: string[];
  faq: Array<{ question: string; answer: string }>;
};

const openAIBaseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";

function readLocalEnvValue(name: string) {
  const candidates = [
    path.join(process.cwd(), ".env.local"),
    path.join(process.cwd(), "../..", ".env.local")
  ];

  for (const filePath of candidates) {
    try {
      const env = readFileSync(filePath, "utf8");
      const match = env.match(new RegExp(`^${name}=(.*)$`, "m"));
      if (!match) continue;
      return match[1].trim().replace(/^["']|["']$/g, "");
    } catch {
      // Missing env files are fine; fall back to process.env.
    }
  }

  return undefined;
}

function getConfigValue(name: string): string | undefined;
function getConfigValue(name: string, fallback: string): string;
function getConfigValue(name: string, fallback?: string) {
  return readLocalEnvValue(name) || process.env[name]?.trim() || fallback;
}

export class OpenAIRequestError extends Error {
  status: number;
  code?: string;
  type?: string;

  constructor(message: string, options: { status: number; code?: string; type?: string }) {
    super(message);
    this.name = "OpenAIRequestError";
    this.status = options.status;
    this.code = options.code;
    this.type = options.type;
  }
}

function getOpenAIKey() {
  return getConfigValue("OPENAI_API_KEY");
}

export function getOpenAIKeyStatus() {
  const key = getOpenAIKey();
  if (!key) {
    return {
      configured: false,
      officialOpenAIShape: false,
      message: "OPENAI_API_KEY is not configured."
    };
  }

  const isOpenRouterStyle = key.startsWith("sk-or-");
  return {
    configured: true,
    officialOpenAIShape: key.startsWith("sk-") && !isOpenRouterStyle,
    message: isOpenRouterStyle
      ? "The configured key looks like an OpenRouter key, not an official OpenAI API key."
      : "OPENAI_API_KEY is configured."
  };
}

function publicUrlToFilePath(url: string) {
  if (!url.startsWith("/uploads/")) {
    throw new Error("Only local uploaded images can be sent to OpenAI from this MVP.");
  }
  return path.join(process.cwd(), "public", url);
}

async function fileToDataUrl(url: string) {
  const filePath = publicUrlToFilePath(url);
  const bytes = await readFile(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const mime =
    ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";
  return `data:${mime};base64,${bytes.toString("base64")}`;
}

function outputText(response: { output_text?: string; output?: Array<{ content?: Array<{ text?: string }> }> }) {
  if (response.output_text) return response.output_text;
  return (
    response.output
      ?.flatMap((item) => item.content ?? [])
      .map((content) => content.text)
      .filter(Boolean)
      .join("\n") ?? ""
  );
}

function getTextModelCandidates() {
  return Array.from(
    new Set([
      getConfigValue("OPENAI_TEXT_MODEL", "gpt-5.3"),
      "gpt-5.5",
      "gpt-5.2",
      "gpt-5.1"
    ])
  );
}

export async function analyzeProductImage(imageUrl: string): Promise<ProductAnalysis | null> {
  const key = getOpenAIKey();
  if (!key || key.startsWith("sk-or-")) return null;

  const imageDataUrl = await fileToDataUrl(imageUrl);
  let response: Response | null = null;
  for (const model of getTextModelCandidates()) {
    response = await fetch(`${openAIBaseUrl}/responses`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text:
                  "Identify the ecommerce product in this image. Return compact JSON only with keys: name, category, style, notes. Do not invent technical specs."
              },
              {
                type: "input_image",
                image_url: imageDataUrl
              }
            ]
          }
        ]
      })
    });
    if (response.ok) break;
    const errorText = await response.clone().text();
    if (!errorText.includes("model_not_found")) break;
  }

  if (!response?.ok) return null;

  const payload = await response.json();
  const text = outputText(payload);
  const cleaned = text.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
  try {
    const parsed = JSON.parse(cleaned) as Partial<ProductAnalysis>;
    if (!parsed.name || !parsed.category) return null;
    return {
      name: parsed.name,
      category: parsed.category,
      style: parsed.style || "minimal studio",
      notes: parsed.notes || ""
    };
  } catch {
    return null;
  }
}

export async function generateProductCopyWithOpenAI(input: {
  imageUrl: string;
  name?: string;
  category?: string;
  style?: string;
  targetMarket?: string;
  tone?: string;
  seoKeywords?: string[];
  language?: string;
  brandVoice?: string;
  imageStylePreset?: string;
}): Promise<GeneratedProductCopy | null> {
  const key = getOpenAIKey();
  if (!key || key.startsWith("sk-or-")) return null;

  const imageDataUrl = await fileToDataUrl(input.imageUrl);
  let response: Response | null = null;
  for (const model of getTextModelCandidates()) {
    response = await fetch(`${openAIBaseUrl}/responses`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `You are a senior Shopify SEO copywriter.

Use the product image as the source of truth. Generate search-friendly product content for a Shopify product page and Google Shopping-style discovery.

Known draft data:
- Product name: ${input.name || "infer from image"}
- Category: ${input.category || "infer from image"}
- Image style preset: ${input.imageStylePreset || input.style || "infer from image"}
- Target market: ${input.targetMarket || "general online shoppers"}
- Tone: ${input.tone || "clear and trustworthy"}
- SEO keywords to prioritize: ${input.seoKeywords?.length ? input.seoKeywords.join(", ") : "infer from product"}
- Language: ${input.language || "English"}
- Brand voice: ${input.brandVoice || "plain, accurate, benefit-led, no exaggerated claims"}

If the known draft data is generic, such as "Uploaded product", "General ecommerce", or "infer from image", ignore it and infer the product from the image.

Return compact JSON only with this schema:
{
  "title": "SEO optimized Shopify product title",
  "bulletPoints": ["benefit-focused bullet 1", "benefit-focused bullet 2", "benefit-focused bullet 3", "benefit-focused bullet 4", "benefit-focused bullet 5"],
  "description": "120-180 word Shopify product description",
  "tags": ["tag1", "tag2", "tag3"],
  "faq": [{"question": "Question?", "answer": "Answer."}]
}

SEO rules:
- Title must be 55-75 characters when possible.
- Title must include the strongest visible product keyword, product type, brand only if visible, color, and primary use case.
- Never use filler phrases like "Uploaded product", "General ecommerce", "for sellers", "AI", "Shopify-ready", or "product draft" in customer-facing copy.
- Tags must be 12-18 short buyer search phrases, lowercase, comma-ready, and specific.
- Tags should include visible brand if present, product type, color, material or fit if visible, style, audience, occasion, and use cases.
- Use the requested language, tone, target market, SEO keywords, and brand voice when they are provided.
- Do not include operational tags like "shopify", "ai-content", "product-draft", or "ecommerce".
- Bullet points should describe visible features and customer benefits without hype.
- Avoid false claims. Do not invent exact size, fabric, condition, performance, or technical specs unless visible or provided.
- Keep copy realistic, compliant, and ready to edit.`
            },
            {
              type: "input_image",
              image_url: imageDataUrl
            }
          ]
        }
        ]
      })
    });
    if (response.ok) break;
    const errorText = await response.clone().text();
    if (!errorText.includes("model_not_found")) break;
  }

  if (!response?.ok) return null;

  const payload = await response.json();
  const text = outputText(payload);
  const cleaned = text.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();

  try {
    const parsed = JSON.parse(cleaned) as Partial<GeneratedProductCopy>;
    if (!parsed.title || !parsed.description) return null;
    return {
      title: parsed.title,
      bulletPoints: Array.isArray(parsed.bulletPoints) ? parsed.bulletPoints.slice(0, 5) : [],
      description: parsed.description,
      tags: Array.isArray(parsed.tags) ? parsed.tags : [],
      faq: Array.isArray(parsed.faq) ? parsed.faq : []
    };
  } catch {
    return null;
  }
}

export async function generateProductImageWithOpenAI(input: {
  productId: string;
  imageUrl: string;
  prompt: string;
  type: "WHITE_BACKGROUND" | "LIFESTYLE" | "PRODUCT_DETAIL" | "PRODUCT_INTRO";
  index: number;
}) {
  const key = getOpenAIKey();
  if (!key || key.startsWith("sk-or-")) return null;

  const originalPath = publicUrlToFilePath(input.imageUrl);
  const originalBytes = await readFile(originalPath);
  const blob = new Blob([originalBytes], {
    type: path.extname(originalPath).toLowerCase() === ".png" ? "image/png" : "image/jpeg"
  });
  const formData = new FormData();
  formData.set("model", getConfigValue("OPENAI_IMAGE_MODEL", "gpt-image-2"));
  formData.set("image", blob, path.basename(originalPath));
  formData.set("prompt", input.prompt);
  formData.set("size", "1024x1024");

  const response = await fetch(`${openAIBaseUrl}/images/edits`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`
    },
    body: formData
  });

  if (!response.ok) {
    const text = await response.text();
    let message = `OpenAI image generation failed with status ${response.status}.`;
    let code: string | undefined;
    let type: string | undefined;
    try {
      const parsed = JSON.parse(text) as {
        error?: { message?: string; code?: string; type?: string };
      };
      message = parsed.error?.message || message;
      code = parsed.error?.code;
      type = parsed.error?.type;
    } catch {
      if (text) message = text.slice(0, 500);
    }
    throw new OpenAIRequestError(message, { status: response.status, code, type });
  }

  const payload = (await response.json()) as { data?: Array<{ b64_json?: string }> };
  const base64 = payload.data?.[0]?.b64_json;
  if (!base64) return null;

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  const keyName = `${input.productId}-${input.type.toLowerCase()}-${input.index}-${randomUUID()}.png`;
  const filePath = path.join(uploadDir, keyName);
  await writeFile(filePath, Buffer.from(base64, "base64"));

  return {
    url: `/uploads/${keyName}`,
    storageKey: `uploads/${keyName}`
  };
}
