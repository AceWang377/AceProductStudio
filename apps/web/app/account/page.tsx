import Link from "next/link";
import {
  ArrowUpRight,
  CheckCircle2,
  CircleAlert,
  Coins,
  Download,
  History,
  LogOut,
  Mail,
  ShieldCheck,
  ShoppingBag,
  UserRound
} from "lucide-react";
import { requireCurrentUser } from "@/lib/auth";
import { getCreditAccount } from "@/lib/credits";
import { readState } from "@/lib/store";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const [user, credits, state] = await Promise.all([
    requireCurrentUser(),
    getCreditAccount(),
    readState()
  ]);
  const connectedStore = state.shopifyConnection?.isActive ? state.shopifyConnection.shopDomain : null;
  const creditLabel = credits.isUnlimited ? "Unlimited" : credits.balance;
  const creditDetail = credits.isUnlimited
    ? "Admin bypass is enabled, so generation does not deduct credits."
    : credits.enabled
      ? "Image generation spends credits. Copy generation is currently free."
      : "Trial credits are active while billing storage is being configured.";

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 border-b border-line pb-6 md:flex-row md:items-end">
        <div>
          <p className="text-sm text-muted">Workspace settings</p>
          <h1 className="text-3xl font-semibold">Account</h1>
        </div>
        <form action="/auth/logout" method="post">
          <button
            type="submit"
            className="studio-focus inline-flex h-10 items-center gap-2 rounded border border-line bg-white px-4 text-sm font-semibold hover:bg-canvas"
          >
            Sign out
            <LogOut className="h-4 w-4" aria-hidden />
          </button>
        </form>
      </div>

      <section className="grid gap-4 lg:grid-cols-3">
        <StatusPanel
          icon={UserRound}
          label="Signed in"
          title={user.email ?? "Email account"}
          detail="This email owns the products, store connection, credits, and usage history shown in this workspace."
          tone="neutral"
        />
        <StatusPanel
          icon={Coins}
          label="Credits"
          title={String(creditLabel)}
          detail={creditDetail}
          tone={credits.isUnlimited || credits.balance > 0 ? "ready" : "warning"}
          href="/billing"
          cta="Manage credits"
        />
        <StatusPanel
          icon={ShoppingBag}
          label="Shopify"
          title={connectedStore ? "Connected" : "Not connected"}
          detail={
            connectedStore
              ? `Publishing drafts to ${connectedStore}.`
              : "Connect a store before publishing Shopify drafts."
          }
          tone={connectedStore ? "ready" : "warning"}
          href="/settings/shopify"
          cta={connectedStore ? "View connection" : "Connect Shopify"}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="border border-line bg-white">
          <div className="border-b border-line p-5">
            <h2 className="text-lg font-semibold">Account controls</h2>
            <p className="mt-1 text-sm text-muted">
              Common actions for managing this workspace and reviewing account activity.
            </p>
          </div>
          <div className="divide-y divide-line">
            <ActionRow
              icon={ShoppingBag}
              title="Shopify connection"
              detail="Connect or replace the Shopify store used for product publishing."
              href="/settings/shopify"
              label="Open Shopify"
            />
            <ActionRow
              icon={History}
              title="Usage history"
              detail="Review generation jobs, failed publish attempts, and credit ledger activity."
              href="/usage"
              label="View usage"
            />
            <ActionRow
              icon={Download}
              title="Data exports"
              detail="Download job and credit history as CSV files for support or accounting."
              href="/usage"
              label="Open exports"
            />
            <ActionRow
              icon={Mail}
              title="Support"
              detail={`Contact ${siteConfig.supportEmail} for account, billing, or publishing help.`}
              href="/support"
              label="Get support"
            />
          </div>
        </div>

        <aside className="space-y-4">
          <div className="border border-line bg-white p-5">
            <ShieldCheck className="h-5 w-5 text-action" aria-hidden />
            <h2 className="mt-4 text-lg font-semibold">Security model</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Sign-in is handled by Supabase magic links. Shopify connections use OAuth for customers, and saved store tokens stay server-side.
            </p>
          </div>
          <div className="border border-line bg-white p-5">
            <h2 className="text-lg font-semibold">Legal pages</h2>
            <div className="mt-4 grid gap-2 text-sm">
              <Link className="studio-focus rounded border border-line px-3 py-2 font-semibold hover:bg-canvas" href="/terms">
                Terms & Conditions
              </Link>
              <Link className="studio-focus rounded border border-line px-3 py-2 font-semibold hover:bg-canvas" href="/privacy">
                Privacy Policy
              </Link>
              <Link className="studio-focus rounded border border-line px-3 py-2 font-semibold hover:bg-canvas" href="/refund">
                Refund Policy
              </Link>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}

function StatusPanel({
  icon: Icon,
  label,
  title,
  detail,
  tone,
  href,
  cta
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  title: string;
  detail: string;
  tone: "ready" | "warning" | "neutral";
  href?: string;
  cta?: string;
}) {
  const toneClass =
    tone === "ready"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : tone === "warning"
        ? "border-amber-200 bg-amber-50 text-amber-900"
        : "border-line bg-white text-ink";
  const StatusIcon = tone === "ready" ? CheckCircle2 : tone === "warning" ? CircleAlert : Icon;

  return (
    <div className={`border p-5 ${toneClass}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium opacity-80">{label}</p>
          <h2 className="mt-2 break-words text-xl font-semibold">{title}</h2>
        </div>
        <StatusIcon className="h-5 w-5 shrink-0" aria-hidden />
      </div>
      <p className="mt-3 text-sm leading-6 opacity-85">{detail}</p>
      {href && cta ? (
        <Link
          href={href}
          className="studio-focus mt-4 inline-flex h-9 items-center gap-2 rounded bg-white px-3 text-sm font-semibold text-ink ring-1 ring-line hover:bg-canvas"
        >
          {cta}
          <ArrowUpRight className="h-4 w-4" aria-hidden />
        </Link>
      ) : null}
    </div>
  );
}

function ActionRow({
  icon: Icon,
  title,
  detail,
  href,
  label
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  detail: string;
  href: string;
  label: string;
}) {
  return (
    <div className="grid gap-4 p-5 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center">
      <Icon className="h-5 w-5 text-action" aria-hidden />
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-muted">{detail}</p>
      </div>
      <Link
        href={href}
        className="studio-focus inline-flex h-10 items-center justify-center gap-2 rounded border border-line bg-white px-3 text-sm font-semibold hover:bg-canvas"
      >
        {label}
        <ArrowUpRight className="h-4 w-4" aria-hidden />
      </Link>
    </div>
  );
}
