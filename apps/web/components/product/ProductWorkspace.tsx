"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  CheckCircle2,
  Circle,
  Coins,
  ExternalLink,
  ImagePlus,
  ListChecks,
  PackageCheck,
  PenLine,
  Send,
  ShoppingBag,
  Sparkles,
  Store
} from "lucide-react";
import type { Product, ProductImage } from "@/lib/types";
import { GeneratedImageGrid } from "@/components/image-generator/GeneratedImageGrid";
import { ProductCopyEditor } from "@/components/copy-editor/ProductCopyEditor";
import { JobStatusPanel } from "@/components/jobs/JobStatusPanel";
import { StatusBadge } from "./StatusBadge";

type ProductTab = "media" | "copy" | "commerce" | "publish";

const tabs: Array<{ id: ProductTab; label: string }> = [
  { id: "media", label: "Media" },
  { id: "copy", label: "Copy" },
  { id: "commerce", label: "Commerce" },
  { id: "publish", label: "Publish" }
];

export function ProductWorkspace({ initialProduct }: { initialProduct: Product }) {
  const [product, setProduct] = useState(initialProduct);
  const [activeTab, setActiveTab] = useState<ProductTab>("media");
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [isGeneratingCopy, setIsGeneratingCopy] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [message, setMessage] = useState("");
  const [shopifyAdminUrl, setShopifyAdminUrl] = useState("");
  const [shopifyConnected, setShopifyConnected] = useState<boolean | null>(null);
  const [credits, setCredits] = useState<{
    balance: number;
    imageCost: number;
    isUnlimited: boolean;
  } | null>(null);

  const publishImages = useMemo(() => getPublishImages(product.images), [product.images]);
  const previewImage = publishImages[0] ?? product.images.find((image) => image.type === "ORIGINAL");
  const checklist = [
    {
      label: "Shopify connected",
      complete: Boolean(shopifyConnected),
      detail: shopifyConnected === null ? "Checking connection" : shopifyConnected ? "Store ready" : "Connect a store"
    },
    {
      label: "4 generated images",
      complete: publishImages.length >= 4,
      detail: `${publishImages.length}/4 ready`
    },
    {
      label: "Title and description",
      complete: Boolean(product.title && product.description),
      detail: product.title && product.description ? "Copy ready" : "Generate or save copy"
    },
    {
      label: "Price",
      complete: Boolean(product.price),
      detail: product.price || "Unset"
    },
    {
      label: "Inventory",
      complete: Boolean(!product.trackInventory || product.inventoryQuantity !== undefined),
      detail: product.trackInventory ? `${product.inventoryQuantity ?? 0} tracked` : "Not tracked"
    }
  ];
  const readyToPublish = checklist.every((item) => item.complete);

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

    fetch("/api/credits/status")
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (isMounted && payload) {
          setCredits({
            balance: Number(payload.balance ?? 0),
            imageCost: Number(payload.costs?.image ?? 1),
            isUnlimited: Boolean(payload.isUnlimited)
          });
        }
      })
      .catch(() => null);

    return () => {
      isMounted = false;
    };
  }, []);

  async function refresh() {
    const response = await fetch(`/api/products/${product.id}`);
    if (response.ok) setProduct(await response.json());
  }

  async function generateImages() {
    setIsGeneratingImages(true);
    setMessage("");
    const response = await fetch(`/api/products/${product.id}/generate-images`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        styles: [
          "white_background",
          product.style || "lifestyle_home",
          "product_detail",
          "product_intro"
        ],
        count: 1
      })
    });
    const payload = await response.json();
    if (payload.credits) {
      setCredits((current) => ({
        balance: Number(payload.credits.balance ?? current?.balance ?? 0),
        imageCost: current?.imageCost ?? 1,
        isUnlimited: Boolean(payload.credits.isUnlimited ?? current?.isUnlimited)
      }));
    }
    setMessage(
      response.ok
        ? payload.note || "Generated image records are ready for review."
        : payload.error
    );
    await refresh();
    if (response.ok) setActiveTab("media");
    setIsGeneratingImages(false);
  }

  async function generateCopy() {
    setIsGeneratingCopy(true);
    setMessage("");
    const response = await fetch(`/api/products/${product.id}/generate-copy`, {
      method: "POST"
    });
    const payload = await response.json();
    setMessage(
      response.ok ? payload.note || "Copy draft generated. Review before publishing." : payload.error
    );
    if (response.ok && payload.product) {
      setProduct(payload.product);
    }
    await refresh();
    if (response.ok) setActiveTab("copy");
    setIsGeneratingCopy(false);
  }

  async function publishShopify(publishMode: "DRAFT" | "ACTIVE") {
    setIsPublishing(true);
    setMessage("");
    setShopifyAdminUrl("");
    const response = await fetch(`/api/products/${product.id}/publish-shopify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publishMode })
    });
    const payload = await response.json();
    if (response.ok) {
      setShopifyAdminUrl(payload.adminUrl || "");
      setMessage(
        payload.skippedImageUrls?.length
          ? "Shopify product created. Some images were skipped."
          : publishMode === "ACTIVE"
            ? "Shopify product published live."
            : "Shopify draft created."
      );
    } else {
      setMessage(payload.error);
    }
    await refresh();
    setIsPublishing(false);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
      <section className="min-w-0 space-y-5">
        <div className="border-b border-line pb-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl">
              <p className="text-sm font-medium text-muted">Product workflow</p>
              <h1 className="mt-1 text-3xl font-semibold leading-tight">
                {product.title || product.name || "Untitled product"}
              </h1>
              <p className="mt-2 text-sm text-muted">
                Prepare media, listing copy, pricing, and inventory before sending the product to Shopify.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={product.status} />
              <span className="rounded bg-white px-3 py-1 text-xs font-semibold text-muted ring-1 ring-line">
                Shopify {product.shopifyStatus.toLowerCase().replaceAll("_", " ")}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b border-line">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`studio-focus -mb-px h-11 px-3 text-sm font-semibold transition ${
                activeTab === tab.id
                  ? "border-b-2 border-action text-ink"
                  : "border-b-2 border-transparent text-muted hover:text-ink"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "media" ? (
          <div className="space-y-5">
            <div className="grid gap-5 md:grid-cols-[280px_minmax(0,1fr)]">
              <div className="relative aspect-square overflow-hidden border border-line bg-white">
                <Image
                  src={previewImage?.url || product.originalImageUrl}
                  alt={product.name || "Product preview"}
                  fill
                  className="object-cover"
                  sizes="280px"
                />
              </div>
              <div className="content-start space-y-4">
                <div>
                  <div className="flex items-center gap-2">
                    <ImagePlus className="h-5 w-5" aria-hidden />
                    <h2 className="text-xl font-semibold">Media set</h2>
                  </div>
                  <p className="mt-2 text-sm text-muted">
                    Shopify will publish generated images only: lifestyle first, white background last.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <Metric label="Generated" value={`${publishImages.length}`} />
                  <Metric label="Required" value="4" />
                  <Metric label="Original" value="Excluded" />
                </div>
                <div className="inline-flex items-center gap-2 rounded border border-line bg-white px-3 py-2 text-sm">
                  <Coins className="h-4 w-4 text-action" aria-hidden />
                  <span className="font-semibold">
                    {credits?.isUnlimited ? "Unlimited" : credits?.balance ?? "..."}
                  </span>
                  <span className="text-muted">
                    {credits?.isUnlimited
                      ? "admin access"
                      : `credits available · ${credits?.imageCost ?? 1} per image`}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={generateImages}
                  disabled={isGeneratingImages}
                  className="studio-focus inline-flex h-11 items-center justify-center gap-2 rounded bg-action px-4 text-sm font-semibold text-white disabled:opacity-60"
                >
                  <Sparkles className="h-4 w-4" aria-hidden />
                  {isGeneratingImages ? "Generating..." : "Generate images"}
                </button>
              </div>
            </div>
            <GeneratedImageGrid images={product.images} />
          </div>
        ) : null}

        {activeTab === "copy" ? (
          <div className="border border-line bg-white p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <PenLine className="h-5 w-5" aria-hidden />
                  <h2 className="text-xl font-semibold">Listing copy</h2>
                </div>
                <p className="mt-2 text-sm text-muted">Review AI copy before it reaches Shopify.</p>
              </div>
              <button
                type="button"
                onClick={generateCopy}
                disabled={isGeneratingCopy}
                className="studio-focus inline-flex h-10 items-center justify-center gap-2 rounded border border-line bg-white px-4 text-sm font-semibold hover:bg-canvas disabled:opacity-60"
              >
                <Sparkles className="h-4 w-4" aria-hidden />
                {isGeneratingCopy ? "Writing..." : "Generate copy"}
              </button>
            </div>
            <div className="mt-5">
              <ProductCopyEditor product={product} onSaved={setProduct} mode="copy" />
            </div>
          </div>
        ) : null}

        {activeTab === "commerce" ? (
          <div className="border border-line bg-white p-4 sm:p-6">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" aria-hidden />
              <h2 className="text-xl font-semibold">Commerce settings</h2>
            </div>
            <p className="mt-2 text-sm text-muted">Set price, SKU, and inventory before publishing.</p>
            <div className="mt-5">
              <ProductCopyEditor product={product} onSaved={setProduct} mode="commerce" />
            </div>
          </div>
        ) : null}

        {activeTab === "publish" ? (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="border border-line bg-white p-4 sm:p-6">
              <div className="flex items-center gap-2">
                <Store className="h-5 w-5" aria-hidden />
                <h2 className="text-xl font-semibold">Publish controls</h2>
              </div>
              <p className="mt-2 text-sm text-muted">
                Create a draft for final Shopify review, or publish live when the checklist is complete.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => publishShopify("DRAFT")}
                  disabled={isPublishing}
                  className="studio-focus inline-flex h-11 items-center justify-center gap-2 rounded border border-line bg-white px-4 text-sm font-semibold hover:bg-canvas disabled:opacity-60"
                >
                  <Send className="h-4 w-4" aria-hidden />
                  {isPublishing ? "Preparing..." : "Create draft"}
                </button>
                <button
                  type="button"
                  onClick={() => publishShopify("ACTIVE")}
                  disabled={isPublishing || !readyToPublish}
                  className="studio-focus inline-flex h-11 items-center justify-center gap-2 rounded bg-ink px-4 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
                >
                  <PackageCheck className="h-4 w-4" aria-hidden />
                  {isPublishing ? "Preparing..." : "Publish live"}
                </button>
              </div>
              {message ? <p className="mt-4 text-sm text-muted">{message}</p> : null}
              {shopifyAdminUrl ? (
                <a
                  href={shopifyAdminUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="studio-focus mt-4 inline-flex items-center gap-2 text-sm font-semibold text-action underline-offset-4 hover:underline"
                >
                  Open Shopify product <ExternalLink className="h-4 w-4" aria-hidden />
                </a>
              ) : null}
            </div>
            <Checklist items={checklist} />
          </div>
        ) : null}

        <div>
          <h2 className="mb-3 text-base font-semibold">Recent jobs</h2>
          <JobStatusPanel jobs={product.jobs} />
        </div>
      </section>

      <aside className="space-y-5 xl:sticky xl:top-24 xl:self-start">
        <ShopifyPreview product={product} image={previewImage} />
        <Checklist items={checklist} />
        <div className="border border-line bg-white p-4">
          <h2 className="text-base font-semibold">Draft state</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <Definition label="Category" value={product.category || "Unset"} />
            <Definition label="Style" value={product.style || "Unset"} />
            <Definition label="Shopify" value={product.shopifyStatus.toLowerCase().replaceAll("_", " ")} />
            <Definition label="Images" value={`${product.images.length}`} />
            <Definition label="Price" value={product.price || "Unset"} />
            <Definition
              label="Inventory"
              value={product.trackInventory ? `${product.inventoryQuantity ?? 0}` : "Not tracked"}
            />
          </dl>
        </div>
      </aside>
    </div>
  );
}

function getPublishImages(images: ProductImage[]) {
  return images
    .filter((image) => image.type !== "ORIGINAL")
    .sort((a, b) => {
      if (a.type === "LIFESTYLE" && b.type !== "LIFESTYLE") return -1;
      if (a.type !== "LIFESTYLE" && b.type === "LIFESTYLE") return 1;
      if (a.type === "WHITE_BACKGROUND" && b.type !== "WHITE_BACKGROUND") return 1;
      if (a.type !== "WHITE_BACKGROUND" && b.type === "WHITE_BACKGROUND") return -1;
      return a.sortOrder - b.sortOrder;
    });
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-line bg-white p-3">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-base font-semibold">{value}</p>
    </div>
  );
}

function Definition({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right">{value}</dd>
    </div>
  );
}

function Checklist({
  items
}: {
  items: Array<{ label: string; complete: boolean; detail: string }>;
}) {
  return (
    <div className="border border-line bg-white p-4">
      <div className="flex items-center gap-2">
        <ListChecks className="h-5 w-5" aria-hidden />
        <h2 className="text-base font-semibold">Publish checklist</h2>
      </div>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div key={item.label} className="flex items-start gap-3">
            {item.complete ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-action" aria-hidden />
            ) : (
              <Circle className="mt-0.5 h-4 w-4 text-muted" aria-hidden />
            )}
            <div className="min-w-0">
              <p className="text-sm font-medium">{item.label}</p>
              <p className="text-xs text-muted">{item.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ShopifyPreview({
  product,
  image
}: {
  product: Product;
  image?: ProductImage;
}) {
  return (
    <div className="overflow-hidden border border-line bg-white">
      <div className="relative aspect-[4/3] bg-canvas">
        {image ? (
          <Image
            src={image.url}
            alt={product.title || product.name || "Shopify preview"}
            fill
            className="object-cover"
            sizes="380px"
          />
        ) : null}
      </div>
      <div className="p-4">
        <p className="text-xs font-semibold uppercase text-muted">Shopify preview</p>
        <h2 className="mt-2 text-lg font-semibold leading-snug">
          {product.title || product.name || "Untitled product"}
        </h2>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-xl font-semibold">{product.price || "Price unset"}</span>
          {product.compareAtPrice ? (
            <span className="text-sm text-muted line-through">{product.compareAtPrice}</span>
          ) : null}
        </div>
        <p className="mt-3 line-clamp-4 text-sm leading-6 text-muted">
          {product.description || "Generate or write a product description before publishing."}
        </p>
        {product.tags.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {product.tags.slice(0, 5).map((tag) => (
              <span key={tag} className="rounded bg-canvas px-2 py-1 text-xs text-muted">
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
