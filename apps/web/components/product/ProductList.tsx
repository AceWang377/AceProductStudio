"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
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
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ProductFilter>("ALL");
  const [sort, setSort] = useState<ProductSort>("updated");

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
      </div>

      {filteredProducts.length ? (
        <div className="border-t border-line">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
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
