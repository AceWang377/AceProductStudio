"use client";

import { FormEvent, useState } from "react";
import { CheckCircle2, CircleAlert, ExternalLink, Loader2, Unplug } from "lucide-react";
import type { ShopifyConnection } from "@/lib/types";

type CredentialStatus = {
  configured: boolean;
  connected?: boolean;
  shopDomain: string | null;
  authMode: string;
  imagesCanPublish: boolean;
};

type SafeShopifyConnection = Omit<ShopifyConnection, "adminAccessToken" | "clientSecret">;
type StatusTone = "neutral" | "success" | "error";
type WebhookState = Pick<
  SafeShopifyConnection,
  "webhookStatus" | "webhookSubscriptionId" | "webhookCallbackUrl" | "webhookLastRegisteredAt" | "webhookLastError"
>;

function getWebhookDisplay(webhook?: WebhookState) {
  const status = webhook?.webhookStatus;
  if (status === "registered" || status === "already_registered") {
    const checkedAt = webhook?.webhookLastRegisteredAt;
    return {
      label: "Ready",
      detail: checkedAt
        ? `Checked ${checkedAt.slice(0, 10)}`
        : "Shopify uninstall events are linked.",
      ready: true
    };
  }
  if (status === "warning") {
    return {
      label: "Needs repair",
      detail: webhook?.webhookLastError || "Register the uninstall webhook again, or reconnect Shopify.",
      ready: false
    };
  }
  return {
    label: "Pending",
    detail: "Connect or reconnect Shopify once to register automatic uninstall handling.",
    ready: false
  };
}

export function ShopifyConnectionForm({
  initialConnection,
  initialCredentialStatus,
  allowManualCredentials = false
}: {
  initialConnection?: SafeShopifyConnection;
  initialCredentialStatus: CredentialStatus;
  allowManualCredentials?: boolean;
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
  const [statusTone, setStatusTone] = useState<StatusTone>(
    initialCredentialStatus.configured ? "success" : "neutral"
  );
  const [credentialStatus, setCredentialStatus] = useState(initialCredentialStatus);
  const [isSaving, setIsSaving] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isRegisteringWebhook, setIsRegisteringWebhook] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [webhookState, setWebhookState] = useState<WebhookState>({
    webhookStatus: initialConnection?.webhookStatus ?? "not_configured",
    webhookSubscriptionId: initialConnection?.webhookSubscriptionId,
    webhookCallbackUrl: initialConnection?.webhookCallbackUrl,
    webhookLastRegisteredAt: initialConnection?.webhookLastRegisteredAt,
    webhookLastError: initialConnection?.webhookLastError
  });
  const webhookDisplay = getWebhookDisplay(webhookState);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setStatus("Saving Shopify connection...");
    setStatusTone("neutral");
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
        setWebhookState({ webhookStatus: "not_configured" });
        setStatus(nextStatus.connected ? "Ready to publish drafts" : "Credentials are incomplete.");
        setStatusTone(nextStatus.connected ? "success" : "error");
      } else {
        setStatus(`Saved ${payload.shopDomain}`);
        setStatusTone("success");
      }
    } else {
      setStatus(payload.error);
      setStatusTone("error");
    }
    setIsSaving(false);
  }

  function connectWithShopify() {
    if (!shopDomain.trim()) {
      setStatus("Enter a Shopify store domain first.");
      setStatusTone("error");
      return;
    }
    window.location.href = `/api/shopify/oauth/start?shop=${encodeURIComponent(shopDomain)}`;
  }

  async function disconnectShopify() {
    if (!window.confirm("Disconnect this Shopify store and remove the saved token from this account?")) {
      return;
    }

    setIsDisconnecting(true);
    setStatus("");
    const response = await fetch("/api/settings/shopify", {
      method: "DELETE"
    });
    const payload = await response.json().catch(() => ({}));

    if (response.ok) {
      setShopDomain("");
      setAdminAccessToken("");
      setClientId("");
      setClientSecret("");
      setWebhookState({ webhookStatus: "not_configured" });
      setCredentialStatus({
        configured: false,
        shopDomain: null,
        authMode: "none",
        imagesCanPublish: false
      });
      setStatus("Shopify store disconnected.");
      setStatusTone("neutral");
    } else {
      setStatus(payload.error || "Could not disconnect Shopify store.");
      setStatusTone("error");
    }

    setIsDisconnecting(false);
  }

  async function registerWebhookNow() {
    setIsRegisteringWebhook(true);
    setStatus("Registering Shopify uninstall webhook...");
    setStatusTone("neutral");

    const response = await fetch("/api/settings/shopify/webhook", {
      method: "POST"
    });
    const payload = await response.json().catch(() => ({}));

    if (response.ok && payload.ok) {
      setWebhookState({
        webhookStatus: payload.webhookStatus,
        webhookSubscriptionId: payload.webhookSubscriptionId,
        webhookCallbackUrl: payload.webhookCallbackUrl,
        webhookLastRegisteredAt: payload.webhookLastRegisteredAt,
        webhookLastError: undefined
      });
      setStatus("Shopify uninstall webhook is ready.");
      setStatusTone("success");
    } else {
      setWebhookState({
        webhookStatus: "warning",
        webhookCallbackUrl: payload.webhookCallbackUrl,
        webhookLastRegisteredAt: payload.webhookLastRegisteredAt,
        webhookLastError: payload.webhookLastError || payload.error || "Could not register Shopify uninstall webhook."
      });
      setStatus(payload.webhookLastError || payload.error || "Could not register Shopify uninstall webhook.");
      setStatusTone("error");
    }

    setIsRegisteringWebhook(false);
  }

  return (
    <form onSubmit={onSubmit} className="border border-line bg-white p-5 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Connect Shopify</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Enter the store domain, approve the app in Shopify, then return here with the connection saved to this account.
          </p>
        </div>
        {credentialStatus.connected || credentialStatus.configured ? (
          <span className="inline-flex items-center gap-2 rounded bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">
            <CheckCircle2 className="h-4 w-4" aria-hidden />
            Connected
          </span>
        ) : (
          <span className="inline-flex items-center gap-2 rounded bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800">
            <CircleAlert className="h-4 w-4" aria-hidden />
            Not connected
          </span>
        )}
      </div>
      <div className="mt-6 space-y-4">
        <label className="block">
          <span className="text-sm font-medium">Shopify store domain</span>
          <input
            value={shopDomain}
            onChange={(event) => setShopDomain(event.target.value)}
            className="studio-focus mt-2 h-11 w-full rounded border border-line px-3"
            placeholder="store-name.myshopify.com"
          />
          <span className="mt-2 block text-xs text-muted">
            Use the original .myshopify.com domain, a store handle, or an admin.shopify.com/store/... URL.
          </span>
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={connectWithShopify}
            className="studio-focus inline-flex h-11 items-center justify-center gap-2 rounded bg-action px-4 text-sm font-semibold text-white"
          >
            Connect Shopify <ExternalLink className="h-4 w-4" aria-hidden />
          </button>
          <span className="text-xs text-muted">
            Example format: store-name.myshopify.com
          </span>
        </div>
        {allowManualCredentials ? (
          <div className="border-t border-line pt-4">
            <button
              type="button"
              onClick={() => setShowManual((value) => !value)}
              className="studio-focus text-sm font-semibold text-muted underline-offset-4 hover:text-ink hover:underline"
            >
              {showManual ? "Hide manual connection" : "Use manual credentials instead"}
            </button>
          </div>
        ) : null}
        {allowManualCredentials && showManual ? (
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
        <div className="border border-line bg-canvas p-4 text-sm">
          <p className="font-medium">Connection status</p>
          {allowManualCredentials ? (
            <p className="mt-2 text-muted">
              OAuth tokens are saved server-side for this account. Configure <code>SHOPIFY_TOKEN_ENCRYPTION_KEY</code>{" "}
              before inviting real users so saved tokens are encrypted at rest. Use scopes <code>read_products</code>,{" "}
              <code>write_products</code>, <code>write_files</code>, <code>read_locations</code>, and{" "}
              <code>write_inventory</code>, plus <code>read_publications</code> and <code>write_publications</code> for live publishing.
            </p>
          ) : (
            <p className="mt-2 text-muted">
              OAuth keeps your store connection saved server-side for this account. The app only uses this connection to create and update product drafts you approve.
            </p>
          )}
          <dl className="mt-4 grid gap-2 sm:grid-cols-2">
            <div>
              <dt className="text-muted">Auth mode</dt>
              <dd>{credentialStatus.authMode}</dd>
            </div>
            <div>
              <dt className="text-muted">Image publishing</dt>
              <dd>{credentialStatus.imagesCanPublish ? "Public URLs configured" : "Needs deployed public URL"}</dd>
            </div>
            <div>
              <dt className="text-muted">Auto disconnect webhook</dt>
              <dd className={webhookDisplay.ready ? "text-action" : "text-amber-700"}>
                {webhookDisplay.label}
              </dd>
            </div>
          </dl>
          <p className="mt-3 text-xs leading-5 text-muted">{webhookDisplay.detail}</p>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <StatusMessage tone={statusTone} text={status} />
        <div className="flex flex-wrap gap-2">
          {(credentialStatus.connected || credentialStatus.configured) && !webhookDisplay.ready ? (
            <button
              type="button"
              onClick={registerWebhookNow}
              disabled={isRegisteringWebhook}
              className="studio-focus inline-flex h-10 items-center gap-2 rounded border border-line bg-white px-4 text-sm font-semibold hover:bg-canvas disabled:opacity-60"
            >
              {isRegisteringWebhook ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Registering...
                </>
              ) : (
                "Register webhook"
              )}
            </button>
          ) : null}
          {credentialStatus.connected || credentialStatus.configured ? (
            <button
              type="button"
              onClick={disconnectShopify}
              disabled={isDisconnecting}
              className="studio-focus inline-flex h-10 items-center gap-2 rounded border border-red-200 bg-red-50 px-4 text-sm font-semibold text-red-800 disabled:opacity-60"
            >
              <Unplug className="h-4 w-4" aria-hidden />
              {isDisconnecting ? "Disconnecting..." : "Disconnect"}
            </button>
          ) : null}
          {allowManualCredentials && showManual ? (
            <button
              type="submit"
              disabled={isSaving}
              className="studio-focus inline-flex h-10 items-center gap-2 rounded bg-action px-4 text-sm font-semibold text-white disabled:opacity-60"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Saving...
                </>
              ) : (
                "Save manual connection"
              )}
            </button>
          ) : null}
        </div>
      </div>
    </form>
  );
}

function StatusMessage({ tone, text }: { tone: StatusTone; text: string }) {
  if (!text) return null;

  const toneClass =
    tone === "success" ? "text-action" : tone === "error" ? "text-red-700" : "text-muted";
  const Icon = tone === "success" ? CheckCircle2 : tone === "error" ? CircleAlert : null;

  return (
    <p className={`inline-flex items-center gap-2 text-sm ${toneClass}`}>
      {Icon ? <Icon className="h-4 w-4" aria-hidden /> : null}
      {text}
    </p>
  );
}
