import Image from "next/image";
import Link from "next/link";
import { ImageIcon } from "lucide-react";
import type { Product } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="studio-focus grid grid-cols-[88px_1fr] gap-4 border-b border-line bg-transparent py-4 transition hover:bg-white/70 sm:grid-cols-[112px_1fr_auto]"
    >
      <div className="relative h-24 overflow-hidden rounded bg-white">
        <Image
          src={product.originalImageUrl}
          alt={product.name || "Product image"}
          fill
          className="object-cover"
          sizes="112px"
        />
      </div>
      <div className="min-w-0 self-center">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate text-base font-semibold">
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
      </div>
      <div className="hidden self-center text-right text-sm text-muted sm:block">
        Updated
        <span className="block text-ink">
          {new Date(product.updatedAt).toLocaleDateString()}
        </span>
      </div>
    </Link>
  );
}
