import { notFound } from "next/navigation";
import { getProduct } from "@/lib/store";
import { ProductWorkspace } from "@/components/product/ProductWorkspace";

export default async function ProductDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  return <ProductWorkspace initialProduct={product} />;
}
