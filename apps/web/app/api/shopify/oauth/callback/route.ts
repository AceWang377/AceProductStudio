import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  getAppBaseUrl,
  getShopifyAppConfig,
  isValidShopDomain,
  verifyShopifyHmac
} from "@/lib/shopify-oauth";
import { saveShopifyConnection } from "@/lib/store";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop") || "";
  const code = url.searchParams.get("code") || "";
  const state = url.searchParams.get("state") || "";
  const appConfig = getShopifyAppConfig();
  const cookieStore = await cookies();
  const expectedState = cookieStore.get("shopify_oauth_state")?.value;
  const expectedShop = cookieStore.get("shopify_oauth_shop")?.value;

  if (!appConfig.configured || !appConfig.clientId || !appConfig.clientSecret) {
    return oauthError(request, "Shopify OAuth is not configured. Set SHOPIFY_CLIENT_ID and SHOPIFY_CLIENT_SECRET.");
  }
  if (!shop || !isValidShopDomain(shop)) {
    return oauthError(request, "Shopify returned an invalid shop domain.");
  }
  if (!code) {
    return oauthError(request, "Shopify did not return an authorization code.");
  }
  if (!state || state !== expectedState || shop !== expectedShop) {
    return oauthError(request, "Shopify OAuth state validation failed. Start the connection again.");
  }
  if (!verifyShopifyHmac(url.searchParams, appConfig.clientSecret)) {
    return oauthError(request, "Shopify OAuth signature validation failed.");
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
    const text = await tokenResponse.text();
    return oauthError(request, `Shopify token exchange failed (${tokenResponse.status}): ${text.slice(0, 500)}`);
  }

  const payload = (await tokenResponse.json()) as { access_token?: string; scope?: string };
  if (!payload.access_token) {
    return oauthError(request, "Shopify token exchange did not return an access token.");
  }

  await saveShopifyConnection({
    shopDomain: shop,
    adminAccessToken: payload.access_token
  });

  cookieStore.delete("shopify_oauth_state");
  cookieStore.delete("shopify_oauth_shop");

  const redirectUrl = new URL("/settings/shopify", getAppBaseUrl(request));
  redirectUrl.searchParams.set("connected", "1");
  redirectUrl.searchParams.set("shop", shop);
  return NextResponse.redirect(redirectUrl);
}

function oauthError(request: Request, message: string) {
  const redirectUrl = new URL("/settings/shopify", getAppBaseUrl(request));
  redirectUrl.searchParams.set("error", message);
  return NextResponse.redirect(redirectUrl);
}
