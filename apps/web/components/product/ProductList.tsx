"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Search, Trash2, X } from "lucide-react";
import type { Product, ProductStatus } from "@/lib/types";
import { ProductCard } from "./ProductCard";

type ProductFilter = "ALL" | ProductStatus;
type ProductSort = "updated" | "created" | "title";

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
  { value: "title", label: "Title A-Z" }
];

export function ProductList({ products }: { products: Product[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ProductFilter>("ALL");
  const [sort, setSort] = useState<ProductSort>("updated");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isActing, setIsActing] = useState(false);
  const [actionMessage, setActionMessage] = useState("");

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
        if (sort === "title") {
          return (left.title || left.name || "").localeCompare(right.title || right.name || "");
        }
        const leftDate = sort === "created" ? left.createdAt : left.updatedAt;
        const rightDate = sort === "created" ? right.createdAt : right.updatedAt;
        return rightDate.localeCompare(leftDate);
      });
  }, [filter, products, query, sort]);

  const visibleIds = filteredProducts.map((product) => product.id);
  const selectedVisibleCount = visibleIds.filter((id) => selectedIds.has(id)).length;
  const allVisibleSelected = visibleIds.length > 0 && selectedVisibleCount === visibleIds.length;

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
