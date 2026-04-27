import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  createOAuthState,
  getAppBaseUrl,
  getShopifyAppConfig,
  normalizeShopDomain,
  SHOPIFY_SCOPES
} from "@/lib/shopify-oauth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const shop = normalizeShopDomain(url.searchParams.get("shop"));
  if (!shop) {
    return NextResponse.json(
      { error: "Enter a valid Shopify store domain, such as your-store.myshopify.com." },
      { status: 400 }
    );
  }

  const appConfig = getShopifyAppConfig();
  if (!appConfig.configured || !appConfig.clientId) {
    return NextResponse.json(
      { error: "Set SHOPIFY_CLIENT_ID and SHOPIFY_CLIENT_SECRET before using Shopify OAuth." },
      { status: 500 }
    );
  }

  const state = createOAuthState();
  const redirectUri = `${getAppBaseUrl(request)}/api/shopify/oauth/callback`;
  const authorizeUrl = new URL(`https://${shop}/admin/oauth/authorize`);
  authorizeUrl.searchParams.set("client_id", appConfig.clientId);
  authorizeUrl.searchParams.set("scope", SHOPIFY_SCOPES);
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);
  authorizeUrl.searchParams.set("state", state);

  const cookieStore = await cookies();
  cookieStore.set("shopify_oauth_state", state, {
    httpOnly: true,
    maxAge: 10 * 60,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });
  cookieStore.set("shopify_oauth_shop", shop, {
    httpOnly: true,
    maxAge: 10 * 60,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });

  return NextResponse.redirect(authorizeUrl);
}
