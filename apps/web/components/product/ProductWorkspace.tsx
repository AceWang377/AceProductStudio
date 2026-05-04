"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Circle,
  Coins,
  Copy,
  ExternalLink,
  ImagePlus,
  ListChecks,
  PackageCheck,
  PenLine,
  Send,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Store,
  Trash2,
  X
} from "lucide-react";
import type { GenerationJob, Product, ProductImage } from "@/lib/types";
import { getOrderedPublishImages } from "@/lib/product-images";
import { getProductReadiness, type ReadinessItem } from "@/lib/product-readiness";
import { getLatestShopifyPublish, getShopifyPublishEvents } from "@/lib/shopify-publish-history";
import { GeneratedImageGrid } from "@/components/image-generator/GeneratedImageGrid";
import { ProductCopyEditor } from "@/components/copy-editor/ProductCopyEditor";
import { JobStatusPanel } from "@/components/jobs/JobStatusPanel";
import { ListingQualityPanel } from "./ListingQualityPanel";
import { ProductBriefControls } from "./ProductBriefControls";
import { ShopifyPublishHistory } from "./ShopifyPublishHistory";
import { StatusBadge } from "./StatusBadge";

export type ProductTab = "brief" | "media" | "copy" | "commerce" | "publish";

const tabs: Array<{ id: ProductTab; label: string }> = [
  { id: "brief", label: "Brief" },
  { id: "media", label: "Media" },
  { id: "copy", label: "Copy" },
  { id: "commerce", label: "Commerce" },
  { id: "publish", label: "Publish" }
];

export function ProductWorkspace({
  initialProduct,
  initialTab
}: {
  initialProduct: Product;
  initialTab?: string;
}) {
  const router = useRouter();
  const [product, setProduct] = useState(initialProduct);
  const [activeTab, setActiveTab] = useState<ProductTab>(getInitialTab(initialTab));
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [isGeneratingCopy, setIsGeneratingCopy] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [retryingJobId, setRetryingJobId] = useState<string | undefined>();
  const [pollingImageJobId, setPollingImageJobId] = useState<string | undefined>();
  const [showLivePublishConfirm, setShowLivePublishConfirm] = useState(false);
  const [livePublishAcknowledged, setLivePublishAcknowledged] = useState(false);
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"success" | "error" | "neutral">("neutral");
  const [deleteMessage, setDeleteMessage] = useState("");
  const [shopifyAdminUrl, setShopifyAdminUrl] = useState("");
  const [shopifyConnected, setShopifyConnected] = useState<boolean | null>(null);
  const [credits, setCredits] = useState<{
    balance: number;
    imageCost: number;
    isUnlimited: boolean;
  } | null>(null);

  const publishImages = useMemo(() => getPublishImages(product.images), [product.images]);
  const previewImage = publishImages[0] ?? product.images.find((image) => image.type === "ORIGINAL");
  const latestShopifyPublish = useMemo(() => getLatestShopifyPublish(product), [product]);
  const shopifyPublishEvents = useMemo(() => getShopifyPublishEvents(product), [product]);
  const displayedShopifyAdminUrl = shopifyAdminUrl || latestShopifyPublish?.adminUrl || "";
  const readiness = useMemo(
    () =>
      getProductReadiness({
        product,
        publishImages,
        shopifyConnected
      }),
    [product, publishImages, shopifyConnected]
  );
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
  const readyToPublish = readiness.score >= 90 && checklist.every((item) => item.complete);
  const tabStates = getTabStates({
    product,
    readinessItems: readiness.items,
    readyToPublish
  });

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

  useEffect(() => {
    setActiveTab(getInitialTab(initialTab));
  }, [initialTab]);

  useEffect(() => {
    if (!pollingImageJobId) return;

    let cancelled = false;
    let timeout: ReturnType<typeof setTimeout> | undefined;

    async function pollImageJob() {
      const response = await fetch(`/api/products/${product.id}`);
      if (!response.ok) {
        if (!cancelled) timeout = setTimeout(pollImageJob, 3000);
        return;
      }

      const nextProduct = (await response.json()) as Product;
      if (cancelled) return;

      setProduct(nextProduct);
      const job = nextProduct.jobs.find((item) => item.id === pollingImageJobId);
      if (!job || ["QUEUED", "PROCESSING"].includes(job.status)) {
        timeout = setTimeout(pollImageJob, 3000);
        return;
      }

      setPollingImageJobId(undefined);
      setIsGeneratingImages(false);
      setMessage(
        job.status === "COMPLETED"
          ? "Generated image records are ready for review."
          : job.error || "Image generation failed."
      );
      setMessageTone(job.status === "COMPLETED" ? "success" : "error");
      if (job.status === "COMPLETED") setActiveTab("media");
    }

    timeout = setTimeout(pollImageJob, 1200);

    return () => {
      cancelled = true;
      if (timeout) clearTimeout(timeout);
    };
  }, [pollingImageJobId, product.id]);

  async function refresh() {
    const response = await fetch(`/api/products/${product.id}`);
    if (response.ok) setProduct(await response.json());
  }

  async function generateImages() {
    setIsGeneratingImages(true);
    setMessage("");
    setMessageTone("neutral");
    const response = await fetch(`/api/products/${product.id}/generate-images`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        styles: [
          "white_background",
          product.imageStylePreset || product.style || "lifestyle_home",
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
    setMessage(response.ok ? payload.note || "Image generation started." : payload.error);
    setMessageTone(response.ok ? "neutral" : "error");
    await refresh();
    if (response.ok) {
      setActiveTab("media");
      if (payload.jobId) {
        setPollingImageJobId(payload.jobId);
      } else {
        setIsGeneratingImages(false);
      }
    } else {
      setIsGeneratingImages(false);
    }
  }

  async function generateCopy() {
    setIsGeneratingCopy(true);
    setMessage("");
    setMessageTone("neutral");
    const response = await fetch(`/api/products/${product.id}/generate-copy`, {
      method: "POST"
    });
    const payload = await response.json();
    setMessage(
      response.ok ? payload.note || "Copy draft generated. Review before publishing." : payload.error
    );
    setMessageTone(response.ok ? "success" : "error");
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
    setMessageTone("neutral");
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
      setMessageTone("success");
    } else {
      setMessage(payload.error);
      setMessageTone("error");
    }
    await refresh();
    setIsPublishing(false);
  }

  function openLivePublishConfirm() {
    setLivePublishAcknowledged(false);
    setShowLivePublishConfirm(true);
  }

  function closeLivePublishConfirm() {
    if (isPublishing) return;
    setShowLivePublishConfirm(false);
    setLivePublishAcknowledged(false);
  }

  async function confirmLivePublish() {
    setShowLivePublishConfirm(false);
    setLivePublishAcknowledged(false);
    await publishShopify("ACTIVE");
  }

  async function retryFailedJob(job: GenerationJob) {
    setRetryingJobId(job.id);
    setMessage("");

    try {
      if (job.type === "IMAGE_GENERATION") {
        setActiveTab("media");
        await generateImages();
      } else if (job.type === "COPY_GENERATION") {
        setActiveTab("copy");
        await generateCopy();
      } else {
        setActiveTab("publish");
        await publishShopify("DRAFT");
      }
    } finally {
      setRetryingJobId(undefined);
    }
  }

  async function deleteProductDraft() {
    const confirmed = window.confirm(
      "Delete this product draft? This removes the product, generated images, copy, jobs, and Shopify publish history from this workspace."
    );
    if (!confirmed) return;

    setIsDeleting(true);
    setDeleteMessage("");

    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: "DELETE"
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setDeleteMessage(payload.error || "Could not delete this product.");
        setIsDeleting(false);
        return;
      }

      router.push("/products");
      router.refresh();
    } catch {
      setDeleteMessage("Could not delete this product. Check your connection and try again.");
      setIsDeleting(false);
    }
  }

  async function duplicateProductDraft() {
    setIsDuplicating(true);
    setDeleteMessage("");

    try {
      const response = await fetch(`/api/products/${product.id}/duplicate`, {
        method: "POST"
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setDeleteMessage(payload.error || "Could not duplicate this product.");
        setIsDuplicating(false);
        return;
      }

      router.push(`/products/${payload.id}`);
      router.refresh();
    } catch {
      setDeleteMessage("Could not duplicate this product. Check your connection and try again.");
      setIsDuplicating(false);
    }
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

        <NextRequirementStrip
          product={product}
          readinessScore={readiness.score}
          readinessLevel={readiness.level}
          nextItem={readiness.nextItem}
          readyToPublish={readyToPublish}
          onOpenTab={setActiveTab}
        />

        {message ? (
          <WorkflowFeedback
            tone={messageTone}
            message={message}
            shopifyAdminUrl={displayedShopifyAdminUrl}
          />
        ) : null}

        <div className="flex flex-wrap items-center gap-2 border-b border-line">
          {tabs.map((tab) => {
            const tabState = tabStates[tab.id];
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`studio-focus -mb-px inline-flex h-11 items-center gap-2 px-3 text-sm font-semibold transition ${
                  activeTab === tab.id
                    ? "border-b-2 border-action text-ink"
                    : "border-b-2 border-transparent text-muted hover:text-ink"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    tabState === "complete"
                      ? "bg-action"
                      : tabState === "attention"
                        ? "bg-amber-500"
                        : "bg-stone-300"
                  }`}
                  aria-hidden
                />
                {tab.label}
              </button>
            );
          })}
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
                  <p className="mt-1 text-sm text-muted">
                    Style: {product.imageStylePreset || product.style || "minimal studio"}
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
            <GeneratedImageGrid
              productId={product.id}
              images={product.images}
              onChanged={setProduct}
            />
          </div>
        ) : null}

        {activeTab === "brief" ? (
          <div className="border border-line bg-white p-4 sm:p-6">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5" aria-hidden />
              <h2 className="text-xl font-semibold">Generation brief</h2>
            </div>
            <p className="mt-2 text-sm text-muted">
              Quality controls used by image and copy generation.
            </p>
            <div className="mt-5">
              <ProductBriefControls product={product} onSaved={setProduct} />
            </div>
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
            <div className="space-y-5">
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
                    onClick={openLivePublishConfirm}
                    disabled={isPublishing || !readyToPublish}
                    className="studio-focus inline-flex h-11 items-center justify-center gap-2 rounded bg-ink px-4 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
                  >
                    <PackageCheck className="h-4 w-4" aria-hidden />
                    {isPublishing ? "Preparing..." : "Publish live"}
                  </button>
                </div>
                {displayedShopifyAdminUrl ? (
                  <a
                    href={displayedShopifyAdminUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="studio-focus mt-4 inline-flex items-center gap-2 text-sm font-semibold text-action underline-offset-4 hover:underline"
                  >
                    Open Shopify product <ExternalLink className="h-4 w-4" aria-hidden />
                  </a>
                ) : null}
                {latestShopifyPublish && !shopifyAdminUrl ? (
                  <p className="mt-2 text-xs text-muted">
                    Last Shopify draft saved {new Date(latestShopifyPublish.publishedAt).toLocaleDateString()}.
                  </p>
                ) : null}
              </div>
              <ShopifyPublishHistory events={shopifyPublishEvents} />
            </div>
            <ListingQualityPanel readiness={readiness} onOpenTab={setActiveTab} />
          </div>
        ) : null}

        <div>
          <h2 className="mb-3 text-base font-semibold">Recent jobs</h2>
          <JobStatusPanel
            jobs={product.jobs}
            onRetry={retryFailedJob}
            retryingJobId={retryingJobId}
          />
        </div>
      </section>

      <aside className="space-y-5 xl:sticky xl:top-24 xl:self-start">
        <ShopifyPreview product={product} image={previewImage} />
        {activeTab === "publish" ? null : (
          <ListingQualityPanel readiness={readiness} onOpenTab={setActiveTab} />
        )}
        <Checklist items={checklist} />
        <div className="border border-line bg-white p-4">
          <h2 className="text-base font-semibold">Draft state</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <Definition label="Category" value={product.category || "Unset"} />
            <Definition label="Style" value={product.style || "Unset"} />
            <Definition label="Shopify" value={product.shopifyStatus.toLowerCase().replaceAll("_", " ")} />
            <Definition
              label="Shopify link"
              value={displayedShopifyAdminUrl ? "Available" : "Not created"}
            />
            <Definition label="Images" value={`${product.images.length}`} />
            <Definition label="Price" value={product.price || "Unset"} />
            <Definition
              label="Inventory"
              value={product.trackInventory ? `${product.inventoryQuantity ?? 0}` : "Not tracked"}
            />
          </dl>
        </div>
        <div className="border border-line bg-white p-4">
          <div className="flex items-start gap-3">
            <Copy className="mt-0.5 h-5 w-5 text-action" aria-hidden />
            <div>
              <h2 className="text-base font-semibold">Product controls</h2>
              <p className="mt-2 text-sm leading-6 text-muted">
                Duplicate this draft to test a new image style, copy angle, or price setup. Delete only when it should no longer appear in the workspace.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={duplicateProductDraft}
            disabled={isDuplicating || isDeleting}
            className="studio-focus mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded border border-line bg-white px-4 text-sm font-semibold text-ink hover:bg-canvas disabled:opacity-60"
          >
            <Copy className="h-4 w-4" aria-hidden />
            {isDuplicating ? "Duplicating..." : "Duplicate draft"}
          </button>
          <button
            type="button"
            onClick={deleteProductDraft}
            disabled={isDeleting || isDuplicating}
            className="studio-focus mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded border border-red-300 bg-white px-4 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
          >
            <Trash2 className="h-4 w-4" aria-hidden />
            {isDeleting ? "Deleting..." : "Delete draft"}
          </button>
          {deleteMessage ? <p className="mt-3 text-sm text-red-700">{deleteMessage}</p> : null}
        </div>
      </aside>

      {showLivePublishConfirm ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-ink/40 px-4 py-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="live-publish-title"
        >
          <div className="w-full max-w-lg border border-line bg-white shadow-xl">
            <div className="flex items-start justify-between gap-4 border-b border-line p-5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 text-red-600" aria-hidden />
                <div>
                  <h2 id="live-publish-title" className="text-lg font-semibold">
                    Publish live to Shopify?
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-muted">
                    This product will be visible to customers as an active Shopify product.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeLivePublishConfirm}
                className="studio-focus inline-flex h-9 w-9 items-center justify-center rounded hover:bg-canvas"
                aria-label="Close live publish confirmation"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div className="border border-line bg-canvas p-4 text-sm">
                <dl className="space-y-3">
                  <Definition label="Product" value={product.title || product.name || "Untitled product"} />
                  <Definition label="Price" value={product.price || "Unset"} />
                  <Definition label="Generated images" value={`${publishImages.length}`} />
                  <Definition
                    label="Inventory"
                    value={product.trackInventory ? `${product.inventoryQuantity ?? 0}` : "Not tracked"}
                  />
                </dl>
              </div>

              <label className="flex items-start gap-3 text-sm leading-6">
                <input
                  type="checkbox"
                  checked={livePublishAcknowledged}
                  onChange={(event) => setLivePublishAcknowledged(event.target.checked)}
                  className="mt-1 h-4 w-4 accent-action"
                />
                <span>
                  I reviewed the title, description, images, price, and inventory, and I want to publish this product live.
                </span>
              </label>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-line p-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeLivePublishConfirm}
                disabled={isPublishing}
                className="studio-focus inline-flex h-10 items-center justify-center rounded border border-line bg-white px-4 text-sm font-semibold hover:bg-canvas disabled:opacity-60"
              >
                Keep as draft
              </button>
              <button
                type="button"
                onClick={confirmLivePublish}
                disabled={isPublishing || !livePublishAcknowledged}
                className="studio-focus inline-flex h-10 items-center justify-center gap-2 rounded bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              >
                <PackageCheck className="h-4 w-4" aria-hidden />
                {isPublishing ? "Publishing..." : "Publish live"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function NextRequirementStrip({
  product,
  readinessScore,
  readinessLevel,
  nextItem,
  readyToPublish,
  onOpenTab
}: {
  product: Product;
  readinessScore: number;
  readinessLevel: string;
  nextItem?: ReadinessItem;
  readyToPublish: boolean;
  onOpenTab: (tab: ProductTab) => void;
}) {
  const alreadyPublished = ["PUBLISHED_AS_DRAFT", "PUBLISHED_LIVE"].includes(product.shopifyStatus);
  const targetTab = readyToPublish ? "publish" : nextItem?.tab ?? "brief";
  const title = alreadyPublished
    ? "Shopify draft already created"
    : readyToPublish
      ? "Ready for Shopify draft review"
      : nextItem
        ? `Next requirement: ${nextItem.label}`
        : "Listing workflow is ready";
  const detail = alreadyPublished
    ? "Open the publish tab to view the saved Shopify link and publish history."
    : readyToPublish
      ? "Create a Shopify draft first, then review everything in Shopify before publishing live."
      : nextItem?.detail || "All required listing checks are passing.";
  const buttonLabel = alreadyPublished
    ? "View publish history"
    : readyToPublish
      ? "Open publish controls"
      : nextItem
        ? `Fix ${nextItem.group}`
        : "Open workflow";

  return (
    <div className="grid gap-4 border border-line bg-white p-4 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center">
      <div className="flex h-14 w-14 items-center justify-center rounded border border-line bg-canvas">
        <div className="text-center">
          <p className="text-lg font-semibold leading-none">{readinessScore}</p>
          <p className="mt-0.5 text-[10px] font-semibold uppercase text-muted">score</p>
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase text-muted">{readinessLevel}</p>
        <h2 className="mt-1 text-base font-semibold">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-muted">{detail}</p>
      </div>
      <button
        type="button"
        onClick={() => onOpenTab(targetTab)}
        className="studio-focus inline-flex h-10 items-center justify-center gap-2 rounded border border-line bg-white px-4 text-sm font-semibold hover:bg-canvas"
      >
        {buttonLabel}
        <ArrowRight className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}

function WorkflowFeedback({
  tone,
  message,
  shopifyAdminUrl
}: {
  tone: "success" | "error" | "neutral";
  message: string;
  shopifyAdminUrl: string;
}) {
  const Icon = tone === "error" ? AlertTriangle : CheckCircle2;
  const toneClass =
    tone === "error"
      ? "border-red-200 bg-red-50 text-red-800"
      : tone === "success"
        ? "border-emerald-200 bg-emerald-50 text-emerald-900"
        : "border-line bg-white text-ink";

  return (
    <div className={`flex flex-col gap-3 border p-4 text-sm sm:flex-row sm:items-center sm:justify-between ${toneClass}`}>
      <div className="flex min-w-0 items-start gap-3">
        <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <p className="leading-6">{message}</p>
      </div>
      {shopifyAdminUrl && tone === "success" ? (
        <a
          href={shopifyAdminUrl}
          target="_blank"
          rel="noreferrer"
          className="studio-focus inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded bg-white px-3 font-semibold text-ink ring-1 ring-line hover:bg-canvas"
        >
          Open Shopify
          <ExternalLink className="h-4 w-4" aria-hidden />
        </a>
      ) : null}
    </div>
  );
}

function getTabStates({
  product,
  readinessItems,
  readyToPublish
}: {
  product: Product;
  readinessItems: ReadinessItem[];
  readyToPublish: boolean;
}): Record<ProductTab, "complete" | "attention" | "neutral"> {
  const allComplete = (tab: ProductTab) => {
    const tabItems = readinessItems.filter((item) => item.tab === tab);
    return tabItems.length > 0 && tabItems.every((item) => item.complete);
  };

  const hasAttention = (tab: ProductTab) => readinessItems.some((item) => item.tab === tab && !item.complete);

  return {
    brief: product.targetMarket || product.brandVoice || product.imageStylePreset ? "complete" : "neutral",
    media: allComplete("media") ? "complete" : hasAttention("media") ? "attention" : "neutral",
    copy: allComplete("copy") ? "complete" : hasAttention("copy") ? "attention" : "neutral",
    commerce: allComplete("commerce") ? "complete" : hasAttention("commerce") ? "attention" : "neutral",
    publish: readyToPublish ? "complete" : hasAttention("publish") ? "attention" : "neutral"
  };
}

function getPublishImages(images: ProductImage[]) {
  return getOrderedPublishImages(images);
}

function getInitialTab(value?: string): ProductTab {
  return tabs.some((tab) => tab.id === value) ? (value as ProductTab) : "brief";
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
