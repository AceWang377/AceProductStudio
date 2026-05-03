import { mimeTypeToExtension, saveMediaBuffer } from "@/lib/media-storage";

const allowedTypes = new Set(["image/png", "image/jpeg", "image/webp"]);
const maxSize = 10 * 1024 * 1024;

export async function saveUploadedImage(file: File) {
  if (!allowedTypes.has(file.type)) {
    throw new Error("Only PNG, JPEG, and WebP images are supported.");
  }

  if (file.size > maxSize) {
    throw new Error("Images must be 10MB or smaller.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  return saveMediaBuffer({
    buffer,
    mimeType: file.type,
    extension: mimeTypeToExtension(file.type),
    folder: "uploads"
  });
}
