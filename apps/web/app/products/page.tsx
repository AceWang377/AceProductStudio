import Link from "next/link";
import { Plus } from "lucide-react";
import { listProducts } from "@/lib/store";
import { ProductList } from "@/components/product/ProductList";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await listProducts();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted">Draft management</p>
          <h1 className="text-3xl font-semibold">Products</h1>
        </div>
        <Link
          href="/products/new"
          className="studio-focus inline-flex h-10 items-center gap-2 rounded bg-action px-4 text-sm font-semibold text-white"
        >
          <Plus className="h-4 w-4" aria-hidden />
          New
        </Link>
      </div>
      {products.length ? (
        <ProductList products={products} />
      ) : (
        <div className="border border-line bg-white p-8 text-sm text-muted">
          No product drafts yet.
        </div>
      )}
    </div>
  );
}
