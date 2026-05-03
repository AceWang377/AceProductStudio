import Image from "next/image";
import Link from "next/link";
import { Check, ExternalLink, ImageIcon } from "lucide-react";
import type { Product } from "@/lib/types";
import type { ProductReadiness } from "@/lib/product-readiness";
import { getLatestShopifyPublish } from "@/lib/shopify-publish-history";
import { StatusBadge } from "./StatusBadge";

export function ProductCard({
  product,
  readiness,
  selected = false,
  onSelectionChange
}: {
  product: Product;
  readiness?: ProductReadiness;
  selected?: boolean;
  onSelectionChange?: (productId: string, selected: boolean) => void;
}) {
  const nextItem = readiness?.nextItem;
  const latestShopifyPublish = getLatestShopifyPublish(product);

  return (
    <div className="grid grid-cols-[40px_88px_1fr] gap-4 border-b border-line bg-transparent py-4 transition hover:bg-white/70 sm:grid-cols-[40px_112px_1fr_170px]">
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
      <div className="min-w-0 self-center">
        <Link href={`/products/${product.id}`} className="studio-focus block min-w-0">
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
        {latestShopifyPublish ? (
          <a
            href={latestShopifyPublish.adminUrl}
            target="_blank"
            rel="noreferrer"
            className="studio-focus mt-2 inline-flex items-center gap-1 text-sm font-semibold text-action underline-offset-4 hover:underline"
          >
            Open Shopify <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          </a>
        ) : null}
        {readiness ? (
          <div className="mt-3 sm:hidden">
            <QualityScore readiness={readiness} />
          </div>
        ) : null}
      </div>
      <Link href={`/products/${product.id}`} className="studio-focus hidden self-center text-sm sm:block">
        {readiness ? <QualityScore readiness={readiness} /> : null}
        <p className="mt-2 text-right text-xs text-muted">
          Updated <span className="text-ink">{new Date(product.updatedAt).toLocaleDateString()}</span>
        </p>
        {nextItem ? (
          <p className="mt-1 truncate text-right text-xs text-muted">
            Next: {nextItem.label}
          </p>
        ) : null}
      </Link>
    </div>
  );
}

function QualityScore({ readiness }: { readiness: ProductReadiness }) {
  const scoreTone =
    readiness.score >= 90
      ? "text-action"
      : readiness.score >= 70
        ? "text-amber-700"
        : "text-red-700";

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-xs font-semibold uppercase text-muted">Quality</span>
        <span className={`text-base font-semibold ${scoreTone}`}>{readiness.score}/100</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded bg-line">
        <div
          className={`h-full rounded ${
            readiness.score >= 90
              ? "bg-action"
              : readiness.score >= 70
                ? "bg-amber-500"
                : "bg-red-500"
          }`}
          style={{ width: `${readiness.score}%` }}
        />
      </div>
    </div>
  );
}
