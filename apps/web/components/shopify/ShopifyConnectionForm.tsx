"use client";

import { FormEvent, useState } from "react";
import { ExternalLink } from "lucide-react";
import type { ShopifyConnection } from "@/lib/types";

type CredentialStatus = {
  configured: boolean;
  shopDomain: string | null;
  authMode: string;
  imagesCanPublish: boolean;
};

type SafeShopifyConnection = Omit<ShopifyConnection, "adminAccessToken" | "clientSecret">;

export function ShopifyConnectionForm({
  initialConnection,
  initialCredentialStatus
}: {
  initialConnection?: SafeShopifyConnection;
  initialCredentialStatus: CredentialStatus;
}) {
  const [shopDomain, setShopDomain] = useState(initialConnection?.shopDomain || "");
  const [authMode, setAuthMode] = useState(
    initialCredentialStatus.authMode === "client-credentials" ? "client-credentials" : "admin-token"
  );
  const [adminAccessToken, setAdminAccessToken] = useState("");
  const [clientId, setClientId] = useState(initialConnection?.clientId || "");
  const [clientSecret, setClientSecret] = useState("");
  const [status, setStatus] = useState(
    initialCredentialStatus.configured ? "Ready to publish drafts" : "Connect a store before publishing"
  );
  const [credentialStatus, setCredentialStatus] = useState(initialCredentialStatus);
  const [isSaving, setIsSaving] = useState(false);
  const [showManual, setShowManual] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    const response = await fetch("/api/settings/shopify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        shopDomain,
        adminAccessToken: authMode === "admin-token" ? adminAccessToken : "",
        clientId: authMode === "client-credentials" ? clientId : "",
        clientSecret: authMode === "client-credentials" ? clientSecret : ""
      })
    });
    const payload = await response.json();
    if (response.ok) {
      const statusResponse = await fetch("/api/settings/shopify/status");
      if (statusResponse.ok) {
        const nextStatus = await statusResponse.json();
        setCredentialStatus(nextStatus);
        setStatus(nextStatus.connected ? "Ready to publish drafts" : "Credentials are incomplete.");
      } else {
        setStatus(`Saved ${payload.shopDomain}`);
      }
    } else {
      setStatus(payload.error);
    }
    setIsSaving(false);
  }

  function connectWithShopify() {
    if (!shopDomain.trim()) {
      setStatus("Enter a Shopify store domain first.");
      return;
    }
    window.location.href = `/api/shopify/oauth/start?shop=${encodeURIComponent(shopDomain)}`;
  }

  return (
    <form onSubmit={onSubmit} className="max-w-2xl border border-line bg-white p-5">
      <h1 className="text-2xl font-semibold">Shopify connection</h1>
      <p className="mt-2 text-sm text-muted">
        Connect a store with Shopify OAuth. The app stores the shop token server-side and uses it for publishing.
      </p>
      <div className="mt-6 space-y-4">
        <label className="block">
          <span className="text-sm font-medium">Shopify store domain</span>
          <input
            value={shopDomain}
            onChange={(event) => setShopDomain(event.target.value)}
            className="studio-focus mt-2 h-11 w-full rounded border border-line px-3"
            placeholder="your-store.myshopify.com"
          />
          <span className="mt-2 block text-xs text-muted">
            Use your store's original .myshopify.com domain or paste an admin.shopify.com/store/... URL. Do not use the public customer domain.
          </span>
        </label>
        <button
          type="button"
          onClick={connectWithShopify}
          className="studio-focus inline-flex h-11 items-center justify-center gap-2 rounded bg-action px-4 text-sm font-semibold text-white"
        >
          Connect Shopify <ExternalLink className="h-4 w-4" aria-hidden />
        </button>
        <div className="border-t border-line pt-4">
          <button
            type="button"
            onClick={() => setShowManual((value) => !value)}
            className="studio-focus text-sm font-semibold text-muted underline-offset-4 hover:text-ink hover:underline"
          >
            {showManual ? "Hide manual connection" : "Use manual credentials instead"}
          </button>
        </div>
        {showManual ? (
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium">Connection type</span>
              <select
                value={authMode}
                onChange={(event) => setAuthMode(event.target.value)}
                className="studio-focus mt-2 h-11 w-full rounded border border-line bg-white px-3"
              >
                <option value="admin-token">Admin API access token</option>
                <option value="client-credentials">Dev Dashboard client credentials</option>
              </select>
            </label>
            {authMode === "admin-token" ? (
              <label className="block">
                <span className="text-sm font-medium">Admin API access token</span>
                <input
                  value={adminAccessToken}
                  onChange={(event) => setAdminAccessToken(event.target.value)}
                  className="studio-focus mt-2 h-11 w-full rounded border border-line px-3"
                  placeholder={initialConnection?.accessTokenHint || "shpat_..."}
                  type="password"
                />
              </label>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium">Client ID</span>
                  <input
                    value={clientId}
                    onChange={(event) => setClientId(event.target.value)}
                    className="studio-focus mt-2 h-11 w-full rounded border border-line px-3"
                    placeholder={initialConnection?.clientIdHint || "Shopify client ID"}
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium">Client secret</span>
                  <input
                    value={clientSecret}
                    onChange={(event) => setClientSecret(event.target.value)}
                    className="studio-focus mt-2 h-11 w-full rounded border border-line px-3"
                    placeholder={initialConnection?.clientSecretHint || "Shopify client secret"}
                    type="password"
                  />
                </label>
              </div>
            )}
          </div>
        ) : null}
        <div className="rounded border border-line bg-canvas p-4 text-sm">
          <p className="font-medium">Connection status</p>
          <p className="mt-2 text-muted">
            Credentials are saved in the local app state for this studio. Use scopes <code>read_products</code>,{" "}
            <code>write_products</code>, <code>write_files</code>, <code>read_locations</code>, and{" "}
            <code>write_inventory</code>, plus <code>read_publications</code> and <code>write_publications</code> for live publishing.
          </p>
          <dl className="mt-4 grid gap-2 sm:grid-cols-2">
            <div>
              <dt className="text-muted">Auth mode</dt>
              <dd>{credentialStatus.authMode}</dd>
            </div>
            <div>
              <dt className="text-muted">Image publishing</dt>
              <dd>{credentialStatus.imagesCanPublish ? "Public URLs configured" : "Needs deployed public URL"}</dd>
            </div>
          </dl>
        </div>
      </div>
      <div className="mt-5 flex items-center justify-between gap-3">
        <p className="text-sm text-muted">{status}</p>
        {showManual ? (
          <button
            type="submit"
            disabled={isSaving}
            className="studio-focus h-10 rounded bg-action px-4 text-sm font-semibold text-white disabled:opacity-60"
          >
            {isSaving ? "Saving..." : "Save manual connection"}
          </button>
        ) : null}
      </div>
    </form>
  );
}
