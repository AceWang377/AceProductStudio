"use client";

import Image from "next/image";
import { useState } from "react";
import { ArrowDown, ArrowUp, Download, Star, Trash2 } from "lucide-react";
import { getOrderedMediaImages, getOrderedPublishImages } from "@/lib/product-images";
import { imageTypeLabel } from "@/lib/status";
import type { Product, ProductImage } from "@/lib/types";

export function GeneratedImageGrid({
  productId,
  images,
  onChanged
}: {
  productId: string;
  images: ProductImage[];
  onChanged: (product: Product) => void;
}) {
  const [pendingAction, setPendingAction] = useState("");
  const [message, setMessage] = useState("");
  const orderedImages = getOrderedMediaImages(images);
  const publishableImages = getOrderedPublishImages(images);

  async function updateImageOrder(nextIds: string[], actionKey: string) {
    setPendingAction(actionKey);
    setMessage("");

    const response = await fetch(`/api/products/${productId}/images`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedImageIds: nextIds })
    });
    const payload = await response.json().catch(() => ({}));
    setPendingAction("");

    if (!response.ok) {
      setMessage(payload.error || "Could not update image order.");
      return;
    }

    onChanged(payload);
  }

  async function setCover(imageId: string) {
    setPendingAction(`cover-${imageId}`);
    setMessage("");

    const response = await fetch(`/api/products/${productId}/images/${imageId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "cover" })
    });
    const payload = await response.json().catch(() => ({}));
    setPendingAction("");

    if (!response.ok) {
      setMessage(payload.error || "Could not set cover image.");
      return;
    }

    onChanged(payload);
  }

  async function deleteImage(image: ProductImage) {
    const confirmed = window.confirm(`Delete ${imageTypeLabel(image.type)} from this product?`);
    if (!confirmed) return;

    setPendingAction(`delete-${image.id}`);
    setMessage("");

    const response = await fetch(`/api/products/${productId}/images/${image.id}`, {
      method: "DELETE"
    });
    const payload = await response.json().catch(() => ({}));
    setPendingAction("");

    if (!response.ok) {
      setMessage(payload.error || "Could not delete image.");
      return;
    }

    onChanged(payload);
  }

  function moveImage(imageId: string, direction: "up" | "down") {
    const ids = publishableImages.map((image) => image.id);
    const index = ids.indexOf(imageId);
    const nextIndex = direction === "up" ? index - 1 : index + 1;
    if (index < 0 || nextIndex < 0 || nextIndex >= ids.length) return;

    const nextIds = [...ids];
    [nextIds[index], nextIds[nextIndex]] = [nextIds[nextIndex], nextIds[index]];
    updateImageOrder(nextIds, `${direction}-${imageId}`);
  }

  return (
    <div className="space-y-3">
      {message ? (
        <div className="border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {message}
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {orderedImages.map((image) => {
          const publishIndex = publishableImages.findIndex((item) => item.id === image.id);
          const isPublishable = image.type !== "ORIGINAL";
          const isCover = isPublishable && publishIndex === 0;
          const publishLabel = isPublishable
            ? isCover
              ? "Shopify cover"
              : `Shopify image ${publishIndex + 1}`
            : "Not published";

          return (
            <figure key={image.id} className="group overflow-hidden border border-line bg-white">
              <div className="relative aspect-square overflow-hidden bg-canvas">
                <Image
                  src={image.url}
                  alt={imageTypeLabel(image.type)}
                  fill
                  className="object-cover transition duration-300 group-hover:scale-[1.03]"
                  sizes="(min-width: 1024px) 240px, 50vw"
                />
                <span className="absolute left-2 top-2 rounded bg-white/90 px-2 py-1 text-[11px] font-semibold text-ink shadow-sm">
                  {publishLabel}
                </span>
              </div>
              <figcaption className="space-y-2 px-3 py-2 text-xs">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium">{imageTypeLabel(image.type)}</span>
                  {isCover ? <span className="text-action">Cover</span> : null}
                </div>
                <div className="grid grid-cols-5 gap-2">
                  <button
                    type="button"
                    onClick={() => setCover(image.id)}
                    disabled={!isPublishable || pendingAction === `cover-${image.id}`}
                    className="studio-focus inline-flex h-8 items-center justify-center rounded border border-line text-muted transition hover:bg-canvas hover:text-ink disabled:opacity-40"
                    title="Set as Shopify cover"
                  >
                    <Star className="h-4 w-4" aria-hidden />
                    <span className="sr-only">Set as Shopify cover</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => moveImage(image.id, "up")}
                    disabled={!isPublishable || publishIndex <= 0 || pendingAction === `up-${image.id}`}
                    className="studio-focus inline-flex h-8 items-center justify-center rounded border border-line text-muted transition hover:bg-canvas hover:text-ink disabled:opacity-40"
                    title="Move earlier"
                  >
                    <ArrowUp className="h-4 w-4" aria-hidden />
                    <span className="sr-only">Move earlier</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => moveImage(image.id, "down")}
                    disabled={
                      !isPublishable ||
                      publishIndex < 0 ||
                      publishIndex >= publishableImages.length - 1 ||
                      pendingAction === `down-${image.id}`
                    }
                    className="studio-focus inline-flex h-8 items-center justify-center rounded border border-line text-muted transition hover:bg-canvas hover:text-ink disabled:opacity-40"
                    title="Move later"
                  >
                    <ArrowDown className="h-4 w-4" aria-hidden />
                    <span className="sr-only">Move later</span>
                  </button>
                  <a
                    href={image.url}
                    download={`${image.type.toLowerCase()}-${image.id}.png`}
                    className="studio-focus inline-flex h-8 items-center justify-center rounded border border-line text-muted transition hover:bg-canvas hover:text-ink"
                    title={`Download ${imageTypeLabel(image.type)}`}
                  >
                    <Download className="h-4 w-4" aria-hidden />
                    <span className="sr-only">Download {imageTypeLabel(image.type)}</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => deleteImage(image)}
                    disabled={!isPublishable || pendingAction === `delete-${image.id}`}
                    className="studio-focus inline-flex h-8 items-center justify-center rounded border border-red-200 text-red-700 transition hover:bg-red-50 disabled:opacity-40"
                    title="Delete image"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                    <span className="sr-only">Delete image</span>
                  </button>
                </div>
              </figcaption>
            </figure>
          );
        })}
      </div>
    </div>
  );
}
