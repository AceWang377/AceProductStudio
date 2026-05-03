import Link from "next/link";
import { ArrowUpRight, CheckCircle2, CircleAlert, Coins, CreditCard } from "lucide-react";
import { CREDIT_PACKS, formatPackPrice, isStripeBillingConfigured } from "@/lib/billing";
import { getCreditAccount } from "@/lib/credits";
import { requireCurrentUser } from "@/lib/auth";

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
  const error = firstParam(params.error);
  const stripeReady = isStripeBillingConfigured();

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
        <Notice
          icon={CheckCircle2}
          tone="success"
          title="Payment received"
          body="Stripe confirmed the checkout. Your credits will appear after the webhook finishes processing."
        />
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

      <section className="border border-line bg-white p-5">
        <h2 className="text-lg font-semibold">How credits work</h2>
        <div className="mt-4 grid gap-4 text-sm text-muted md:grid-cols-3">
          <p>Image generation costs 1 credit per generated image.</p>
          <p>Copy generation stays free for the MVP so users can polish before spending more.</p>
          <p>Credits are added only after Stripe sends a verified payment webhook.</p>
          <p>Admin emails listed in ADMIN_EMAILS bypass credit charging for internal use.</p>
        </div>
      </section>
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
