import Image from "next/image";
import { Download } from "lucide-react";
import { imageTypeLabel } from "@/lib/status";
import type { ProductImage } from "@/lib/types";

export function GeneratedImageGrid({ images }: { images: ProductImage[] }) {
  const orderedImages = [...images].sort((a, b) => {
    if (a.type === "ORIGINAL" && b.type !== "ORIGINAL") return 1;
    if (a.type !== "ORIGINAL" && b.type === "ORIGINAL") return -1;
    if (a.type === "LIFESTYLE" && b.type !== "LIFESTYLE") return -1;
    if (a.type !== "LIFESTYLE" && b.type === "LIFESTYLE") return 1;
    if (a.type === "WHITE_BACKGROUND" && b.type !== "WHITE_BACKGROUND") return 1;
    if (a.type !== "WHITE_BACKGROUND" && b.type === "WHITE_BACKGROUND") return -1;
    return a.sortOrder - b.sortOrder;
  });
  const publishableImages = orderedImages.filter((image) => image.type !== "ORIGINAL");

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
      {orderedImages.map((image) => {
        const publishIndex = publishableImages.findIndex((item) => item.id === image.id);
        const publishLabel =
          image.type === "ORIGINAL"
            ? "Not published"
            : publishIndex === 0
              ? "Shopify image 1"
              : image.type === "WHITE_BACKGROUND"
                ? "Shopify last image"
                : `Shopify image ${publishIndex + 1}`;

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
          <figcaption className="flex items-center justify-between gap-3 px-3 py-2 text-xs">
            <span className="font-medium">{imageTypeLabel(image.type)}</span>
            <span className="flex items-center gap-3">
              {image.isSelected ? <span className="text-action">Selected</span> : null}
              <a
                href={image.url}
                download={`${image.type.toLowerCase()}-${image.id}.png`}
                className="studio-focus inline-flex h-8 w-8 items-center justify-center rounded border border-line text-muted transition hover:bg-canvas hover:text-ink"
                title={`Download ${imageTypeLabel(image.type)}`}
              >
                <Download className="h-4 w-4" aria-hidden />
                <span className="sr-only">Download {imageTypeLabel(image.type)}</span>
              </a>
            </span>
          </figcaption>
        </figure>
        );
      })}
    </div>
  );
}
