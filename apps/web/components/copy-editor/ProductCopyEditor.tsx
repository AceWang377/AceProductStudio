"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/lib/types";

export function ProductCopyEditor({
  product,
  onSaved,
  mode = "all"
}: {
  product: Product;
  onSaved: (product: Product) => void;
  mode?: "all" | "copy" | "commerce";
}) {
  const [title, setTitle] = useState(product.title || "");
  const [description, setDescription] = useState(product.description || "");
  const [bullets, setBullets] = useState(product.bulletPoints.join("\n"));
  const [tags, setTags] = useState(product.tags.join(", "));
  const [price, setPrice] = useState(product.price || "");
  const [compareAtPrice, setCompareAtPrice] = useState(product.compareAtPrice || "");
  const [sku, setSku] = useState(product.sku || "");
  const [inventoryQuantity, setInventoryQuantity] = useState(
    product.inventoryQuantity === undefined ? "" : String(product.inventoryQuantity)
  );
  const [trackInventory, setTrackInventory] = useState(Boolean(product.trackInventory));
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setTitle(product.title || "");
    setDescription(product.description || "");
    setBullets(product.bulletPoints.join("\n"));
    setTags(product.tags.join(", "));
    setPrice(product.price || "");
    setCompareAtPrice(product.compareAtPrice || "");
    setSku(product.sku || "");
    setInventoryQuantity(product.inventoryQuantity === undefined ? "" : String(product.inventoryQuantity));
    setTrackInventory(Boolean(product.trackInventory));
  }, [
    product.id,
    product.title,
    product.description,
    product.bulletPoints,
    product.tags,
    product.price,
    product.compareAtPrice,
    product.sku,
    product.inventoryQuantity,
    product.trackInventory
  ]);

  async function save() {
    setIsSaving(true);
    const response = await fetch(`/api/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        bulletPoints: bullets.split("\n").map((item) => item.trim()).filter(Boolean),
        tags: tags.split(",").map((item) => item.trim()).filter(Boolean),
        price: price.trim(),
        compareAtPrice: compareAtPrice.trim(),
        sku: sku.trim(),
        inventoryQuantity: inventoryQuantity === "" ? undefined : Number(inventoryQuantity),
        trackInventory
      })
    });
    const updated = await response.json();
    setIsSaving(false);
    if (response.ok) onSaved(updated);
  }

  const showCopy = mode === "all" || mode === "copy";
  const showCommerce = mode === "all" || mode === "commerce";

  return (
    <div className="space-y-4">
      {showCopy ? (
        <>
          <label className="block">
            <span className="text-sm font-medium">SEO title</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="studio-focus mt-2 h-11 w-full rounded border border-line px-3"
              placeholder="Generated product title"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Bullet points</span>
            <textarea
              value={bullets}
              onChange={(event) => setBullets(event.target.value)}
              className="studio-focus mt-2 min-h-32 w-full rounded border border-line p-3"
              placeholder="One bullet per line"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Description</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="studio-focus mt-2 min-h-40 w-full rounded border border-line p-3"
              placeholder="Shopify-ready description"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Tags</span>
            <input
              value={tags}
              onChange={(event) => setTags(event.target.value)}
              className="studio-focus mt-2 h-11 w-full rounded border border-line px-3"
              placeholder="comma, separated, tags"
            />
          </label>
        </>
      ) : null}
      {showCommerce ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium">Price</span>
          <input
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            className="studio-focus mt-2 h-11 w-full rounded border border-line px-3"
            inputMode="decimal"
            placeholder="19.99"
          />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Compare-at price</span>
            <input
              value={compareAtPrice}
              onChange={(event) => setCompareAtPrice(event.target.value)}
              className="studio-focus mt-2 h-11 w-full rounded border border-line px-3"
              inputMode="decimal"
              placeholder="29.99"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">SKU</span>
            <input
              value={sku}
              onChange={(event) => setSku(event.target.value)}
              className="studio-focus mt-2 h-11 w-full rounded border border-line px-3"
              placeholder="SKU-001"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Inventory quantity</span>
            <input
              value={inventoryQuantity}
              onChange={(event) => setInventoryQuantity(event.target.value)}
              className="studio-focus mt-2 h-11 w-full rounded border border-line px-3"
              inputMode="numeric"
              placeholder="10"
            />
          </label>
        </div>
        <label className="flex items-center gap-3 text-sm">
          <input
            checked={trackInventory}
            onChange={(event) => setTrackInventory(event.target.checked)}
            type="checkbox"
            className="h-4 w-4 rounded border-line"
          />
          Track inventory in Shopify
        </label>
        </>
      ) : null}
      <button
        type="button"
        onClick={save}
        disabled={isSaving}
        className="studio-focus h-10 rounded bg-ink px-4 text-sm font-semibold text-white disabled:opacity-60"
      >
        {isSaving ? "Saving..." : mode === "commerce" ? "Save commerce" : "Save copy"}
      </button>
    </div>
  );
}
