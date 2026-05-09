import "server-only";
import { getStripeBillingReadiness, isStripeBillingConfigured } from "@/lib/billing";
import { checkMediaStorageBucket, getMediaStorageBucketName } from "@/lib/media-storage";
import { getShopifyAppConfig } from "@/lib/shopify-oauth";
import { isSecretEncryptionConfigured } from "@/lib/secret-vault";
import { siteConfig } from "@/lib/site";
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
const MIGRATION_FILE_PATH = "apps/web/supabase/migrations/*.sql";
const MIGRATION_SOURCE_URL =
  "https://github.com/AceWang377/AceProductStudio/tree/main/apps/web/supabase/migrations";
const STRIPE_DASHBOARD_URL = "https://dashboard.stripe.com/";
const GOOGLE_SEARCH_CONSOLE_URL = "https://search.google.com/search-console";

function hasEnv(name: string) {
  return Boolean(process.env[name]?.trim());
}

function hasAnyEnv(names: string[]) {
  return names.some((name) => hasEnv(name));
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

function getSupabaseProjectDetail() {
  const projectRef = getSupabaseProjectRef();
  return projectRef
    ? `The app is connected to Supabase project ${projectRef}. Use that project when running SQL migrations.`
    : "The app cannot identify the Supabase project until NEXT_PUBLIC_SUPABASE_URL is configured.";
}

function getMigrationAction() {
  const projectRef = getSupabaseProjectRef();
  return projectRef
    ? `Open the SQL editor for project ${projectRef}, then run the full ${MIGRATION_FILE_PATH} migration.`
    : `Configure NEXT_PUBLIC_SUPABASE_URL, then run the full ${MIGRATION_FILE_PATH} migration.`;
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
      const projectRef = getSupabaseProjectRef();
      return {
        label: name,
        status: "missing",
        detail: projectRef ? `${error.message} Checked Supabase project ${projectRef}.` : error.message,
        action: getMigrationAction(),
        actionHref: projectRef ? supabaseDashboardUrl("/sql/new") : MIGRATION_SOURCE_URL,
        actionLabel: projectRef ? "Open SQL editor" : "Open migration"
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
      action: "Add Supabase service role key in Vercel, then run the full migration SQL.",
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
    checkTable("rate_limits", "id,action_key,window_start,count"),
    checkTable("growth_monitor_runs", "id,run_type,status,target_url,input,output,error")
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
  const stripeReadiness = getStripeBillingReadiness();
  const appUrlConfigured = hasEnv("APP_PUBLIC_URL") || hasEnv("NEXT_PUBLIC_APP_URL");
  const appUrl = process.env.APP_PUBLIC_URL?.trim() || process.env.NEXT_PUBLIC_APP_URL?.trim();
  const shopifyWebhookUrl = appUrl ? `${appUrl.replace(/\/$/, "")}/api/shopify/webhooks` : "";
  const stripeWebhookUrl = appUrl ? `${appUrl.replace(/\/$/, "")}/api/stripe/webhook` : `${siteConfig.url}/api/stripe/webhook`;
  const sentryConfigured = hasAnyEnv(["SENTRY_DSN", "NEXT_PUBLIC_SENTRY_DSN"]);

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
      label: "Supabase project target",
      status: getSupabaseProjectRef() ? "ready" : "missing",
      detail: getSupabaseProjectDetail(),
      action: getSupabaseProjectRef()
        ? "No action needed"
        : "Add NEXT_PUBLIC_SUPABASE_URL so the checklist can point to the correct Supabase project.",
      actionHref: getSupabaseProjectRef() ? undefined : VERCEL_ENV_URL,
      actionLabel: getSupabaseProjectRef() ? undefined : "Open env settings"
    },
    {
      label: "App public URL",
      status: appUrlConfigured ? "ready" : "missing",
      detail: appUrlConfigured
        ? "OAuth and email links can redirect back to the deployed app."
        : "OAuth and email redirects do not have a production base URL.",
      action: appUrlConfigured
        ? "No action needed"
        : `Set NEXT_PUBLIC_APP_URL to ${siteConfig.url}.`,
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
        ? stripeReadiness.liveReady
          ? "Credit pack checkout can start in live mode."
          : "Credit pack checkout can start in sandbox mode."
        : "Credit charging works in trial/admin mode, but paid packs are not enabled.",
      action: isStripeBillingConfigured()
        ? "No action needed"
        : "Add STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET when you are ready to sell credits.",
      actionHref: isStripeBillingConfigured() ? undefined : STRIPE_DASHBOARD_URL,
      actionLabel: isStripeBillingConfigured() ? undefined : "Open Stripe"
    },
    {
      label: "Stripe live mode",
      status: stripeReadiness.liveReady ? "ready" : "warning",
      detail: stripeReadiness.liveReady
        ? "A live Stripe secret key and webhook secret are configured."
        : stripeReadiness.sandboxReady
          ? "Sandbox billing is ready. Switch to sk_live_ and a live whsec_ before taking real payments."
          : "Live billing needs a Stripe secret key and webhook secret.",
      action: stripeReadiness.liveReady
        ? "No action needed"
        : `Create a live Stripe webhook for ${stripeWebhookUrl}, then add the live STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET in Vercel.`,
      actionHref: stripeReadiness.liveReady ? undefined : STRIPE_DASHBOARD_URL,
      actionLabel: stripeReadiness.liveReady ? undefined : "Open Stripe"
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

  const monitoringChecks: ReadinessCheck[] = [
    {
      label: "Health endpoint",
      status: "ready",
      detail: "/api/health reports launch readiness for Vercel uptime checks and manual QA.",
      action: `Use ${siteConfig.url}/api/health as the production health-check URL.`
    },
    {
      label: "Error monitoring",
      status: sentryConfigured ? "ready" : "warning",
      detail: sentryConfigured
        ? "Sentry environment variables are present for server/client exception reporting."
        : "Server exceptions are not connected to Sentry yet. Vercel logs still work, but proactive error alerts are not configured.",
      action: sentryConfigured
        ? "No action needed"
        : "Connect Sentry or enable Vercel Observability before sending real traffic.",
      actionHref: sentryConfigured ? undefined : "https://sentry.io/",
      actionLabel: sentryConfigured ? undefined : "Open Sentry"
    },
    {
      label: "Operational audit trail",
      status: "ready",
      detail: "Image, copy, Shopify publish, credits, and exportable usage events are stored for customer support.",
      action: "Review /usage after important test runs."
    },
    {
      label: "Stale job cleanup",
      status: hasEnv("CRON_SECRET") ? "ready" : "warning",
      detail: hasEnv("CRON_SECRET")
        ? "The protected cron route marks stuck queued or processing jobs as failed before running Growth Monitor."
        : "The maintenance function exists, but the cron route should be protected with CRON_SECRET before production use.",
      action: hasEnv("CRON_SECRET")
        ? "No action needed"
        : "Add CRON_SECRET in Vercel, then configure the existing cron route as the low-cost MVP queue maintenance path.",
      actionHref: hasEnv("CRON_SECRET") ? undefined : VERCEL_ENV_URL,
      actionLabel: hasEnv("CRON_SECRET") ? undefined : "Open env settings"
    },
    {
      label: "Smoke test script",
      status: "ready",
      detail: "npm run test:smoke checks the public app shell, sitemap, robots.txt, and health endpoint against a local or deployed URL.",
      action: "Run SMOKE_TEST_BASE_URL=https://acezerotrading.com npm run test:smoke before important releases."
    },
    {
      label: "Real user QA suite",
      status: "ready",
      detail: "The admin-only /qa checklist covers registration, Google login, Shopify OAuth, upload, image generation, copy generation, draft publish, credit purchase, Growth scan, and Growth write-back.",
      action: "Run /qa before inviting merchants or changing billing, Shopify, auth, or Growth Studio.",
      actionHref: "/qa",
      actionLabel: "Open QA suite"
    }
  ];

  const growthChecks: ReadinessCheck[] = [
    {
      label: "Schema and rich snippets",
      status: "ready",
      detail: "Growth Studio scores Product schema, FAQ schema, and review schema readiness from product data.",
      action: "Use /growth after connecting Shopify to review per-product schema readiness."
    },
    {
      label: "Image SEO depth",
      status: "ready",
      detail: "Growth Studio checks alt text, image count, filename quality, dimensions, compression readiness, and media order.",
      action: "Run the Growth Studio audit after product media generation."
    },
    {
      label: "Technical SEO checks",
      status: "ready",
      detail: "Growth Monitor can crawl the target site for broken internal links, redirect chains, canonical host consistency, robots.txt, and sitemap.xml.",
      action: "Run the live monitor in /growth after each important SEO release.",
      actionHref: "/growth",
      actionLabel: "Open Growth Studio"
    },
    {
      label: "Google Search Console",
      status: hasAnyEnv([
        "GOOGLE_SEARCH_CONSOLE_SITE_URL",
        "GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL",
        "GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY"
      ])
        ? "warning"
        : "warning",
      detail: hasAnyEnv([
        "GOOGLE_SEARCH_CONSOLE_SITE_URL",
        "GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL",
        "GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY"
      ])
        ? "Search Console env vars are present or partially present. Growth Monitor reads clicks, impressions, CTR, position, top queries, and submitted sitemaps when all three are valid."
        : "Search Console is not connected yet, so Growth Monitor cannot read impressions, clicks, CTR, query, or sitemap data.",
      action: "Add GOOGLE_SEARCH_CONSOLE_SITE_URL, GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL, and GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY in Vercel.",
      actionHref: GOOGLE_SEARCH_CONSOLE_URL,
      actionLabel: "Open Search Console"
    },
    {
      label: "AI visibility tracking",
      status: hasAnyEnv(["GOOGLE_CUSTOM_SEARCH_API_KEY", "GOOGLE_CUSTOM_SEARCH_ENGINE_ID"]) ? "ready" : "warning",
      detail: hasAnyEnv(["GOOGLE_CUSTOM_SEARCH_API_KEY", "GOOGLE_CUSTOM_SEARCH_ENGINE_ID"])
        ? "AI visibility proxy monitoring can query Google Programmable Search for brand and product visibility."
        : "AI visibility is scored from page readiness now. Add Google Programmable Search credentials for scheduled visibility checks.",
      action: "Use visibility gaps to prioritize FAQ, facts, comparisons, and trust content.",
      actionHref: "/growth",
      actionLabel: "Open Growth Studio"
    },
    {
      label: "Growth monitor cron",
      status: hasEnv("CRON_SECRET") ? "ready" : "warning",
      detail: hasEnv("CRON_SECRET")
        ? "The Vercel Cron route is protected and can run the daily Growth Monitor."
        : "The daily Growth Monitor route exists, but CRON_SECRET is not configured.",
      action: hasEnv("CRON_SECRET") ? "No action needed" : "Add CRON_SECRET in Vercel Environment Variables.",
      actionHref: hasEnv("CRON_SECRET") ? undefined : VERCEL_ENV_URL,
      actionLabel: hasEnv("CRON_SECRET") ? undefined : "Open env settings"
    }
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
    },
    {
      title: "Growth SEO and GEO",
      description: "Technical SEO, rich snippets, Search Console, and AI visibility readiness.",
      checks: growthChecks
    },
    {
      title: "Monitoring and support",
      description: "Health checks, error monitoring, and support visibility before real users arrive.",
      checks: monitoringChecks
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
