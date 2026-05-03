import { NextResponse } from "next/server";
import { addJob, applyGeneratedCopy, completeCopyGeneration, getProduct } from "@/lib/store";
import { generateProductCopyWithOpenAI, getOpenAIKeyStatus } from "@/lib/openai";
import { enforceRateLimit, rateLimitHeaders } from "@/lib/rate-limit";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404 });

  const rateLimit = await enforceRateLimit({
    key: "copy_generation",
    limit: 40,
    windowSeconds: 60 * 60
  });

  if (!rateLimit.ok) {
    return NextResponse.json(
      { error: rateLimit.error || "Copy generation limit reached." },
      { status: rateLimit.userId ? 429 : 401, headers: rateLimitHeaders(rateLimit) }
    );
  }

  const generatedCopy = await generateProductCopyWithOpenAI({
    imageUrl: product.originalImageUrl,
    name: product.name,
    category: product.category,
    style: product.style,
    targetMarket: product.targetMarket,
    tone: product.tone,
    seoKeywords: product.seoKeywords,
    language: product.language,
    brandVoice: product.brandVoice,
    imageStylePreset: product.imageStylePreset
  });
  const updated = generatedCopy
    ? await applyGeneratedCopy(id, generatedCopy)
    : await completeCopyGeneration(id);
  const keyStatus = getOpenAIKeyStatus();
  const job = await addJob(id, {
    type: "COPY_GENERATION",
    status: "COMPLETED",
    progress: 100,
    input: { productName: product.name, category: product.category },
    output: {
      mode: generatedCopy ? "openai" : "local-simulation",
      note: generatedCopy ? "Generated with OpenAI text model." : keyStatus.message
    },
    error: null
  });

  return NextResponse.json(
    {
      jobId: job?.id,
      status: "completed",
      mode: generatedCopy ? "openai" : "local-simulation",
      note: generatedCopy ? "Generated with OpenAI text model." : keyStatus.message,
      product: updated
    },
    { headers: rateLimitHeaders(rateLimit) }
  );
}
