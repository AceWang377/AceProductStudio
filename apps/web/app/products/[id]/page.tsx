import { notFound } from "next/navigation";
import { getProduct } from "@/lib/store";
import { ProductWorkspace } from "@/components/product/ProductWorkspace";

export default async function ProductDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string | string[] }>;
}) {
  const { id } = await params;
  const paramsQuery = await searchParams;
  const product = await getProduct(id);
  if (!product) notFound();

  return <ProductWorkspace initialProduct={product} initialTab={firstParam(paramsQuery.tab)} />;
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
