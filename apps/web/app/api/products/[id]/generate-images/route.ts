import { after, NextResponse } from "next/server";
import {
  addGeneratedProductImages,
  addJob,
  completeImageGeneration,
  getProduct,
  updateJob
} from "@/lib/store";
import {
  OpenAIRequestError,
  generateProductImageWithOpenAI,
  getOpenAIKeyStatus
} from "@/lib/openai";
import {
  IMAGE_GENERATION_CREDIT_COST,
  grantCredits,
  getCreditAccount,
  spendCredits
} from "@/lib/credits";
import { enforceRateLimit, rateLimitHeaders } from "@/lib/rate-limit";

type ImagePrompt = {
  style: string;
  index: number;
  type: "WHITE_BACKGROUND" | "LIFESTYLE" | "PRODUCT_DETAIL" | "PRODUCT_INTRO";
  prompt: string;
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404 });

  const rateLimit = await enforceRateLimit({
    key: "image_generation",
    limit: 20,
    windowSeconds: 60 * 60
  });

  if (!rateLimit.ok) {
    return NextResponse.json(
      { error: rateLimit.error || "Image generation limit reached." },
      { status: rateLimit.userId ? 429 : 401, headers: rateLimitHeaders(rateLimit) }
    );
  }

  const body = await request.json().catch(() => ({}));
  const styles = Array.isArray(body.styles) && body.styles.length
    ? body.styles
    : ["white_background", "lifestyle_home", "product_detail", "product_intro"];
  const count = Number.isFinite(body.count) ? Math.min(Math.max(body.count, 1), 3) : 2;
  const imageBrief = [
    `Image style preset: ${product.imageStylePreset || product.style || "minimal studio"}.`,
    product.targetMarket ? `Target market: ${product.targetMarket}.` : "",
    product.brandVoice ? `Brand voice: ${product.brandVoice}.` : "",
    product.tone ? `Tone: ${product.tone}.` : "",
    product.language ? `Visible text language, if any: ${product.language}.` : ""
  ].filter(Boolean).join(" ");

  const prompts: ImagePrompt[] = styles.flatMap((style: string) => {
    const type =
      style === "white_background"
        ? ("WHITE_BACKGROUND" as const)
        : style === "product_detail"
          ? ("PRODUCT_DETAIL" as const)
          : style === "product_intro"
            ? ("PRODUCT_INTRO" as const)
            : ("LIFESTYLE" as const);
    const prompt =
      style === "white_background"
        ? `Create a clean ecommerce product photo using the uploaded product image. Keep the product shape, color, texture, logo, and visible details accurate. Place the product centered on a pure white background with soft studio lighting. Do not add extra objects. ${imageBrief}`
        : style === "product_detail"
          ? `Create a Shopify product detail page image for ${product.name || "this product"}. Use the uploaded product as the accurate source. Show close-up product details, material/fit/feature callouts, and a clean ecommerce composition. Include concise readable callout text only if it improves the image. Do not invent specifications. Keep the product logo, color, shape, and proportions accurate. ${imageBrief}`
          : style === "product_intro"
            ? `Create a product introduction image for a Shopify product page hero section for ${product.name || "this product"}. Use the uploaded product as the accurate source. Show the product clearly with a polished ecommerce layout, short intro-style headline space, premium lighting, and room for product-page copy. Keep the product accurate and do not invent specifications. ${imageBrief}`
            : `Create a realistic ecommerce lifestyle product photo using the uploaded product. Keep the product accurate and recognizable. Place it in a ${String(style).replaceAll("_", " ")} environment with natural lighting. Do not change the product design. ${imageBrief}`;

    return Array.from({ length: 1 }).map((_, index) => ({
      style,
      index,
      type,
      prompt
    }));
  });
  const creditsRequired = prompts.length * IMAGE_GENERATION_CREDIT_COST;
  const creditSpend = await spendCredits({
    amount: creditsRequired,
    reason: "image_generation",
    productId: id
  });

  if (!creditSpend.ok) {
    const message = creditSpend.error || "Not enough credits for image generation.";
    const job = await addJob(id, {
      type: "IMAGE_GENERATION",
      status: "FAILED",
      progress: 0,
      input: { styles, count, creditsRequired },
      output: {
        mode: "credits",
        note: message,
        credits: creditSpend.balance
      },
      error: message
    });

    return NextResponse.json(
      {
        jobId: job?.id,
        status: "failed",
        error: message,
        credits: {
          balance: creditSpend.balance,
          required: creditsRequired,
          isUnlimited: Boolean(creditSpend.isUnlimited)
        }
      },
      { status: 402, headers: rateLimitHeaders(rateLimit) }
    );
  }

  const credits = await getCreditAccount();
  const job = await addJob(id, {
    type: "IMAGE_GENERATION",
    status: "QUEUED",
    progress: 5,
    input: { styles, count, creditsRequired },
    output: {
      mode: "background",
      note: "Image generation queued.",
      credits: credits.balance
    },
    error: null
  });

  if (!job) {
    await grantCredits({
      amount: creditsRequired,
      reason: "image_generation_refund",
      productId: id
    }).catch(() => null);
    return NextResponse.json(
      { error: "Could not create image generation job." },
      { status: 500, headers: rateLimitHeaders(rateLimit) }
    );
  }

  after(async () => {
    await processImageGenerationJob({
      jobId: job.id,
      productId: id,
      imageUrl: product.originalImageUrl,
      styles,
      count,
      prompts,
      creditsRequired
    });
  });

  return NextResponse.json(
    {
      jobId: job?.id,
      status: "queued",
      mode: "background",
      note: "Image generation started. You can stay on this page while the job updates.",
      credits: {
        balance: credits.balance,
        spent: credits.isUnlimited ? 0 : creditsRequired,
        isUnlimited: Boolean(credits.isUnlimited)
      }
    },
    { status: 202, headers: rateLimitHeaders(rateLimit) }
  );
}

async function processImageGenerationJob({
  jobId,
  productId,
  imageUrl,
  styles,
  count,
  prompts,
  creditsRequired
}: {
  jobId: string;
  productId: string;
  imageUrl: string;
  styles: string[];
  count: number;
  prompts: ImagePrompt[];
  creditsRequired: number;
}) {
  await updateJob(jobId, {
    status: "PROCESSING",
    progress: 10,
    output: {
      mode: "background",
      note: "Generating product images.",
      total: prompts.length
    },
    error: null
  });

  let generatedImages: Array<{
    type: "WHITE_BACKGROUND" | "LIFESTYLE" | "PRODUCT_DETAIL" | "PRODUCT_INTRO";
    url: string;
    storageKey?: string;
    prompt: string;
  }> = [];

  try {
    for (const [index, item] of prompts.entries()) {
      await updateJob(jobId, {
        status: "PROCESSING",
        progress: Math.min(90, 15 + Math.round((index / Math.max(prompts.length, 1)) * 70)),
        output: {
          mode: "openai",
          note: `Generating image ${index + 1} of ${prompts.length}.`,
          total: prompts.length,
          completed: index
        },
        error: null
      });

      const generated = await generateProductImageWithOpenAI({
        productId,
        imageUrl,
        prompt: item.prompt,
        type: item.type,
        index
      });

      if (generated) {
        generatedImages.push({ ...item, ...generated });
      }
    }
  } catch (error) {
    await grantCredits({
      amount: creditsRequired,
      reason: "image_generation_refund",
      productId
    }).catch(() => null);
    const refundedCredits = await getCreditAccount();
    const message =
      error instanceof OpenAIRequestError
        ? `${error.message}${error.code ? ` (${error.code})` : ""}`
        : error instanceof Error
          ? error.message
          : "OpenAI image generation failed.";

    await updateJob(jobId, {
      status: "FAILED",
      progress: 100,
      output: {
        mode: "openai",
        note: message,
        credits: refundedCredits.balance,
        refunded: creditsRequired
      },
      error: message
    });
    return;
  }

  try {
    const usedOpenAI = generatedImages.length > 0;
    const images = usedOpenAI
      ? await addGeneratedProductImages(productId, generatedImages)
      : await completeImageGeneration(productId, styles, count);

    const keyStatus = getOpenAIKeyStatus();
    const note = usedOpenAI ? "Generated with OpenAI image API." : keyStatus.message;
    const credits = await getCreditAccount();
    await updateJob(jobId, {
      status: "COMPLETED",
      progress: 100,
      output: {
        mode: usedOpenAI ? "openai" : "local-simulation",
        note,
        credits: credits.balance,
        generatedImageCount: images?.length ?? 0
      },
      error: null
    });
  } catch (error) {
    await grantCredits({
      amount: creditsRequired,
      reason: "image_generation_refund",
      productId
    }).catch(() => null);
    const refundedCredits = await getCreditAccount();
    const message = error instanceof Error ? error.message : "Could not save generated images.";
    await updateJob(jobId, {
      status: "FAILED",
      progress: 100,
      output: {
        mode: "storage",
        note: message,
        credits: refundedCredits.balance,
        refunded: creditsRequired
      },
      error: message
    });
  }
}
