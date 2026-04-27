import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const allowedTypes = new Set(["image/png", "image/jpeg", "image/webp"]);
const maxSize = 10 * 1024 * 1024;

export async function saveUploadedImage(file: File) {
  if (!allowedTypes.has(file.type)) {
    throw new Error("Only PNG, JPEG, and WebP images are supported.");
  }

  if (file.size > maxSize) {
    throw new Error("Images must be 10MB or smaller.");
  }

  const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const key = `${randomUUID()}.${extension}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  const filePath = path.join(uploadDir, key);
  const buffer = Buffer.from(await file.arrayBuffer());

  await mkdir(uploadDir, { recursive: true });
  await writeFile(filePath, buffer);

  return {
    key: `uploads/${key}`,
    url: `/uploads/${key}`
  };
}
