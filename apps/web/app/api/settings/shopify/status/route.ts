import { NextResponse } from "next/server";
import { getShopifyCredentialStatus } from "@ai-product-studio/shopify";
import { readState } from "@/lib/store";

export async function GET() {
  const state = await readState();
  const credentials = getShopifyCredentialStatus({
    shopDomain: state.shopifyConnection?.shopDomain,
    adminAccessToken: state.shopifyConnection?.adminAccessToken,
    clientId: state.shopifyConnection?.clientId,
    clientSecret: state.shopifyConnection?.clientSecret
  });
  return NextResponse.json({
    configured: credentials.configured,
    connected: credentials.configured,
    shopDomain: credentials.shopDomain,
    authMode: credentials.authMode,
    imagesCanPublish: credentials.imagesCanPublish
  });
}
