import { getShopifyCredentialStatus } from "@ai-product-studio/shopify";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, FileText, ImagePlus, LockKeyhole, Send, Store } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { requireCurrentUser } from "@/lib/auth";
import { isAdminEmail } from "@/lib/credits";
import { getShopifyAppConfig } from "@/lib/shopify-oauth";
import { getShopifyErrorMessage } from "@/lib/shopify-messages";
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
  const webhookStatus = firstParam(params.webhook);
  const oauthError = firstParam(params.error);
  const user = await requireCurrentUser();
  const allowManualCredentials = isAdminEmail(user.email);
  const state = await readState();
  const credentialStatus = getShopifyCredentialStatus({
    shopDomain: state.shopifyConnection?.shopDomain,
    adminAccessToken: state.shopifyConnection?.adminAccessToken,
    clientId: state.shopifyConnection?.clientId,
    clientSecret: state.shopifyConnection?.clientSecret
  });
  const appConfig = getShopifyAppConfig();
  const errorMessage = getShopifyErrorMessage(oauthError);
  const connectionActive = credentialStatus.configured;

  return (
    <div className="space-y-8">
      <section className="grid gap-6 border-b border-line pb-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div>
          <p className="text-sm font-medium text-action">Store connection</p>
          <h1 className="mt-2 text-4xl font-semibold leading-tight">Shopify publishing setup</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
            Connect each user workspace to its own Shopify store. Products are sent as drafts by default so the store owner can review media, copy, price, and inventory before going live.
          </p>
        </div>
        <ConnectionSummary
          active={connectionActive}
          appConfigured={appConfig.configured}
          shopDomain={credentialStatus.shopDomain}
        />
      </section>

      {oauthConnected ? (
        <StatusNotice
          icon={CheckCircle2}
          tone="success"
          title="Shopify connected successfully"
          text={connectedShop ? `${connectedShop} is ready for draft publishing.` : "Your store is ready for draft publishing."}
        />
      ) : null}
      {oauthConnected && webhookStatus ? (
        <StatusNotice
          icon={webhookStatus === "warning" ? AlertTriangle : CheckCircle2}
          tone={webhookStatus === "warning" ? "warning" : "success"}
          title={
            webhookStatus === "warning"
              ? "Shopify uninstall webhook was not registered"
              : "Shopify uninstall webhook is ready"
          }
          text={
            webhookStatus === "warning"
              ? "The store is connected, but automatic disconnect on uninstall could not be registered. Reconnect the store later or contact support."
              : "If this store uninstalls the app, AI Product Studio will automatically mark the Shopify connection inactive."
          }
        />
      ) : null}
      {errorMessage ? (
        <StatusNotice
          icon={AlertTriangle}
          tone="error"
          title={errorMessage.title}
          text={errorMessage.text}
        />
      ) : null}
      {!appConfig.configured ? (
        <StatusNotice
          icon={AlertTriangle}
          tone="warning"
          title="OAuth environment variables needed"
          text="Shopify OAuth needs SHOPIFY_CLIENT_ID and SHOPIFY_CLIENT_SECRET in the server environment before customers can connect stores."
        />
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <ShopifyConnectionForm
          initialConnection={redactConnection(state.shopifyConnection)}
          initialCredentialStatus={credentialStatus}
          allowManualCredentials={allowManualCredentials}
        />
        <aside className="space-y-4">
          <div className="border border-line bg-white p-5">
            <h2 className="text-lg font-semibold">What this enables</h2>
            <div className="mt-4 space-y-4">
              <Capability icon={ImagePlus} title="Generated media" text="Publish generated lifestyle, detail, intro, and white-background images with the product draft." />
              <Capability icon={FileText} title="Listing content" text="Send the edited SEO title, description, tags, FAQ, price, and inventory decision." />
              <Capability icon={Send} title="Draft publishing" text="Create Shopify drafts from the app without surprise live publishing." />
            </div>
          </div>
          <div className="border border-line bg-white p-5">
            <div className="flex items-start gap-3">
              <LockKeyhole className="mt-0.5 h-5 w-5 shrink-0 text-action" aria-hidden />
              <div>
                <h2 className="text-sm font-semibold">Permission scope</h2>
                <p className="mt-1 text-sm leading-6 text-muted">
                  The app asks Shopify for product, file, location, inventory, and publication permissions used by this workflow.
                </p>
              </div>
            </div>
            <Link href="/support" className="mt-4 inline-flex text-sm font-semibold text-action">
              Get setup help
            </Link>
          </div>
        </aside>
      </section>
    </div>
  );
}

function ConnectionSummary({
  active,
  appConfigured,
  shopDomain
}: {
  active: boolean;
  appConfigured: boolean;
  shopDomain: string | null;
}) {
  const items = [
    {
      label: "OAuth app",
      value: appConfigured ? "Configured" : "Needs setup",
      ready: appConfigured
    },
    {
      label: "Store",
      value: active ? shopDomain || "Connected" : "Not connected",
      ready: active
    }
  ];

  return (
    <div className="border border-line bg-white p-5">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded bg-canvas text-action">
          <Store className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <p className="text-sm font-semibold">{active ? "Ready for drafts" : "Connection required"}</p>
          <p className="text-sm text-muted">
            {active ? "Shopify draft publishing can run from product pages." : "Connect Shopify before publishing products."}
          </p>
        </div>
      </div>
      <dl className="mt-5 space-y-3 text-sm">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between gap-3 border-t border-line pt-3">
            <dt className="text-muted">{item.label}</dt>
            <dd className={item.ready ? "font-medium text-action" : "font-medium text-amber-700"}>
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function StatusNotice({
  icon: Icon,
  tone,
  title,
  text
}: {
  icon: LucideIcon;
  tone: "success" | "warning" | "error";
  title: string;
  text: string;
}) {
  const toneClass =
    tone === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
      : tone === "warning"
        ? "border-amber-200 bg-amber-50 text-amber-900"
        : "border-red-200 bg-red-50 text-red-900";

  return (
    <div className={`max-w-3xl border p-4 text-sm ${toneClass}`}>
      <div className="flex gap-3">
        <Icon className="mt-0.5 h-5 w-5 flex-none" aria-hidden />
        <div>
          <p className="font-semibold">{title}</p>
          <p className="mt-1 leading-6">{text}</p>
        </div>
      </div>
    </div>
  );
}

function Capability({
  icon: Icon,
  title,
  text
}: {
  icon: LucideIcon;
  title: string;
  text: string;
}) {
  return (
    <div className="grid grid-cols-[32px_minmax(0,1fr)] gap-3">
      <span className="flex h-8 w-8 items-center justify-center rounded bg-canvas text-action">
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <span>
        <span className="block text-sm font-semibold">{title}</span>
        <span className="mt-1 block text-sm leading-6 text-muted">{text}</span>
      </span>
    </div>
  );
}
