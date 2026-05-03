import "server-only";
import { randomUUID } from "crypto";
import { mkdir, readFile, unlink, writeFile } from "fs/promises";
import path from "path";
import { createSupabaseAdminClient, isSupabaseStorageEnabled } from "@/lib/supabase-admin";

const bucketName = process.env.SUPABASE_STORAGE_BUCKET?.trim() || "product-images";

export type StoredMedia = {
  key: string;
  url: string;
};

export type ImageBytes = {
  bytes: Buffer;
  mimeType: string;
  filename: string;
};

export function getMediaStorageBucketName() {
  return bucketName;
}

export function isDurableMediaStorageEnabled() {
  return isSupabaseStorageEnabled();
}

export async function checkMediaStorageBucket() {
  if (!isDurableMediaStorageEnabled()) {
    return {
      ok: false,
      message: "Supabase storage is not configured."
    };
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.storage.getBucket(bucketName);
  return {
    ok: !error,
    message: error?.message || "Storage bucket is available."
  };
}

async function ensureMediaBucket() {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.storage.getBucket(bucketName);
  if (!error) return supabase;

  const created = await supabase.storage.createBucket(bucketName, {
    public: true,
    fileSizeLimit: "10MB",
    allowedMimeTypes: ["image/png", "image/jpeg", "image/webp"]
  });

  if (created.error && !created.error.message.toLowerCase().includes("already exists")) {
    throw new Error(`Could not create Supabase storage bucket: ${created.error.message}`);
  }

  return supabase;
}

export async function saveMediaBuffer(input: {
  buffer: Buffer;
  mimeType: string;
  extension: string;
  folder: "uploads" | "generated";
  keyPrefix?: string;
}): Promise<StoredMedia> {
  const filename = `${input.keyPrefix ? `${input.keyPrefix}-` : ""}${randomUUID()}.${input.extension}`;
  const key = `${input.folder}/${filename}`;

  if (isDurableMediaStorageEnabled()) {
    const supabase = await ensureMediaBucket();
    const { error } = await supabase.storage.from(bucketName).upload(key, input.buffer, {
      contentType: input.mimeType,
      upsert: false
    });

    if (error) {
      throw new Error(`Could not upload image to Supabase Storage: ${error.message}`);
    }

    const { data } = supabase.storage.from(bucketName).getPublicUrl(key);
    return {
      key,
      url: data.publicUrl
    };
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  const filePath = path.join(uploadDir, filename);
  await writeFile(filePath, input.buffer);

  return {
    key: `uploads/${filename}`,
    url: `/uploads/${filename}`
  };
}

export async function deleteStoredMedia(keys: Array<string | null | undefined>) {
  const uniqueKeys = Array.from(
    new Set(keys.filter((key): key is string => Boolean(key?.trim())))
  );

  if (!uniqueKeys.length) return;

  if (isDurableMediaStorageEnabled()) {
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.storage.from(bucketName).remove(uniqueKeys);
    if (error) {
      throw new Error(`Could not delete images from Supabase Storage: ${error.message}`);
    }
    return;
  }

  await Promise.all(
    uniqueKeys
      .filter((key) => key.startsWith("uploads/"))
      .map(async (key) => {
        try {
          await unlink(path.join(process.cwd(), "public", key));
        } catch {
          // Missing local files should not block product deletion.
        }
      })
  );
}

export async function readImageBytesFromUrl(url: string): Promise<ImageBytes> {
  if (url.startsWith("/uploads/")) {
    const filePath = path.join(process.cwd(), "public", url);
    const bytes = await readFile(filePath);
    const extension = path.extname(filePath).toLowerCase();
    const mimeType =
      extension === ".png" ? "image/png" : extension === ".webp" ? "image/webp" : "image/jpeg";
    return {
      bytes,
      mimeType,
      filename: path.basename(filePath)
    };
  }

  if (!/^https?:\/\//i.test(url)) {
    throw new Error("Only uploaded image URLs can be sent to OpenAI.");
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Could not read uploaded image (${response.status}).`);
  }

  const contentType = response.headers.get("content-type")?.split(";")[0]?.trim() || "image/jpeg";
  if (!["image/png", "image/jpeg", "image/webp"].includes(contentType)) {
    throw new Error(`Unsupported uploaded image type: ${contentType}`);
  }

  const pathname = new URL(url).pathname;
  const filename = path.basename(pathname) || `product-image.${mimeTypeToExtension(contentType)}`;

  return {
    bytes: Buffer.from(await response.arrayBuffer()),
    mimeType: contentType,
    filename
  };
}

export function mimeTypeToExtension(mimeType: string) {
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  return "jpg";
}
