import "server-only";
import { isStripeBillingConfigured } from "@/lib/billing";
import { checkMediaStorageBucket, getMediaStorageBucketName } from "@/lib/media-storage";
import { getShopifyAppConfig } from "@/lib/shopify-oauth";
import { isSecretEncryptionConfigured } from "@/lib/secret-vault";
import { createSupabaseAdminClient, isSupabaseStorageEnabled } from "@/lib/supabase-admin";

export type ReadinessStatus = "ready" | "warning" | "missing";

export type ReadinessCheck = {
  label: string;
  status: ReadinessStatus;
  detail: string;
  action: string;
  actionHref?: string;
  actionLabel?: string;
};

export type ReadinessGroup = {
  title: string;
  description: string;
  checks: ReadinessCheck[];
};

const VERCEL_ENV_URL = "https://vercel.com/dashboard";
const MIGRATION_URL =
  "https://github.com/AceWang377/AceProductStudio/blob/main/apps/web/supabase/migrations/001_app_state.sql";
const STRIPE_DASHBOARD_URL = "https://dashboard.stripe.com/";

function hasEnv(name: string) {
  return Boolean(process.env[name]?.trim());
}

function getSupabaseProjectRef() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!supabaseUrl) {
    return null;
  }

  try {
    return new URL(supabaseUrl).hostname.split(".")[0] || null;
  } catch {
    return null;
  }
}

function supabaseDashboardUrl(path: string) {
  const projectRef = getSupabaseProjectRef();
  return projectRef
    ? `https://supabase.com/dashboard/project/${projectRef}${path}`
    : "https://supabase.com/dashboard/projects";
}

function envCheck({
  label,
  name,
  detail,
  action,
  actionHref = VERCEL_ENV_URL,
  actionLabel = "Open env settings",
  optional = false
}: {
  label: string;
  name: string;
  detail: string;
  action: string;
  actionHref?: string;
  actionLabel?: string;
  optional?: boolean;
}): ReadinessCheck {
  const configured = hasEnv(name);
  return {
    label,
    status: configured ? "ready" : optional ? "warning" : "missing",
    detail: configured ? detail : optional ? `${label} is not configured yet.` : `${label} is missing.`,
    action: configured ? "No action needed" : action,
    actionHref: configured ? undefined : actionHref,
    actionLabel: configured ? undefined : actionLabel
  };
}

async function checkTable(name: string, select: string): Promise<ReadinessCheck> {
  try {
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from(name).select(select).limit(1);

    if (error) {
      return {
        label: name,
        status: "missing",
        detail: error.message,
        action: "Run apps/web/supabase/migrations/001_app_state.sql in Supabase SQL editor.",
        actionHref: MIGRATION_URL,
        actionLabel: "Open migration"
      };
    }

    return {
      label: name,
      status: "ready",
      detail: "Table and required columns are available.",
      action: "No action needed"
    };
  } catch (error) {
    return {
      label: name,
      status: "missing",
      detail: error instanceof Error ? error.message : "Could not check table.",
      action: "Add Supabase service role key and run the migration SQL.",
      actionHref: VERCEL_ENV_URL,
      actionLabel: "Open env settings"
    };
  }
}

async function getDatabaseChecks(): Promise<ReadinessCheck[]> {
  if (!isSupabaseStorageEnabled()) {
    return [
      {
        label: "Supabase database",
        status: "missing",
        detail: "The app cannot verify tables without NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
        action: "Add Supabase env vars in Vercel, then redeploy.",
        actionHref: VERCEL_ENV_URL,
        actionLabel: "Open env settings"
      }
    ];
  }

  return Promise.all([
    checkTable(
      "stores",
      "id,is_active,shop_domain,admin_access_token,webhook_status,webhook_subscription_id,webhook_callback_url"
    ),
    checkTable(
      "products",
      "id,target_market,tone,seo_keywords,language,brand_voice,image_style_preset,price,inventory_quantity"
    ),
    checkTable("product_images", "id,storage_key,prompt,is_selected,sort_order,shopify_media_id"),
    checkTable("jobs", "id,input,output,result,error,progress"),
    checkTable("credit_accounts", "user_id,balance"),
    checkTable("credit_ledger", "id,amount,reason,stripe_payment_id"),
    checkTable("rate_limits", "id,action_key,window_start,count")
  ]);
}

async function getStorageChecks(): Promise<ReadinessCheck[]> {
  const bucket = getMediaStorageBucketName();

  if (!isSupabaseStorageEnabled()) {
    return [
      {
        label: "Image storage",
        status: "missing",
        detail: "Uploaded and generated images need Supabase Storage for production.",
        action: "Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel.",
        actionHref: VERCEL_ENV_URL,
        actionLabel: "Open env settings"
      }
    ];
  }

  const status = await checkMediaStorageBucket();
  return [
    {
      label: "Storage bucket",
      status: status.ok ? "ready" : "warning",
      detail: status.ok
        ? `${bucket} is available for durable product images.`
        : `${bucket} does not exist yet. The first image upload can create it automatically.`,
      action: status.ok
        ? "No action needed"
        : `Create a public Supabase Storage bucket named ${bucket}, or upload one image in the app.`,
      actionHref: status.ok ? undefined : supabaseDashboardUrl("/storage/buckets"),
      actionLabel: status.ok ? undefined : "Open storage"
    }
  ];
}

export async function getLaunchReadiness(): Promise<ReadinessGroup[]> {
  const shopifyConfig = getShopifyAppConfig();
  const appUrlConfigured = hasEnv("APP_PUBLIC_URL") || hasEnv("NEXT_PUBLIC_APP_URL");
  const appUrl = process.env.APP_PUBLIC_URL?.trim() || process.env.NEXT_PUBLIC_APP_URL?.trim();
  const shopifyWebhookUrl = appUrl ? `${appUrl.replace(/\/$/, "")}/api/shopify/webhooks` : "";

  const coreChecks: ReadinessCheck[] = [
    envCheck({
      label: "OpenAI API key",
      name: "OPENAI_API_KEY",
      detail: "AI image and copy generation can call OpenAI.",
      action: "Add OPENAI_API_KEY in Vercel Environment Variables."
    }),
    envCheck({
      label: "Supabase URL",
      name: "NEXT_PUBLIC_SUPABASE_URL",
      detail: "The app can reach your Supabase project.",
      action: "Add NEXT_PUBLIC_SUPABASE_URL in Vercel Environment Variables."
    }),
    envCheck({
      label: "Supabase publishable key",
      name: "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      detail: "Browser and server auth helpers can initialize Supabase.",
      action: "Add NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in Vercel Environment Variables."
    }),
    envCheck({
      label: "Supabase service role key",
      name: "SUPABASE_SERVICE_ROLE_KEY",
      detail: "Server routes can store products, jobs, credits, and private Shopify tokens.",
      action: "Add SUPABASE_SERVICE_ROLE_KEY in Vercel Environment Variables."
    }),
    {
      label: "App public URL",
      status: appUrlConfigured ? "ready" : "missing",
      detail: appUrlConfigured
        ? "OAuth and email links can redirect back to the deployed app."
        : "OAuth and email redirects do not have a production base URL.",
      action: appUrlConfigured
        ? "No action needed"
        : "Set NEXT_PUBLIC_APP_URL to https://ace-product-studio.vercel.app.",
      actionHref: appUrlConfigured ? undefined : VERCEL_ENV_URL,
      actionLabel: appUrlConfigured ? undefined : "Open env settings"
    },
    envCheck({
      label: "Support email",
      name: "NEXT_PUBLIC_SUPPORT_EMAIL",
      detail: "Users can reach support from the public support, privacy, and terms pages.",
      action: "Add NEXT_PUBLIC_SUPPORT_EMAIL in Vercel before inviting real users.",
      optional: true
    })
  ];

  const shopifyChecks: ReadinessCheck[] = [
    {
      label: "Shopify OAuth app",
      status: shopifyConfig.configured ? "ready" : "missing",
      detail: shopifyConfig.configured
        ? "Users can connect their own Shopify store through OAuth."
        : "Shopify client credentials are missing.",
      action: shopifyConfig.configured
        ? "No action needed"
        : "Add SHOPIFY_CLIENT_ID and SHOPIFY_CLIENT_SECRET in Vercel.",
      actionHref: shopifyConfig.configured ? undefined : "/settings/shopify",
      actionLabel: shopifyConfig.configured ? undefined : "Open Shopify setup"
    },
    {
      label: "Shopify token encryption",
      status: isSecretEncryptionConfigured() ? "ready" : "warning",
      detail: isSecretEncryptionConfigured()
        ? "Saved Shopify tokens are encrypted before storage."
        : "Saved Shopify tokens are readable in the database until an encryption key is configured.",
      action: isSecretEncryptionConfigured()
        ? "No action needed"
        : "Add SHOPIFY_TOKEN_ENCRYPTION_KEY in Vercel before inviting real users.",
      actionHref: isSecretEncryptionConfigured() ? undefined : VERCEL_ENV_URL,
      actionLabel: isSecretEncryptionConfigured() ? undefined : "Open env settings"
    },
    {
      label: "Shopify scopes",
      status: shopifyConfig.configured ? "ready" : "warning",
      detail: shopifyConfig.configured
        ? "The app requests product, file, inventory, location, and publication permissions."
        : "Scopes can only be tested after OAuth credentials are configured.",
      action: shopifyConfig.configured
        ? "Keep the same scopes in the Shopify developer dashboard."
        : "Configure OAuth credentials first.",
      actionHref: "/settings/shopify",
      actionLabel: "Open Shopify setup"
    },
    {
      label: "Shopify uninstall webhook",
      status: appUrlConfigured && shopifyConfig.configured ? "ready" : "missing",
      detail: shopifyWebhookUrl
        ? `OAuth automatically registers APP_UNINSTALLED to ${shopifyWebhookUrl}.`
        : "The webhook endpoint needs a production app URL before it can be added to Shopify.",
      action: shopifyWebhookUrl
        ? "Reconnect any existing Shopify stores once so the uninstall webhook is registered for that shop."
        : "Set NEXT_PUBLIC_APP_URL, then reconnect Shopify.",
      actionHref: shopifyWebhookUrl ? "/settings/shopify" : VERCEL_ENV_URL,
      actionLabel: shopifyWebhookUrl ? "Open Shopify setup" : "Open env settings"
    }
  ];

  const billingChecks: ReadinessCheck[] = [
    {
      label: "Stripe checkout",
      status: isStripeBillingConfigured() ? "ready" : "warning",
      detail: isStripeBillingConfigured()
        ? "Credit pack checkout can start."
        : "Credit charging works in trial/admin mode, but paid packs are not enabled.",
      action: isStripeBillingConfigured()
        ? "No action needed"
        : "Add STRIPE_SECRET_KEY when you are ready to sell credits.",
      actionHref: isStripeBillingConfigured() ? undefined : STRIPE_DASHBOARD_URL,
      actionLabel: isStripeBillingConfigured() ? undefined : "Open Stripe"
    },
    envCheck({
      label: "Stripe webhook secret",
      name: "STRIPE_WEBHOOK_SECRET",
      detail: "Verified Stripe webhooks can add purchased credits.",
      action: "Add STRIPE_WEBHOOK_SECRET after creating the Stripe webhook endpoint.",
      optional: true
    }),
    envCheck({
      label: "Admin emails",
      name: "ADMIN_EMAILS",
      detail: "Internal admin accounts can generate without spending credits.",
      action: "Add ADMIN_EMAILS with your login email for unlimited internal use.",
      optional: true
    })
  ];

  return [
    {
      title: "Core app",
      description: "The minimum production settings needed for login, storage, and AI generation.",
      checks: coreChecks
    },
    {
      title: "Supabase schema",
      description: "Tables and columns used by products, jobs, stores, images, and credits.",
      checks: await getDatabaseChecks()
    },
    {
      title: "Image storage",
      description: "Durable storage for uploaded originals and generated Shopify media.",
      checks: await getStorageChecks()
    },
    {
      title: "Shopify publishing",
      description: "OAuth setup required for users to connect their stores and publish drafts.",
      checks: shopifyChecks
    },
    {
      title: "Credits and billing",
      description: "Usage limits, admin bypass, and future paid credit packs.",
      checks: billingChecks
    }
  ];
}

export function summarizeReadiness(groups: ReadinessGroup[]) {
  const checks = groups.flatMap((group) => group.checks);
  const missing = checks.filter((check) => check.status === "missing").length;
  const warnings = checks.filter((check) => check.status === "warning").length;
  const ready = checks.filter((check) => check.status === "ready").length;

  return {
    ready,
    warnings,
    missing,
    total: checks.length,
    launchReady: missing === 0
  };
}
