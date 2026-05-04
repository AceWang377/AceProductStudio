import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { getShopifyAppConfig, isValidShopDomain } from "@/lib/shopify-oauth";

export type ShopifyWebhookVerification =
  | {
      ok: true;
      topic: string;
      shopDomain: string;
      webhookId: string;
    }
  | {
      ok: false;
      status: number;
      error: string;
    };

export function verifyShopifyWebhook(request: Request, rawBody: Buffer): ShopifyWebhookVerification {
  const appConfig = getShopifyAppConfig();
  if (!appConfig.clientSecret) {
    return {
      ok: false,
      status: 503,
      error: "Shopify client secret is not configured."
    };
  }

  const hmac = request.headers.get("x-shopify-hmac-sha256") || "";
  const topic = request.headers.get("x-shopify-topic") || "";
  const shopDomain = (request.headers.get("x-shopify-shop-domain") || "").toLowerCase();
  const webhookId = request.headers.get("x-shopify-webhook-id") || "";

  if (!hmac || !topic || !shopDomain || !isValidShopDomain(shopDomain)) {
    return {
      ok: false,
      status: 400,
      error: "Missing required Shopify webhook headers."
    };
  }

  const digest = createHmac("sha256", appConfig.clientSecret)
    .update(rawBody)
    .digest("base64");
  const digestBuffer = Buffer.from(digest, "base64");
  const hmacBuffer = Buffer.from(hmac, "base64");

  if (digestBuffer.length !== hmacBuffer.length || !timingSafeEqual(digestBuffer, hmacBuffer)) {
    return {
      ok: false,
      status: 401,
      error: "Invalid Shopify webhook signature."
    };
  }

  return {
    ok: true,
    topic,
    shopDomain,
    webhookId
  };
}
