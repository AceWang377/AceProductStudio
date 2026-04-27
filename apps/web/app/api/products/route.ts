import { NextResponse } from "next/server";
import { createProduct, listProducts } from "@/lib/store";
import { analyzeProductImage } from "@/lib/openai";

export async function GET() {
  return NextResponse.json(await listProducts());
}

export async function POST(request: Request) {
  const body = await request.json();
  if (!body.originalImageUrl) {
    return NextResponse.json({ error: "originalImageUrl is required." }, { status: 400 });
  }

  const analysis = await analyzeProductImage(body.originalImageUrl);
  const product = await createProduct({
    name: body.name || analysis?.name,
    category: body.category || analysis?.category,
    style: body.style || analysis?.style,
    notes: analysis?.notes,
    originalImageUrl: body.originalImageUrl,
    storageKey: body.storageKey
  });
  return NextResponse.json(product, { status: 201 });
}
