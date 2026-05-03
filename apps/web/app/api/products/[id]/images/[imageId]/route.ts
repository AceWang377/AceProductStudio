import { NextResponse } from "next/server";
import { deleteProductImage, setProductImageCover } from "@/lib/store";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  const { id, imageId } = await params;
  const body = await request.json().catch(() => ({}));

  if (body.action !== "cover") {
    return NextResponse.json({ error: "Unsupported image action." }, { status: 400 });
  }

  const product = await setProductImageCover(id, imageId);
  if (!product) return NextResponse.json({ error: "Product image not found." }, { status: 404 });

  return NextResponse.json(product);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  const { id, imageId } = await params;
  const product = await deleteProductImage(id, imageId);
  if (!product) return NextResponse.json({ error: "Product image not found." }, { status: 404 });

  return NextResponse.json(product);
}
