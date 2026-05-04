import "server-only";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

const ENCRYPTED_PREFIX = "enc:v1:";

function getEncryptionSecret() {
  return process.env.SHOPIFY_TOKEN_ENCRYPTION_KEY?.trim() || "";
}

function getEncryptionKey() {
  const secret = getEncryptionSecret();
  if (!secret) return null;
  return createHash("sha256").update(secret).digest();
}

export function isSecretEncryptionConfigured() {
  return Boolean(getEncryptionSecret());
}

export function isEncryptedSecret(value: string | null | undefined) {
  return Boolean(value?.startsWith(ENCRYPTED_PREFIX));
}

export function encryptSecret(value: string | null | undefined) {
  if (!value) return null;
  if (isEncryptedSecret(value)) return value;

  const key = getEncryptionKey();
  if (!key) return value;

  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return [
    ENCRYPTED_PREFIX,
    iv.toString("base64url"),
    tag.toString("base64url"),
    encrypted.toString("base64url")
  ].join(".");
}

export function decryptSecret(value: string | null | undefined) {
  if (!value) return "";
  if (!isEncryptedSecret(value)) return value;

  const key = getEncryptionKey();
  if (!key) return "";

  try {
    const [, ivValue, tagValue, encryptedValue] = value.split(".");
    if (!ivValue || !tagValue || !encryptedValue) return "";

    const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(ivValue, "base64url"));
    decipher.setAuthTag(Buffer.from(tagValue, "base64url"));
    return Buffer.concat([
      decipher.update(Buffer.from(encryptedValue, "base64url")),
      decipher.final()
    ]).toString("utf8");
  } catch {
    return "";
  }
}

export function secretHint(value: string | null | undefined) {
  if (!value) return "not saved";
  const decrypted = decryptSecret(value);
  if (!decrypted && isEncryptedSecret(value)) return "encrypted";
  return decrypted ? `••••${decrypted.slice(-4)}` : "not saved";
}
