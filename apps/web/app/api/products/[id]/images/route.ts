import { NextResponse } from "next/server";
import { reorderProductImages } from "@/lib/store";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const orderedImageIds = Array.isArray(body.orderedImageIds)
    ? body.orderedImageIds.filter((item: unknown): item is string => typeof item === "string")
    : [];

  if (!orderedImageIds.length) {
    return NextResponse.json({ error: "orderedImageIds is required." }, { status: 400 });
  }

  const product = await reorderProductImages(id, orderedImageIds);
  if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404 });

  return NextResponse.json(product);
}
