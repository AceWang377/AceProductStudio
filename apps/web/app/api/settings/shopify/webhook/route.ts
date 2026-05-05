import { NextResponse } from "next/server";
import { requireCurrentUser } from "@/lib/auth";
import { getAppBaseUrl } from "@/lib/shopify-oauth";
import { registerShopifyUninstallWebhook } from "@/lib/shopify-webhook-registration";
import { readState, saveShopifyWebhookRegistration } from "@/lib/store";

export async function POST(request: Request) {
  await requireCurrentUser();

  const state = await readState();
  const connection = state.shopifyConnection;

  if (!connection?.shopDomain || !connection.adminAccessToken) {
    return NextResponse.json(
      { error: "Connect Shopify before registering the uninstall webhook." },
      { status: 400 }
    );
  }

  const registration = await registerShopifyUninstallWebhook({
    shopDomain: connection.shopDomain,
    accessToken: connection.adminAccessToken,
    appBaseUrl: getAppBaseUrl(request)
  });

  await saveShopifyWebhookRegistration({
    connectionId: connection.id,
    shopDomain: connection.shopDomain,
    status: registration.ok ? registration.status : "warning",
    subscriptionId: registration.ok ? registration.subscriptionId : undefined,
    callbackUrl: registration.uri,
    error: registration.ok ? undefined : registration.error
  });

  return NextResponse.json({
    ok: registration.ok,
    webhookStatus: registration.ok ? registration.status : "warning",
    webhookSubscriptionId: registration.ok ? registration.subscriptionId : undefined,
    webhookCallbackUrl: registration.uri,
    webhookLastRegisteredAt: new Date().toISOString(),
    webhookLastError: registration.ok ? null : registration.error
  });
}
