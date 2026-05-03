import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  CheckCircle2,
  CircleAlert,
  Coins,
  Download,
  History,
  Loader2
} from "lucide-react";
import { getCreditAccount, listCreditLedger } from "@/lib/credits";
import { requireCurrentUser } from "@/lib/auth";
import { listProducts } from "@/lib/store";
import type { GenerationJob } from "@/lib/types";

export const dynamic = "force-dynamic";

function formatReason(reason: string) {
  return reason
    .replace(/^stripe_credit_pack:/, "credit pack: ")
    .replaceAll("_", " ")
    .replaceAll(":", ": ");
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function getJobIcon(status: GenerationJob["status"]) {
  if (status === "COMPLETED") return CheckCircle2;
  if (status === "FAILED") return CircleAlert;
  return Loader2;
}

export default async function UsagePage() {
  await requireCurrentUser();
  const [credits, ledger, products] = await Promise.all([
    getCreditAccount(),
    listCreditLedger(40),
    listProducts()
  ]);
  const productById = new Map(products.map((product) => [product.id, product]));
  const jobs = products
    .flatMap((product) =>
      product.jobs.map((job) => ({
        ...job,
        productTitle: product.title || product.name || "Untitled product"
      }))
    )
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
    .slice(0, 40);
  const failedJobs = jobs.filter((job) => job.status === "FAILED");
  const activeJobs = jobs.filter((job) => job.status === "QUEUED" || job.status === "PROCESSING");
  const completedJobs = jobs.filter((job) => job.status === "COMPLETED");
  const spent = ledger
    .filter((entry) => entry.amount < 0)
    .reduce((total, entry) => total + Math.abs(entry.amount), 0);
  const added = ledger
    .filter((entry) => entry.amount > 0)
    .reduce((total, entry) => total + entry.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 border-b border-line pb-6 md:flex-row md:items-end">
        <div>
          <p className="text-sm text-muted">Account activity</p>
          <h1 className="text-3xl font-semibold">Usage history</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/api/usage/export?type=jobs"
            className="studio-focus inline-flex h-10 items-center gap-2 rounded border border-line bg-white px-4 text-sm font-semibold hover:bg-canvas"
          >
            Jobs CSV
            <Download className="h-4 w-4" aria-hidden />
          </Link>
          <Link
            href="/api/usage/export?type=credits"
            className="studio-focus inline-flex h-10 items-center gap-2 rounded border border-line bg-white px-4 text-sm font-semibold hover:bg-canvas"
          >
            Credits CSV
            <Download className="h-4 w-4" aria-hidden />
          </Link>
          <Link
            href="/products/new"
            className="studio-focus inline-flex h-10 items-center gap-2 rounded bg-action px-4 text-sm font-semibold text-white"
          >
            Create product
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>

      <section className="grid gap-3 md:grid-cols-4">
        <Metric
          icon={Coins}
          label="Current credits"
          value={credits.isUnlimited ? "Unlimited" : credits.balance}
        />
        <Metric icon={Activity} label="Credits used" value={credits.isUnlimited ? "Admin" : spent} />
        <Metric icon={CircleAlert} label="Failed jobs" value={failedJobs.length} />
        <Metric icon={History} label="Completed jobs" value={completedJobs.length} />
      </section>

      {credits.isUnlimited ? (
        <div className="border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          Admin access is enabled for this account, so image generation does not deduct credits.
        </div>
      ) : null}

      <section className="border border-line bg-white">
        <div className="border-b border-line p-5">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-semibold">Failed job triage</h2>
              <p className="mt-1 text-sm text-muted">
                The newest blocked actions, with product links and the recorded error message.
              </p>
            </div>
            <span
              className={`inline-flex h-9 items-center rounded px-3 text-sm font-semibold ${
                failedJobs.length
                  ? "bg-red-50 text-red-700 ring-1 ring-red-200"
                  : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
              }`}
            >
              {failedJobs.length ? `${failedJobs.length} needs review` : "No failures"}
            </span>
          </div>
        </div>
        {failedJobs.length ? (
          <div className="divide-y divide-line">
            {failedJobs.slice(0, 6).map((job) => (
              <div key={job.id} className="grid gap-3 p-4 text-sm lg:grid-cols-[1fr_auto]">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold capitalize">
                      {job.type.toLowerCase().replaceAll("_", " ")}
                    </span>
                    <span className="rounded bg-red-50 px-2 py-1 text-xs font-semibold text-red-700">
                      failed
                    </span>
                  </div>
                  <p className="mt-1 text-muted">
                    {job.productTitle} · {formatDate(job.updatedAt)}
                  </p>
                  <p className="mt-3 break-words rounded border border-red-100 bg-red-50 p-3 text-red-800">
                    {job.error || "No error message was recorded."}
                  </p>
                </div>
                <Link
                  href={`/products/${job.productId}`}
                  className="studio-focus inline-flex h-10 items-center justify-center gap-2 rounded border border-line bg-white px-3 text-sm font-semibold hover:bg-canvas"
                >
                  Open product
                  <ArrowUpRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-sm text-muted">
            Failed generation and Shopify publish jobs will appear here when they need attention.
          </div>
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="border border-line bg-white">
          <div className="border-b border-line p-5">
            <h2 className="text-lg font-semibold">Credit ledger</h2>
            <p className="mt-1 text-sm text-muted">
              Charges, refunds, trial credits, and future purchases. Total added: {credits.isUnlimited ? "admin bypass" : added}.
            </p>
          </div>
          <div className="divide-y divide-line">
            {ledger.length ? (
              ledger.map((entry) => {
                const product = entry.productId ? productById.get(entry.productId) : null;
                return (
                  <div key={entry.id} className="grid gap-3 p-4 text-sm sm:grid-cols-[1fr_auto]">
                    <div>
                      <p className="font-semibold capitalize">{formatReason(entry.reason)}</p>
                      <p className="mt-1 text-muted">
                        {product ? product.title || product.name : "Account"} · {formatDate(entry.createdAt)}
                      </p>
                    </div>
                    <span
                      className={`font-semibold ${
                        entry.amount >= 0 ? "text-action" : "text-ink"
                      }`}
                    >
                      {entry.amount >= 0 ? "+" : ""}
                      {entry.amount}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="p-6 text-sm text-muted">
                No credit ledger events yet.
              </div>
            )}
          </div>
        </div>

        <div className="border border-line bg-white">
          <div className="border-b border-line p-5">
            <h2 className="text-lg font-semibold">Job history</h2>
            <p className="mt-1 text-sm text-muted">
              Image, copy, and Shopify publish jobs. Active now: {activeJobs.length}.
            </p>
          </div>
          <div className="divide-y divide-line">
            {jobs.length ? (
              jobs.map((job) => {
                const Icon = getJobIcon(job.status);
                return (
                  <div key={job.id} className="grid gap-3 p-4 text-sm sm:grid-cols-[auto_1fr_auto]">
                    <Icon
                      className={`mt-0.5 h-5 w-5 ${
                        job.status === "FAILED" ? "text-red-600" : "text-action"
                      }`}
                      aria-hidden
                    />
                    <div className="min-w-0">
                      <p className="font-semibold capitalize">
                        {job.type.toLowerCase().replaceAll("_", " ")}
                      </p>
                      <Link
                        href={`/products/${job.productId}`}
                        className="mt-1 block truncate text-muted underline-offset-4 hover:text-action hover:underline"
                      >
                        {job.productTitle} · {formatDate(job.updatedAt)}
                      </Link>
                      {job.error ? <p className="mt-2 break-words text-red-700">{job.error}</p> : null}
                    </div>
                    <span className="text-muted">{job.progress}%</span>
                  </div>
                );
              })
            ) : (
              <div className="p-6 text-sm text-muted">
                Jobs will appear after generation or Shopify publishing.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
}) {
  return (
    <div className="border border-line bg-white p-4">
      <Icon className="h-5 w-5 text-action" aria-hidden />
      <p className="mt-4 text-2xl font-semibold">{value}</p>
      <p className="text-sm text-muted">{label}</p>
    </div>
  );
}
