import { getShopifyCredentialStatus } from "@ai-product-studio/shopify";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
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

type ShopifySettingsSearchParams = Promise<Record<string, string | string[] | undefined>>;

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ShopifySettingsPage({
  searchParams
}: {
  searchParams?: ShopifySettingsSearchParams;
}) {
  const params = searchParams ? await searchParams : {};
  const connectedShop = firstParam(params.shop);
  const oauthConnected = firstParam(params.connected) === "1";
  const oauthError = firstParam(params.error);
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
      {oauthConnected ? (
        <div className="max-w-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <div className="flex gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none" aria-hidden />
            <div>
              <p className="font-semibold">Shopify connected successfully</p>
              <p className="mt-1">
                {connectedShop ? `${connectedShop} is ready for draft publishing.` : "Your store is ready for draft publishing."}
              </p>
            </div>
          </div>
        </div>
      ) : null}
      {!oauthConnected && credentialStatus.configured ? (
        <div className="max-w-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <div className="flex gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none" aria-hidden />
            <div>
              <p className="font-semibold">Shopify connection active</p>
              <p className="mt-1">{credentialStatus.shopDomain} is connected and ready for product publishing.</p>
            </div>
          </div>
        </div>
      ) : null}
      {oauthError ? (
        <div className="max-w-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-none" aria-hidden />
            <div>
              <p className="font-semibold">Shopify connection failed</p>
              <p className="mt-1 break-words">{oauthError}</p>
            </div>
          </div>
        </div>
      ) : null}
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
