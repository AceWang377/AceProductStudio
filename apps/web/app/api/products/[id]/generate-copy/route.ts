import { NextResponse } from "next/server";
import { addJob, applyGeneratedCopy, completeCopyGeneration, getProduct } from "@/lib/store";
import { generateProductCopyWithOpenAI, getOpenAIKeyStatus } from "@/lib/openai";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404 });

  const generatedCopy = await generateProductCopyWithOpenAI({
    imageUrl: product.originalImageUrl,
    name: product.name,
    category: product.category,
    style: product.style
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

  return NextResponse.json({
    jobId: job?.id,
    status: "completed",
    mode: generatedCopy ? "openai" : "local-simulation",
    note: generatedCopy ? "Generated with OpenAI text model." : keyStatus.message,
    product: updated
  });
}
