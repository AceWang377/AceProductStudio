"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Gauge, Search, Send, Trash2, X } from "lucide-react";
import type { Product, ProductStatus } from "@/lib/types";
import { getProductReadiness } from "@/lib/product-readiness";
import { ProductCard } from "./ProductCard";

type ProductFilter = "ALL" | ProductStatus;
type ProductSort = "updated" | "created" | "title" | "quality";

const filters: Array<{ value: ProductFilter; label: string }> = [
  { value: "ALL", label: "All" },
  { value: "DRAFT", label: "Draft" },
  { value: "READY", label: "Ready" },
  { value: "PUBLISHED", label: "Published" },
  { value: "FAILED", label: "Failed" }
];

const sortOptions: Array<{ value: ProductSort; label: string }> = [
  { value: "updated", label: "Recently updated" },
  { value: "created", label: "Newest created" },
  { value: "title", label: "Title A-Z" },
  { value: "quality", label: "Highest quality" }
];

export function ProductList({ products }: { products: Product[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ProductFilter>("ALL");
  const [sort, setSort] = useState<ProductSort>("updated");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isActing, setIsActing] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const [shopifyConnected, setShopifyConnected] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;
    fetch("/api/settings/shopify/status")
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (isMounted) setShopifyConnected(Boolean(payload?.connected));
      })
      .catch(() => {
        if (isMounted) setShopifyConnected(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const productReadiness = useMemo(
    () =>
      new Map(
        products.map((product) => [
          product.id,
          getProductReadiness({ product, shopifyConnected })
        ])
      ),
    [products, shopifyConnected]
  );

  const qualitySummary = useMemo(() => {
    const scores = Array.from(productReadiness.values()).map((readiness) => readiness.score);
    const average = scores.length
      ? Math.round(scores.reduce((total, score) => total + score, 0) / scores.length)
      : 0;
    const ready = scores.filter((score) => score >= 90).length;
    const needsWork = scores.filter((score) => score < 70).length;

    return { average, ready, needsWork };
  }, [productReadiness]);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return products
      .filter((product) => {
        if (filter !== "ALL" && product.status !== filter) return false;
        if (!normalizedQuery) return true;

        return [
          product.title,
          product.name,
          product.category,
          product.sku,
          product.tags.join(" ")
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      })
      .sort((left, right) => {
        if (sort === "quality") {
          return (productReadiness.get(right.id)?.score ?? 0) - (productReadiness.get(left.id)?.score ?? 0);
        }
        if (sort === "title") {
          return (left.title || left.name || "").localeCompare(right.title || right.name || "");
        }
        const leftDate = sort === "created" ? left.createdAt : left.updatedAt;
        const rightDate = sort === "created" ? right.createdAt : right.updatedAt;
        return rightDate.localeCompare(leftDate);
      });
  }, [filter, productReadiness, products, query, sort]);

  const visibleIds = filteredProducts.map((product) => product.id);
  const selectedVisibleCount = visibleIds.filter((id) => selectedIds.has(id)).length;
  const allVisibleSelected = visibleIds.length > 0 && selectedVisibleCount === visibleIds.length;
  const selectedProducts = products.filter((product) => selectedIds.has(product.id));
  const draftEligibleProducts = selectedProducts.filter((product) => {
    const readiness = productReadiness.get(product.id);
    return (
      Boolean(shopifyConnected) &&
      (readiness?.score ?? 0) >= 90 &&
      product.shopifyStatus !== "PUBLISHED_AS_DRAFT" &&
      product.shopifyStatus !== "PUBLISHED_LIVE"
    );
  });

  function toggleProductSelection(productId: string, selected: boolean) {
    setActionMessage("");
    setSelectedIds((current) => {
      const next = new Set(current);
      if (selected) {
        next.add(productId);
      } else {
        next.delete(productId);
      }
      return next;
    });
  }

  function toggleVisibleSelection() {
    setActionMessage("");
    setSelectedIds((current) => {
      const next = new Set(current);
      if (allVisibleSelected) {
        visibleIds.forEach((id) => next.delete(id));
      } else {
        visibleIds.forEach((id) => next.add(id));
      }
      return next;
    });
  }

  async function duplicateSelectedProducts() {
    if (!selectedIds.size) return;

    setIsActing(true);
    setActionMessage("");
    const ids = Array.from(selectedIds);
    const results = await Promise.allSettled(
      ids.map((id) => fetch(`/api/products/${id}/duplicate`, { method: "POST" }))
    );
    const failed = results.filter((result) => result.status === "rejected" || !result.value.ok).length;

    setSelectedIds(new Set());
    setIsActing(false);
    setActionMessage(
      failed
        ? `Duplicated ${ids.length - failed} products. ${failed} failed.`
        : `Duplicated ${ids.length} products.`
    );
    router.refresh();
  }

  async function createShopifyDraftsForSelectedProducts() {
    if (!selectedIds.size) return;

    if (!shopifyConnected) {
      setActionMessage("Connect Shopify before creating product drafts.");
      return;
    }

    if (!draftEligibleProducts.length) {
      setActionMessage("No selected products are ready for Shopify draft creation.");
      return;
    }

    setIsActing(true);
    setActionMessage("");
    const ids = draftEligibleProducts.map((product) => product.id);
    const skipped = selectedIds.size - ids.length;
    const results = await Promise.allSettled(
      ids.map((id) =>
        fetch(`/api/products/${id}/publish-shopify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ publishMode: "DRAFT" })
        })
      )
    );
    const failed = results.filter((result) => result.status === "rejected" || !result.value.ok).length;
    const created = ids.length - failed;

    setSelectedIds(new Set());
    setIsActing(false);
    setActionMessage(
      [
        created ? `Created ${created} Shopify draft${created === 1 ? "" : "s"}.` : "",
        failed ? `${failed} failed.` : "",
        skipped ? `${skipped} skipped because they need fixes or were already published.` : ""
      ]
        .filter(Boolean)
        .join(" ")
    );
    router.refresh();
  }

  async function deleteSelectedProducts() {
    if (!selectedIds.size) return;

    const confirmed = window.confirm(
      `Delete ${selectedIds.size} selected product draft${selectedIds.size === 1 ? "" : "s"}? This removes their generated media, copy, jobs, and publish history from this workspace.`
    );
    if (!confirmed) return;

    setIsActing(true);
    setActionMessage("");
    const ids = Array.from(selectedIds);
    const results = await Promise.allSettled(
      ids.map((id) => fetch(`/api/products/${id}`, { method: "DELETE" }))
    );
    const failed = results.filter((result) => result.status === "rejected" || !result.value.ok).length;

    setSelectedIds(new Set());
    setIsActing(false);
    setActionMessage(
      failed
        ? `Deleted ${ids.length - failed} products. ${failed} failed.`
        : `Deleted ${ids.length} products.`
    );
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 border border-line bg-white p-4 md:grid-cols-3">
        <QualityMetric label="Average quality" value={`${qualitySummary.average}`} suffix="/100" />
        <QualityMetric label="Ready listings" value={`${qualitySummary.ready}`} suffix={`/${products.length}`} />
        <QualityMetric label="Needs work" value={`${qualitySummary.needsWork}`} suffix="products" />
      </div>

      <div className="grid gap-3 border border-line bg-white p-4 lg:grid-cols-[minmax(0,1fr)_180px]">
        <label className="relative block">
          <span className="sr-only">Search products</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search title, category, SKU, or tags"
            className="studio-focus h-11 w-full rounded border border-line bg-canvas pl-10 pr-3 text-sm outline-none"
          />
        </label>
        <label>
          <span className="sr-only">Sort products</span>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as ProductSort)}
            className="studio-focus h-11 w-full rounded border border-line bg-canvas px-3 text-sm outline-none"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((item) => {
          const count =
            item.value === "ALL"
              ? products.length
              : products.filter((product) => product.status === item.value).length;

          return (
            <button
              key={item.value}
              type="button"
              onClick={() => setFilter(item.value)}
              className={`studio-focus inline-flex h-9 items-center gap-2 rounded border px-3 text-sm font-semibold transition ${
                filter === item.value
                  ? "border-action bg-action text-white"
                  : "border-line bg-white text-muted hover:text-ink"
              }`}
            >
              {item.label}
              <span className={filter === item.value ? "text-white/80" : "text-muted"}>{count}</span>
            </button>
          );
        })}
        {filteredProducts.length ? (
          <button
            type="button"
            onClick={toggleVisibleSelection}
            className="studio-focus inline-flex h-9 items-center gap-2 rounded border border-line bg-white px-3 text-sm font-semibold text-muted hover:text-ink"
          >
            {allVisibleSelected ? "Clear visible" : "Select visible"}
            <span className="text-muted">{selectedVisibleCount}/{visibleIds.length}</span>
          </button>
        ) : null}
      </div>

      {selectedIds.size ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border border-line bg-white p-3">
          <p className="text-sm font-semibold">
            {selectedIds.size} selected
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={duplicateSelectedProducts}
              disabled={isActing}
              className="studio-focus inline-flex h-9 items-center justify-center gap-2 rounded border border-line bg-white px-3 text-sm font-semibold hover:bg-canvas disabled:opacity-60"
            >
              <Copy className="h-4 w-4" aria-hidden />
              {isActing ? "Working..." : "Duplicate"}
            </button>
            <button
              type="button"
              onClick={createShopifyDraftsForSelectedProducts}
              disabled={isActing || !draftEligibleProducts.length}
              title={
                draftEligibleProducts.length
                  ? "Create Shopify drafts for ready selected products"
                  : "Select ready products to create Shopify drafts"
              }
              className="studio-focus inline-flex h-9 items-center justify-center gap-2 rounded border border-line bg-white px-3 text-sm font-semibold hover:bg-canvas disabled:opacity-60"
            >
              <Send className="h-4 w-4" aria-hidden />
              {isActing ? "Working..." : `Create drafts (${draftEligibleProducts.length})`}
            </button>
            <button
              type="button"
              onClick={deleteSelectedProducts}
              disabled={isActing}
              className="studio-focus inline-flex h-9 items-center justify-center gap-2 rounded border border-red-300 bg-white px-3 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
            >
              <Trash2 className="h-4 w-4" aria-hidden />
              Delete
            </button>
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              disabled={isActing}
              className="studio-focus inline-flex h-9 w-9 items-center justify-center rounded border border-line bg-white hover:bg-canvas disabled:opacity-60"
              aria-label="Clear selected products"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>
      ) : null}

      {actionMessage ? (
        <div className="border border-line bg-white p-3 text-sm text-muted">
          {actionMessage}
        </div>
      ) : null}

      {filteredProducts.length ? (
        <div className="border-t border-line">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              readiness={productReadiness.get(product.id)}
              selected={selectedIds.has(product.id)}
              onSelectionChange={toggleProductSelection}
            />
          ))}
        </div>
      ) : (
        <div className="border border-line bg-white p-8 text-sm text-muted">
          No products match the current search or filter.
        </div>
      )}
    </div>
  );
}

function QualityMetric({
  label,
  value,
  suffix
}: {
  label: string;
  value: string;
  suffix: string;
}) {
  return (
    <div className="flex items-center gap-3 border border-line bg-canvas px-3 py-3">
      <Gauge className="h-4 w-4 text-action" aria-hidden />
      <div>
        <p className="text-xs text-muted">{label}</p>
        <p className="mt-1 text-base font-semibold">
          {value} <span className="text-xs font-medium text-muted">{suffix}</span>
        </p>
      </div>
    </div>
  );
}
