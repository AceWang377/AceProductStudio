import { redirect } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  Boxes,
  CheckCircle2,
  Coins,
  Database,
  History,
  ShieldCheck,
  Store,
  Users
} from "lucide-react";
import { requireCurrentUser } from "@/lib/auth";
import { getAdminDashboard } from "@/lib/admin-dashboard";
import { isAdminEmail } from "@/lib/credits";

export const dynamic = "force-dynamic";

type AdminSearchParams = Promise<Record<string, string | string[] | undefined>>;

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function formatType(value: string) {
  return value.toLowerCase().replaceAll("_", " ");
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminPage({
  searchParams
}: {
  searchParams?: AdminSearchParams;
}) {
  const user = await requireCurrentUser();
  if (!isAdminEmail(user.email)) redirect("/dashboard");

  const params = searchParams ? await searchParams : {};
  const search = firstParam(params.q)?.trim() ?? "";
  const dashboard = await getAdminDashboard({ search });

  if (!dashboard.configured) {
    return (
      <div className="border border-red-200 bg-red-50 p-5 text-red-900">
        <h1 className="text-xl font-semibold">Admin dashboard unavailable</h1>
        <p className="mt-2 text-sm">
          Add Supabase service role environment variables before using cross-workspace QA.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-5 border-b border-line pb-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div>
          <p className="text-sm text-muted">Internal operations</p>
          <h1 className="mt-1 text-3xl font-semibold">Admin QA dashboard</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
            Cross-workspace view for support, failed job triage, Shopify connection health, and credit usage.
          </p>
          <form className="mt-5 flex max-w-xl gap-2" action="/admin">
            <input
              name="q"
              defaultValue={search}
              className="studio-focus h-10 min-w-0 flex-1 rounded border border-line bg-white px-3 text-sm"
              placeholder="Search email, store domain, product, job, or error"
            />
            <button
              type="submit"
              className="studio-focus h-10 rounded bg-action px-4 text-sm font-semibold text-white"
            >
              Search
            </button>
          </form>
          {search ? (
            <p className="mt-3 text-sm text-muted">
              Showing support results for <span className="font-semibold text-ink">{search}</span>.{" "}
              <a className="text-action underline-offset-4 hover:underline" href="/admin">
                Clear search
              </a>
            </p>
          ) : null}
        </div>
        <div className="border border-line bg-white p-5">
          <ShieldCheck className="h-5 w-5 text-action" aria-hidden />
          <h2 className="mt-3 font-semibold">Admin-only access</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            This page is visible only to emails configured in <code>ADMIN_EMAILS</code>.
          </p>
          <a
            href="/qa"
            className="studio-focus mt-4 inline-flex h-10 items-center rounded border border-line bg-white px-4 text-sm font-semibold hover:bg-canvas"
          >
            Open release QA
          </a>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Metric icon={Users} label="Users" value={dashboard.metrics.users} />
        <Metric icon={Boxes} label="Products checked" value={dashboard.metrics.products} />
        <Metric icon={Store} label="Connected stores" value={dashboard.metrics.connectedStores} />
        <Metric icon={AlertTriangle} label="Failed jobs" value={dashboard.metrics.failedJobs} tone="warning" />
        <Metric icon={Activity} label="Active jobs" value={dashboard.metrics.activeJobs} />
        <Metric icon={Coins} label="Credits used" value={dashboard.metrics.generatedCreditsUsed} />
        <Metric icon={Coins} label="Credit balance" value={dashboard.metrics.totalCreditBalance} />
        <Metric icon={CheckCircle2} label="Published drafts" value={dashboard.metrics.publishedDrafts} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <Panel
          icon={AlertTriangle}
          title="Failed job triage"
          detail="Newest generation and publish failures across all users."
          badge={dashboard.failedJobs.length ? `${dashboard.failedJobs.length} open` : "Clear"}
          tone={dashboard.failedJobs.length ? "warning" : "ready"}
        >
          {dashboard.failedJobs.length ? (
            <div className="divide-y divide-line">
              {dashboard.failedJobs.map((job) => (
                <div key={job.id} className="p-4 text-sm">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold capitalize">{formatType(job.type)}</span>
                      <span className="rounded bg-red-50 px-2 py-1 text-xs font-semibold text-red-700">
                        failed
                      </span>
                    </div>
                    <p className="mt-1 text-muted">
                      {job.productTitle} · {job.userEmail} · {formatDate(job.updatedAt)}
                    </p>
                    <p className="mt-3 break-words rounded border border-red-100 bg-red-50 p-3 text-red-800">
                      {job.error}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyLine text="No failed jobs in the latest operational window." />
          )}
        </Panel>

        <Panel
          icon={Store}
          title="Store health"
          detail="Recent store connections and uninstall webhook status."
        >
          {dashboard.stores.length ? (
            <div className="divide-y divide-line">
              {dashboard.stores.map((store) => (
                <div key={store.id} className="p-4 text-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="break-words font-semibold">{store.shopDomain}</p>
                      <p className="mt-1 break-words text-muted">{store.userEmail}</p>
                    </div>
                    <span
                      className={`shrink-0 rounded px-2 py-1 text-xs font-semibold ${
                        store.isActive ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"
                      }`}
                    >
                      {store.isActive ? "active" : "inactive"}
                    </span>
                  </div>
                  <p className="mt-3 text-muted">
                    Webhook: <span className="font-medium text-ink">{store.webhookStatus}</span>
                  </p>
                  {store.webhookLastError ? (
                    <p className="mt-2 break-words rounded border border-amber-100 bg-amber-50 p-2 text-amber-900">
                      {store.webhookLastError}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <EmptyLine text="No store connections yet." />
          )}
        </Panel>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <Panel icon={History} title="Recent jobs" detail="Latest job activity across workspaces.">
          {dashboard.recentJobs.length ? (
            <div className="divide-y divide-line">
              {dashboard.recentJobs.map((job) => (
                <div key={job.id} className="p-4 text-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold capitalize">{formatType(job.type)}</p>
                      <p className="mt-1 text-muted">{job.productTitle}</p>
                    </div>
                    <StatusPill value={job.status} />
                  </div>
                  <p className="mt-2 text-xs text-muted">
                    {job.userEmail} · {formatDate(job.updatedAt)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyLine text="No jobs yet." />
          )}
        </Panel>

        <Panel icon={Boxes} title="Recent products" detail="Recently updated product drafts and Shopify state.">
          {dashboard.recentProducts.length ? (
            <div className="divide-y divide-line">
              {dashboard.recentProducts.map((product) => (
                <div key={product.id} className="p-4 text-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="break-words font-semibold">{product.title}</p>
                      <p className="mt-1 break-words text-muted">{product.userEmail}</p>
                    </div>
                    <StatusPill value={product.shopifyStatus} />
                  </div>
                  <p className="mt-2 text-xs text-muted">
                    {product.status} · {formatDate(product.updatedAt)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyLine text="No products yet." />
          )}
        </Panel>

        <Panel icon={Database} title="Recent users" detail="Newest authenticated users.">
          {dashboard.recentUsers.length ? (
            <div className="divide-y divide-line">
              {dashboard.recentUsers.map((recentUser) => (
                <div key={recentUser.id} className="p-4 text-sm">
                  <p className="break-words font-semibold">{recentUser.email}</p>
                  <p className="mt-1 text-muted">Joined {formatDate(recentUser.createdAt)}</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyLine text="No users yet." />
          )}
        </Panel>
      </section>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  tone = "neutral"
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  tone?: "neutral" | "warning";
}) {
  return (
    <div className="border border-line bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted">{label}</p>
        <Icon className={`h-4 w-4 ${tone === "warning" ? "text-red-600" : "text-action"}`} aria-hidden />
      </div>
      <p className={`mt-3 text-2xl font-semibold ${tone === "warning" ? "text-red-700" : "text-ink"}`}>
        {value}
      </p>
    </div>
  );
}

function Panel({
  icon: Icon,
  title,
  detail,
  badge,
  tone = "neutral",
  children
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  detail: string;
  badge?: string;
  tone?: "neutral" | "warning" | "ready";
  children: React.ReactNode;
}) {
  const badgeClass =
    tone === "warning"
      ? "bg-red-50 text-red-700 ring-red-200"
      : tone === "ready"
        ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
        : "bg-canvas text-muted ring-line";

  return (
    <section className="border border-line bg-white">
      <div className="flex items-start justify-between gap-3 border-b border-line p-5">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-action" aria-hidden />
            <h2 className="text-lg font-semibold">{title}</h2>
          </div>
          <p className="mt-2 text-sm text-muted">{detail}</p>
        </div>
        {badge ? (
          <span className={`shrink-0 rounded px-3 py-1 text-xs font-semibold ring-1 ${badgeClass}`}>
            {badge}
          </span>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function StatusPill({ value }: { value: string }) {
  const normalized = value.toLowerCase();
  const className =
    normalized.includes("fail")
      ? "bg-red-50 text-red-700"
      : normalized.includes("complete") || normalized.includes("published")
        ? "bg-emerald-50 text-emerald-700"
        : normalized.includes("process") || normalized.includes("queue")
          ? "bg-amber-50 text-amber-800"
          : "bg-canvas text-muted";

  return (
    <span className={`shrink-0 rounded px-2 py-1 text-xs font-semibold capitalize ${className}`}>
      {formatType(value)}
    </span>
  );
}

function EmptyLine({ text }: { text: string }) {
  return <div className="p-6 text-sm text-muted">{text}</div>;
}
