import Link from "next/link";
import type { ComponentType } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  CircleAlert,
  Gauge,
  LineChart,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  Store
} from "lucide-react";
import { GrowthApplyButton } from "@/components/growth/GrowthApplyButton";
import { requireCurrentUser } from "@/lib/auth";
import { getGrowthAudit, type GrowthAuditIssue, type GrowthProductScore } from "@/lib/growth-audit";
import { listProducts, readState } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function GrowthPage() {
  await requireCurrentUser();
  const [products, state] = await Promise.all([listProducts(), readState()]);
  const audit = await getGrowthAudit({
    connection: state.shopifyConnection,
    workspaceProducts: products
  });
  const shopifyConnected = Boolean(state.shopifyConnection?.isActive);
  const topIssues = audit.products.flatMap((product) =>
    product.issues.slice(0, 2).map((issue) => ({
      ...issue,
      productTitle: product.product.title,
      productId: product.product.id
    }))
  ).slice(0, 6);
  const productsNeedingWork = audit.products.filter((product) => product.overallScore < 80).length;

  return (
    <div className="space-y-7">
      <section className="overflow-hidden border border-line bg-[#16251f] text-white shadow-soft">
        <div className="grid gap-0 xl:grid-cols-[minmax(0,1fr)_440px]">
          <div className="p-5 sm:p-7">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase text-white/60">
              <span>Growth Studio</span>
              <span className="h-1 w-1 rounded-full bg-white/30" aria-hidden />
              <span>{shopifyConnected ? "Shopify audit ready" : "Connect Shopify for live audit"}</span>
            </div>
            <h1 className="mt-4 max-w-3xl text-3xl font-semibold leading-tight sm:text-4xl">
              Score Shopify products for SEO and GEO before you approve updates.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">
              Read products from the connected Shopify store, find weak titles, thin descriptions, missing image context, and AI-answer gaps, then write selected fixes only after user confirmation.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={shopifyConnected ? "/products" : "/settings/shopify"}
                className="studio-focus inline-flex h-11 items-center gap-2 rounded bg-white px-4 text-sm font-semibold text-ink"
              >
                {shopifyConnected ? "Open product workflow" : "Connect Shopify"}
                <ArrowUpRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/shopify-seo-geo-optimizer"
                className="studio-focus inline-flex h-11 items-center gap-2 rounded border border-white/15 px-4 text-sm font-semibold text-white hover:bg-white/10"
              >
                SEO/GEO guide
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
          <div className="border-t border-white/10 bg-white/[0.04] p-5 sm:p-7 xl:border-l xl:border-t-0">
            <div className="grid grid-cols-2 gap-px overflow-hidden border border-white/10 bg-white/10">
              <Metric label="SEO score" value={audit.averageSeoScore || "--"} tone="dark" icon={SearchCheck} />
              <Metric label="GEO score" value={audit.averageGeoScore || "--"} tone="dark" icon={Sparkles} />
              <Metric label="Products" value={audit.productCount} tone="dark" icon={Store} />
              <Metric label="High issues" value={audit.highPriorityIssueCount} tone="dark" icon={CircleAlert} />
            </div>
            <div className="mt-4 border border-white/10 bg-white/[0.04] p-4 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-white/60">Audit source</span>
                <span className="font-semibold">{audit.source === "shopify" ? "Live Shopify products" : "AceStudio workspace"}</span>
              </div>
              {audit.storeName || audit.shopDomain ? (
                <p className="mt-2 truncate text-white/60">{audit.storeName || audit.shopDomain}</p>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {audit.error ? (
        <section className="border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
          <div className="flex gap-3">
            <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
            <div>
              <h2 className="font-semibold">Live Shopify audit could not run</h2>
              <p className="mt-1 leading-6">
                {audit.error} The page is showing AceStudio workspace products instead, so users still get a useful preview.
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="border border-line bg-white p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium text-action">Store health</p>
              <h2 className="mt-1 text-2xl font-semibold">SEO/GEO audit summary</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                This MVP scores products, creates fix recommendations, and keeps Shopify write-back behind a per-product confirmation step.
              </p>
            </div>
            <span className="inline-flex h-9 items-center rounded border border-line px-3 text-sm font-semibold">
              {productsNeedingWork} need work
            </span>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <SummaryTile
              icon={Gauge}
              title="Score first"
              detail="Find which products need attention before spending credits on rewriting."
            />
            <SummaryTile
              icon={SearchCheck}
              title="SEO checks"
              detail="Title length, meta description, product depth, tags, and image alt context."
            />
            <SummaryTile
              icon={Sparkles}
              title="GEO checks"
              detail="Buyer Q&A, use cases, concrete facts, comparison context, and trust signals."
            />
          </div>
        </div>

        <aside className="space-y-4">
          <div className="border border-line bg-white p-5">
            <LineChart className="h-5 w-5 text-action" aria-hidden />
            <h2 className="mt-4 text-lg font-semibold">MVP workflow</h2>
            <ol className="mt-4 space-y-3 text-sm leading-6 text-muted">
              <li>1. Connect Shopify and read products.</li>
              <li>2. Score SEO/GEO quality.</li>
              <li>3. Review issues and suggested fixes.</li>
              <li>4. Confirm selected fixes before writing them to Shopify.</li>
            </ol>
          </div>
          <div className="border border-line bg-[#eef4ef] p-5">
            <ShieldCheck className="h-5 w-5 text-action" aria-hidden />
            <h2 className="mt-4 text-lg font-semibold">Safe by default</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Growth Studio audits first. SEO title, meta description, tags, and appended buyer Q&A are written to Shopify only after the user clicks confirm.
            </p>
          </div>
        </aside>
      </section>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div>
          <div className="mb-3 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm text-muted">Product scores</p>
              <h2 className="text-xl font-semibold">Lowest scoring products first</h2>
            </div>
            <Link href="/products" className="text-sm font-semibold text-action">
              Open products
            </Link>
          </div>
          {audit.products.length ? (
            <div className="border-y border-line">
              {audit.products.slice(0, 12).map((product) => (
                <ProductAuditRow key={`${product.product.source}-${product.product.id}`} product={product} />
              ))}
            </div>
          ) : (
            <div className="border border-line bg-white p-8 text-sm text-muted">
              No products available for audit yet. Connect Shopify or create your first AceStudio product draft.
            </div>
          )}
        </div>

        <aside>
          <div className="border border-line bg-white p-5">
            <div className="flex items-center gap-2">
              <CircleAlert className="h-5 w-5 text-action" aria-hidden />
              <h2 className="text-lg font-semibold">Top recommendations</h2>
            </div>
            <div className="mt-4 space-y-3">
              {topIssues.length ? (
                topIssues.map((issue) => (
                  <IssueBlock key={`${issue.productId}-${issue.key}`} issue={issue} productTitle={issue.productTitle} />
                ))
              ) : (
                <p className="text-sm leading-6 text-muted">
                  Products look strong enough for the first MVP audit. Keep monitoring after new products are added.
                </p>
              )}
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  tone
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  tone: "dark" | "light";
}) {
  const dark = tone === "dark";
  return (
    <div className={`p-4 ${dark ? "bg-[#16251f] text-white" : "bg-white text-ink"}`}>
      <Icon className={`h-4 w-4 ${dark ? "text-[#98d7c3]" : "text-action"}`} aria-hidden />
      <p className={`mt-3 text-xs ${dark ? "text-white/60" : "text-muted"}`}>{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function SummaryTile({
  icon: Icon,
  title,
  detail
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  detail: string;
}) {
  return (
    <div className="border border-line bg-canvas p-4">
      <Icon className="h-5 w-5 text-action" aria-hidden />
      <h3 className="mt-3 text-sm font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted">{detail}</p>
    </div>
  );
}

function scoreTone(score: number) {
  if (score >= 80) return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (score >= 60) return "border-amber-200 bg-amber-50 text-amber-900";
  return "border-red-200 bg-red-50 text-red-700";
}

function ProductAuditRow({ product }: { product: GrowthProductScore }) {
  const title = product.product.title;
  const primaryIssue = product.issues[0];
  const href = product.product.source === "workspace" ? `/products/${product.product.id}` : product.product.adminUrl;
  const canApplyToShopify = product.product.source === "shopify" && product.product.id.startsWith("gid://shopify/Product/");

  return (
    <article className="grid gap-4 border-b border-line bg-white p-4 last:border-b-0 lg:grid-cols-[minmax(0,1fr)_260px]">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-semibold">{title}</h3>
          <span className="rounded border border-line px-2 py-0.5 text-xs text-muted">
            {product.product.source === "shopify" ? "Shopify" : "Workspace"}
          </span>
        </div>
        <p className="mt-2 text-sm leading-6 text-muted">
          {primaryIssue
            ? primaryIssue.detail
            : product.strengths[0] || "This product has enough SEO/GEO context for the first MVP audit."}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {product.issues.slice(0, 3).map((issue) => (
            <span key={issue.key} className="rounded border border-line px-2 py-1 text-xs text-muted">
              {issue.label}
            </span>
          ))}
        </div>
        {product.issues.length ? (
          <div className="mt-4 border border-line bg-canvas p-3">
            <p className="text-xs font-semibold uppercase text-muted">Suggested update</p>
            <p className="mt-2 text-sm font-semibold">{product.suggestedFix.seoTitle}</p>
            <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted">{product.suggestedFix.seoDescription}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {product.suggestedFix.tags.slice(0, 5).map((tag) => (
                <span key={tag} className="rounded bg-white px-2 py-0.5 text-[11px] font-medium text-muted">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </div>
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
          <ScorePill label="SEO" score={product.seoScore} />
          <ScorePill label="GEO" score={product.geoScore} />
          <ScorePill label="All" score={product.overallScore} />
        </div>
        {canApplyToShopify && product.issues.length ? (
          <GrowthApplyButton productId={product.product.id} />
        ) : null}
        {href ? (
          <Link
            href={href}
            target={product.product.source === "shopify" ? "_blank" : undefined}
            className="studio-focus inline-flex h-10 w-full items-center justify-center gap-2 rounded border border-line bg-white px-3 text-sm font-semibold hover:bg-canvas"
          >
            {product.product.source === "shopify" ? "Open in Shopify" : "Open draft"}
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </Link>
        ) : null}
      </div>
    </article>
  );
}

function ScorePill({ label, score }: { label: string; score: number }) {
  return (
    <div className={`border p-2 text-center ${scoreTone(score)}`}>
      <p className="text-[11px] font-semibold uppercase">{label}</p>
      <p className="mt-1 text-lg font-semibold">{score}</p>
    </div>
  );
}

function IssueBlock({
  issue,
  productTitle
}: {
  issue: GrowthAuditIssue;
  productTitle: string;
}) {
  const severityClass =
    issue.severity === "high"
      ? "text-red-700"
      : issue.severity === "medium"
        ? "text-amber-700"
        : "text-muted";

  return (
    <div className="border border-line bg-canvas p-3">
      <div className="flex items-start gap-2">
        {issue.severity === "high" ? (
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-600" aria-hidden />
        ) : (
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-action" aria-hidden />
        )}
        <div>
          <p className="text-xs font-semibold text-muted">{productTitle}</p>
          <h3 className="mt-1 text-sm font-semibold">{issue.label}</h3>
          <p className={`mt-1 text-xs font-semibold uppercase ${severityClass}`}>{issue.severity}</p>
          <p className="mt-2 text-sm leading-6 text-muted">{issue.suggestedFix}</p>
        </div>
      </div>
    </div>
  );
}
