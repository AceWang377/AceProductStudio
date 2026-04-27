import { getShopifyCredentialStatus } from "@ai-product-studio/shopify";
import { getShopifyAppConfig } from "@/lib/shopify-oauth";
import { readState } from "@/lib/store";
import { ShopifyConnectionForm } from "@/components/shopify/ShopifyConnectionForm";
import type { ShopifyConnection } from "@/lib/types";

export const dynamic = "force-dynamic";

function redactConnection(connection?: ShopifyConnection) {
  if (!connection) return undefined;
  const {
    adminAccessToken: _adminAccessToken,
    clientSecret: _clientSecret,
    ...safeConnection
  } = connection;
  return safeConnection;
}

export default async function ShopifySettingsPage() {
  const state = await readState();
  const credentialStatus = getShopifyCredentialStatus({
    shopDomain: state.shopifyConnection?.shopDomain,
    adminAccessToken: state.shopifyConnection?.adminAccessToken,
    clientId: state.shopifyConnection?.clientId,
    clientSecret: state.shopifyConnection?.clientSecret
  });
  const appConfig = getShopifyAppConfig();

  return (
    <div className="space-y-4">
      {!appConfig.configured ? (
        <div className="max-w-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Shopify OAuth needs <code>SHOPIFY_CLIENT_ID</code> and <code>SHOPIFY_CLIENT_SECRET</code> in the server environment.
        </div>
      ) : null}
      <ShopifyConnectionForm
        initialConnection={redactConnection(state.shopifyConnection)}
        initialCredentialStatus={credentialStatus}
      />
    </div>
  );
}
