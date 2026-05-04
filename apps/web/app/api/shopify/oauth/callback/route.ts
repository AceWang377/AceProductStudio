import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  getAppBaseUrl,
  getShopifyAppConfig,
  isValidShopDomain,
  verifyShopifyHmac
} from "@/lib/shopify-oauth";
import { registerShopifyUninstallWebhook } from "@/lib/shopify-webhook-registration";
import { saveShopifyConnection, saveShopifyWebhookRegistration } from "@/lib/store";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const shop = url.searchParams.get("shop") || "";
    const code = url.searchParams.get("code") || "";
    const state = url.searchParams.get("state") || "";
    const appConfig = getShopifyAppConfig();
    const cookieStore = await cookies();
    const expectedState = cookieStore.get("shopify_oauth_state")?.value;
    const expectedShop = cookieStore.get("shopify_oauth_shop")?.value;

    if (!appConfig.configured || !appConfig.clientId || !appConfig.clientSecret) {
      return oauthError(request, "not_configured");
    }
    if (!shop || !isValidShopDomain(shop)) {
      return oauthError(request, "invalid_shop");
    }
    if (!code) {
      return oauthError(request, "missing_code");
    }
    if (!state || state !== expectedState || shop !== expectedShop) {
      return oauthError(request, "state_failed");
    }
    if (!verifyShopifyHmac(url.searchParams, appConfig.clientSecret)) {
      return oauthError(request, "signature_failed");
    }

    const tokenResponse = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        client_id: appConfig.clientId,
        client_secret: appConfig.clientSecret,
        code
      })
    });

    if (!tokenResponse.ok) {
      return oauthError(request, "token_exchange_failed");
    }

    const payload = (await tokenResponse.json()) as { access_token?: string; scope?: string };
    if (!payload.access_token) {
      return oauthError(request, "token_exchange_failed");
    }

    const connection = await saveShopifyConnection({
      shopDomain: shop,
      adminAccessToken: payload.access_token
    });
    const webhookRegistration = await registerShopifyUninstallWebhook({
      shopDomain: shop,
      accessToken: payload.access_token,
      appBaseUrl: getAppBaseUrl(request)
    });
    await saveShopifyWebhookRegistration({
      connectionId: connection.id,
      shopDomain: shop,
      status: webhookRegistration.ok ? webhookRegistration.status : "warning",
      subscriptionId: webhookRegistration.ok ? webhookRegistration.subscriptionId : undefined,
      callbackUrl: webhookRegistration.uri,
      error: webhookRegistration.ok ? undefined : webhookRegistration.error
    }).catch(() => undefined);

    cookieStore.delete("shopify_oauth_state");
    cookieStore.delete("shopify_oauth_shop");

    const redirectUrl = new URL("/settings/shopify", getAppBaseUrl(request));
    redirectUrl.searchParams.set("connected", "1");
    redirectUrl.searchParams.set("shop", shop);
    redirectUrl.searchParams.set("webhook", webhookRegistration.ok ? webhookRegistration.status : "warning");
    return NextResponse.redirect(redirectUrl);
  } catch {
    return oauthError(request, "callback_failed");
  }
}

function oauthError(request: Request, message: string) {
  const redirectUrl = new URL("/settings/shopify", getAppBaseUrl(request));
  redirectUrl.searchParams.set("error", message);
  return NextResponse.redirect(redirectUrl);
}
