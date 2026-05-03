import Image from "next/image";
import Link from "next/link";
import { Check, ImageIcon } from "lucide-react";
import type { Product } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";

export function ProductCard({
  product,
  selected = false,
  onSelectionChange
}: {
  product: Product;
  selected?: boolean;
  onSelectionChange?: (productId: string, selected: boolean) => void;
}) {
  return (
    <div className="grid grid-cols-[40px_88px_1fr] gap-4 border-b border-line bg-transparent py-4 transition hover:bg-white/70 sm:grid-cols-[40px_112px_1fr_auto]">
      <div className="flex items-center justify-center">
        {onSelectionChange ? (
          <button
            type="button"
            onClick={() => onSelectionChange(product.id, !selected)}
            aria-pressed={selected}
            aria-label={`Select ${product.title || product.name || "product"}`}
            className={`studio-focus inline-flex h-6 w-6 items-center justify-center rounded border transition ${
              selected
                ? "border-action bg-action text-white"
                : "border-line bg-white text-transparent hover:border-action"
            }`}
          >
            <Check className="h-4 w-4" aria-hidden />
          </button>
        ) : null}
      </div>
      <Link href={`/products/${product.id}`} className="studio-focus relative h-24 overflow-hidden rounded bg-white">
        <Image
          src={product.originalImageUrl}
          alt={product.name || "Product image"}
          fill
          className="object-cover"
          sizes="112px"
        />
      </Link>
      <Link href={`/products/${product.id}`} className="studio-focus min-w-0 self-center">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <h3 className="min-w-0 truncate text-base font-semibold">
            {product.title || product.name || "Untitled product"}
          </h3>
          <StatusBadge status={product.status} />
        </div>
        <p className="mt-1 text-sm text-muted">
          {product.category || "No category"} · {new Date(product.createdAt).toLocaleDateString()}
        </p>
        <p className="mt-2 inline-flex items-center gap-2 text-sm text-muted">
          <ImageIcon className="h-4 w-4" aria-hidden />
          {product.images.length} images · Shopify {product.shopifyStatus.toLowerCase().replaceAll("_", " ")}
        </p>
      </Link>
      <Link href={`/products/${product.id}`} className="studio-focus hidden self-center text-right text-sm text-muted sm:block">
        Updated
        <span className="block text-ink">
          {new Date(product.updatedAt).toLocaleDateString()}
        </span>
      </Link>
    </div>
  );
}
