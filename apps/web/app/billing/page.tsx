import Link from "next/link";
import { ArrowUpRight, CheckCircle2, CircleAlert, Coins, CreditCard, ExternalLink } from "lucide-react";
import { CREDIT_PACKS, formatPackPrice, getStripeBillingReadiness, isStripeBillingConfigured } from "@/lib/billing";
import { getCreditAccount, getCreditLedgerEntryByStripePaymentId } from "@/lib/credits";
import { requireCurrentUser } from "@/lib/auth";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-dynamic";

type BillingSearchParams = Promise<Record<string, string | string[] | undefined>>;

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function BillingPage({
  searchParams
}: {
  searchParams?: BillingSearchParams;
}) {
  await requireCurrentUser();
  const credits = await getCreditAccount();
  const params = searchParams ? await searchParams : {};
  const checkoutStatus = firstParam(params.checkout);
  const sessionId = firstParam(params.session_id);
  const error = firstParam(params.error);
  const stripeReady = isStripeBillingConfigured();
  const stripeReadiness = getStripeBillingReadiness();
  const purchase = checkoutStatus === "success" ? await getCreditLedgerEntryByStripePaymentId(sessionId) : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 border-b border-line pb-6 md:flex-row md:items-end">
        <div>
          <p className="text-sm text-muted">Credits and usage</p>
          <h1 className="text-3xl font-semibold">Billing</h1>
        </div>
        <div className="border border-line bg-white px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded bg-emerald-50 text-action">
              <Coins className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <p className="text-2xl font-semibold">
                {credits.isUnlimited ? "Unlimited" : credits.balance}
              </p>
              <p className="text-sm text-muted">
                {credits.isUnlimited
                  ? "admin access"
                  : credits.enabled
                    ? "credits available"
                    : "trial mode until credit tables are enabled"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {checkoutStatus === "success" ? (
        purchase ? (
          <Notice
            icon={CheckCircle2}
            tone="success"
            title={`${purchase.amount} credits added`}
            body="Stripe confirmed the checkout and the webhook has added the credits to your account."
          />
        ) : (
          <Notice
            icon={CircleAlert}
            tone="warning"
            title="Payment received, waiting for credits"
            body="Stripe returned a successful checkout. Refresh this page in a moment while the webhook finishes adding credits."
          />
        )
      ) : null}

      {checkoutStatus === "canceled" ? (
        <Notice
          icon={CircleAlert}
          tone="neutral"
          title="Checkout canceled"
          body="No credits were added and no payment was completed."
        />
      ) : null}

      {error ? (
        <Notice
          icon={CircleAlert}
          tone="error"
          title="Checkout could not start"
          body={error.replaceAll("_", " ")}
        />
      ) : null}

      {!stripeReady ? (
        <Notice
          icon={CircleAlert}
          tone="warning"
          title="Stripe is not configured yet"
          body="Add STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET in Vercel before selling credits."
        />
      ) : null}

      <section>
        <div className="mb-3 flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold">Buy credits</h2>
          <Link href="/products/new" className="hidden text-sm text-action sm:inline-flex">
            Create a product
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {CREDIT_PACKS.map((pack) => (
            <form key={pack.id} action="/api/credits/checkout" method="post" className="border border-line bg-white p-5">
              <input type="hidden" name="packId" value={pack.id} />
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold">{pack.name}</p>
                  <p className="mt-1 text-sm text-muted">{pack.description}</p>
                </div>
                <CreditCard className="h-5 w-5 text-action" aria-hidden />
              </div>
              <p className="mt-6 text-3xl font-semibold">{formatPackPrice(pack)}</p>
              <p className="mt-1 text-sm text-muted">{pack.credits} image-generation credits</p>
              <button
                type="submit"
                disabled={!stripeReady || credits.isUnlimited}
                className="studio-focus mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded bg-action px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {credits.isUnlimited ? "Admin account" : "Buy pack"}
                <ArrowUpRight className="h-4 w-4" aria-hidden />
              </button>
            </form>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="border border-line bg-white p-5">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
            <div>
              <h2 className="text-lg font-semibold">Stripe live checklist</h2>
              <p className="mt-1 text-sm leading-6 text-muted">
                Keep using sandbox until these items are ready. Switch to live mode only when the live key and live webhook secret are both in Vercel.
              </p>
            </div>
            <span
              className={`inline-flex h-9 items-center rounded px-3 text-sm font-semibold ${
                stripeReadiness.liveReady
                  ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200"
                  : stripeReadiness.sandboxReady
                    ? "bg-amber-50 text-amber-800 ring-1 ring-amber-200"
                    : "bg-red-50 text-red-800 ring-1 ring-red-200"
              }`}
            >
              {stripeReadiness.liveReady ? "Live ready" : stripeReadiness.sandboxReady ? "Sandbox ready" : "Not ready"}
            </span>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <ChecklistItem
              done={stripeReadiness.mode === "live"}
              title="Live secret key"
              detail="Use a Stripe key that starts with sk_live_ in Vercel."
            />
            <ChecklistItem
              done={stripeReadiness.hasWebhookSecret}
              title="Webhook secret"
              detail="Use the whsec_ value from the live Stripe webhook endpoint."
            />
            <ChecklistItem
              done={siteConfig.url.startsWith("https://") && !siteConfig.url.includes("localhost")}
              title="Production domain"
              detail={`${siteConfig.url}/api/stripe/webhook is the endpoint URL.`}
            />
            <ChecklistItem
              done={stripeReady}
              title="Checkout enabled"
              detail="Both Stripe server key and webhook secret are configured."
            />
          </div>
        </div>

        <div className="border border-line bg-[#f4f7f4] p-5">
          <h2 className="text-lg font-semibold">Live webhook endpoint</h2>
          <p className="mt-2 break-words text-sm leading-6 text-muted">
            {siteConfig.url}/api/stripe/webhook
          </p>
          <a
            href="https://dashboard.stripe.com/webhooks"
            target="_blank"
            rel="noreferrer"
            className="studio-focus mt-4 inline-flex h-10 items-center gap-2 rounded border border-line bg-white px-4 text-sm font-semibold hover:bg-canvas"
          >
            Open Stripe webhooks
            <ExternalLink className="h-4 w-4" aria-hidden />
          </a>
          <p className="mt-4 text-xs leading-5 text-muted">
            Select only <span className="font-semibold text-ink">checkout.session.completed</span> for the current credit flow.
          </p>
        </div>
      </section>

      <section className="border border-line bg-white p-5">
        <h2 className="text-lg font-semibold">How credits work</h2>
        <div className="mt-4 grid gap-4 text-sm text-muted md:grid-cols-2 xl:grid-cols-4">
          <BillingRule title="Image generation" body="Costs 1 credit per generated image. Failed image jobs refund the reserved credits automatically." />
          <BillingRule title="Copy generation" body="Stays free for the MVP so users can polish product copy before spending more credits." />
          <BillingRule title="Credit delivery" body="Credits are added only after Stripe sends a verified checkout.session.completed webhook." />
          <BillingRule title="Admin bypass" body="Admin emails listed in ADMIN_EMAILS can use the app without spending credits for internal testing." />
          <BillingRule title="Invoices" body="Stripe sends receipts and stores payment records. Add Stripe invoicing or tax automation before selling to larger teams." />
          <BillingRule title="Refund boundary" body="Credit pack purchases should normally be final once credits are delivered, unless required by law or support policy." />
          <BillingRule title="Expiration" body="Credits do not expire in the current MVP. Add an explicit expiration rule before introducing subscriptions." />
          <BillingRule title="Failed payments" body="Failed or canceled payments do not add credits. Users can retry checkout from this page." />
        </div>
      </section>
    </div>
  );
}

function BillingRule({ title, body }: { title: string; body: string }) {
  return (
    <div className="border border-line bg-canvas p-4">
      <p className="font-semibold text-ink">{title}</p>
      <p className="mt-2 leading-6">{body}</p>
    </div>
  );
}

function ChecklistItem({
  done,
  title,
  detail
}: {
  done: boolean;
  title: string;
  detail: string;
}) {
  return (
    <div className="border border-line bg-canvas p-3">
      <div className="flex items-center gap-2">
        {done ? (
          <CheckCircle2 className="h-4 w-4 text-action" aria-hidden />
        ) : (
          <CircleAlert className="h-4 w-4 text-amber-700" aria-hidden />
        )}
        <p className="text-sm font-semibold">{title}</p>
      </div>
      <p className="mt-2 text-xs leading-5 text-muted">{detail}</p>
    </div>
  );
}

function Notice({
  icon: Icon,
  tone,
  title,
  body
}: {
  icon: React.ComponentType<{ className?: string }>;
  tone: "success" | "warning" | "error" | "neutral";
  title: string;
  body: string;
}) {
  const styles = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-900",
    warning: "border-amber-200 bg-amber-50 text-amber-900",
    error: "border-red-200 bg-red-50 text-red-900",
    neutral: "border-line bg-white text-ink"
  }[tone];

  return (
    <div className={`max-w-3xl border p-4 text-sm ${styles}`}>
      <div className="flex gap-3">
        <Icon className="mt-0.5 h-5 w-5 flex-none" aria-hidden />
        <div>
          <p className="font-semibold">{title}</p>
          <p className="mt-1">{body}</p>
        </div>
      </div>
    </div>
  );
}
