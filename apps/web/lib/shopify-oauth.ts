import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export const SHOPIFY_SCOPES = [
  "read_products",
  "write_products",
  "write_files",
  "read_locations",
  "write_inventory",
  "read_publications",
  "write_publications"
].join(",");

export function getShopifyAppConfig() {
  const clientId = process.env.SHOPIFY_CLIENT_ID?.trim();
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET?.trim();
  return {
    clientId,
    clientSecret,
    configured: Boolean(clientId && clientSecret)
  };
}

export function createOAuthState() {
  return randomBytes(24).toString("hex");
}

export function normalizeShopDomain(input?: string | null) {
  const value = input?.trim();
  if (!value) return null;

  try {
    const parsed = new URL(value.startsWith("http") ? value : `https://${value}`);
    const hostname = parsed.hostname.replace(/^www\./, "").toLowerCase();
    if (hostname === "admin.shopify.com") {
      const storeHandle = parsed.pathname.match(/\/store\/([^/?#]+)/)?.[1];
      return storeHandle ? `${storeHandle.toLowerCase()}.myshopify.com` : null;
    }
    return isValidShopDomain(hostname) ? hostname : null;
  } catch {
    const cleaned = value
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .replace(/\/.*$/, "")
      .toLowerCase();
    if (isValidShopDomain(cleaned)) return cleaned;
    if (/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(cleaned)) return `${cleaned}.myshopify.com`;
    return null;
  }
}

export function isValidShopDomain(shop: string) {
  return /^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/.test(shop);
}

export function getAppBaseUrl(request: Request) {
  const explicit = process.env.APP_PUBLIC_URL?.trim() || process.env.NEXT_PUBLIC_APP_URL?.trim();
  const requestOrigin = new URL(request.url).origin;
  if (!explicit) return requestOrigin;

  try {
    const explicitUrl = new URL(explicit);
    const requestUrl = new URL(request.url);
    const requestHost = requestUrl.hostname.replace(/^www\./, "");
    const explicitHost = explicitUrl.hostname.replace(/^www\./, "");

    if (requestHost === explicitHost && requestUrl.protocol === "https:") {
      return requestOrigin.replace(/\/$/, "");
    }

    return explicitUrl.origin.replace(/\/$/, "");
  } catch {
    return requestOrigin.replace(/\/$/, "");
  }
}

export function verifyShopifyHmac(searchParams: URLSearchParams, clientSecret: string) {
  const hmac = searchParams.get("hmac");
  if (!hmac) return false;

  const message = Array.from(searchParams.entries())
    .filter(([key]) => key !== "hmac" && key !== "signature")
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  const digest = createHmac("sha256", clientSecret).update(message).digest("hex");
  const hmacBuffer = Buffer.from(hmac, "hex");
  const digestBuffer = Buffer.from(digest, "hex");

  if (hmacBuffer.length !== digestBuffer.length) return false;
  return timingSafeEqual(hmacBuffer, digestBuffer);
}
