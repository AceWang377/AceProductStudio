import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Boxes,
  CheckCircle2,
  CircleAlert,
  Coins,
  Gauge,
  Send
} from "lucide-react";
import { listProducts, readState } from "@/lib/store";
import { getCreditAccount } from "@/lib/credits";
import { OnboardingChecklist } from "@/components/onboarding/OnboardingChecklist";
import { ProductCard } from "@/components/product/ProductCard";
import { getProductReadiness, type ProductReadiness } from "@/lib/product-readiness";
import { statusLabel } from "@/lib/status";
import type { GenerationJob, Product } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const products = await listProducts();
  const state = await readState();
  const credits = await getCreditAccount();
  const shopifyConnected = Boolean(state.shopifyConnection?.isActive);
  const productsWithReadiness = products.map((product) => ({
    product,
    readiness: getProductReadiness({ product, shopifyConnected })
  }));
  const ready = products.filter((product) => product.status === "READY").length;
  const readyForShopify = productsWithReadiness.filter(({ readiness }) => readiness.score >= 90).length;
  const published = products.filter((product) =>
    ["PUBLISHED_AS_DRAFT", "PUBLISHED_LIVE"].includes(product.shopifyStatus)
  ).length;
  const failedJobs = products.flatMap((product) => product.jobs).filter((job) => job.status === "FAILED").length;
  const recentJobs = products
    .flatMap((product) =>
      product.jobs.map((job) => ({
        ...job,
        productTitle: product.title || product.name || "Untitled product"
      }))
    )
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 4);
  const nextAction = getDashboardNextAction({
    productsWithReadiness,
    shopifyConnected
  });

  return (
    <div className="space-y-7">
      <section className="overflow-hidden border border-line bg-ink text-white shadow-soft">
        <div className="grid gap-0 xl:grid-cols-[minmax(0,1fr)_430px]">
          <div className="p-5 sm:p-7">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase text-white/60">
              <span>Workspace command center</span>
              <span className="h-1 w-1 rounded-full bg-white/30" aria-hidden />
              <span>{shopifyConnected ? "Shopify connected" : "Store not connected"}</span>
            </div>
            <h1 className="mt-4 max-w-3xl text-3xl font-semibold leading-tight sm:text-4xl">
              Build Shopify-ready listings from product photos.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">
              Keep every draft moving through media, copy, commerce, and publish checks before it reaches Shopify.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/products/new"
                className="studio-focus inline-flex h-11 items-center gap-2 rounded bg-white px-4 text-sm font-semibold text-ink"
              >
                Create product draft
                <ArrowUpRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/products"
                className="studio-focus inline-flex h-11 items-center gap-2 rounded border border-white/15 px-4 text-sm font-semibold text-white hover:bg-white/10"
              >
                Review products
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
          <div className="border-t border-white/10 bg-white/[0.04] p-5 sm:p-7 xl:border-l xl:border-t-0">
            <div className="grid grid-cols-2 gap-px overflow-hidden border border-white/10 bg-white/10">
              <Metric icon={Boxes} label="Drafts" value={products.length} tone="dark" />
              <Metric icon={CheckCircle2} label="Ready" value={ready} tone="dark" />
              <Metric icon={CircleAlert} label="Failed jobs" value={failedJobs} tone="dark" />
              <Metric icon={Coins} label="Credits" value={credits.isUnlimited ? "Unlimited" : credits.balance} tone="dark" />
            </div>
            <div className="mt-4 flex items-center justify-between gap-4 border border-white/10 bg-white/[0.04] p-4 text-sm">
              <span className="text-white/60">Shopify connection</span>
              <span className="inline-flex items-center gap-2 font-semibold">
                <span
                  className={`h-2 w-2 rounded-full ${shopifyConnected ? "bg-emerald-300" : "bg-amber-300"}`}
                  aria-hidden
                />
                {shopifyConnected ? "Ready to publish" : "Setup needed"}
              </span>
            </div>
          </div>
        </div>
      </section>

      <DashboardNextAction
        action={nextAction}
        readyForShopify={readyForShopify}
        published={published}
        total={products.length}
      />

      <OnboardingChecklist
        products={products}
        shopifyConnection={state.shopifyConnection}
      />

      <section className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div>
          <div className="mb-3 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm text-muted">Draft pipeline</p>
              <h2 className="text-xl font-semibold">Recent product drafts</h2>
            </div>
            <Link href="/products" className="text-sm font-semibold text-action">
              View all
            </Link>
          </div>
          {products.length ? (
            <div className="border-y border-line">
              {productsWithReadiness.slice(0, 4).map(({ product, readiness }) => (
                <ProductCard key={product.id} product={product} readiness={readiness} />
              ))}
            </div>
          ) : (
            <div className="border border-line bg-white p-8 text-sm text-muted">
              No products yet. Create your first draft from an uploaded product photo.
            </div>
          )}
        </div>
        <aside className="space-y-5">
          <ProductPipeline
            total={products.length}
            readyForShopify={readyForShopify}
            published={published}
            failedJobs={failedJobs}
          />
          <RecentJobs jobs={recentJobs} />
        </aside>
      </section>
    </div>
  );
}

type DashboardAction = {
  eyebrow: string;
  title: string;
  detail: string;
  href: string;
  cta: string;
};

function productTabHref(productId: string, tab: "brief" | "media" | "copy" | "commerce" | "publish") {
  return `/products/${productId}?tab=${tab}`;
}

function getDashboardNextAction({
  productsWithReadiness,
  shopifyConnected
}: {
  productsWithReadiness: Array<{ product: Product; readiness: ProductReadiness }>;
  shopifyConnected: boolean;
}): DashboardAction {
  if (!shopifyConnected) {
    return {
      eyebrow: "Store setup",
      title: "Connect Shopify before publishing",
      detail: "OAuth keeps the store token saved server-side so future drafts can publish without retyping credentials.",
      href: "/settings/shopify",
      cta: "Connect Shopify"
    };
  }

  if (!productsWithReadiness.length) {
    return {
      eyebrow: "First product",
      title: "Upload a product photo",
      detail: "Start from one original image, then generate the media set and listing copy from the same workflow.",
      href: "/products/new",
      cta: "Create product draft"
    };
  }

  const failedProduct = productsWithReadiness.find(({ product }) =>
    product.jobs.some((job) => job.status === "FAILED")
  );
  if (failedProduct) {
    const failedJob = failedProduct.product.jobs.find((job) => job.status === "FAILED");
    const failedTab =
      failedJob?.type === "IMAGE_GENERATION"
        ? "media"
        : failedJob?.type === "COPY_GENERATION"
          ? "copy"
          : "publish";
    return {
      eyebrow: "Retry needed",
      title: `Review failed jobs for ${failedProduct.product.title || failedProduct.product.name || "this product"}`,
      detail: "Open the product workspace and retry the failed generation or Shopify publish job from the job panel.",
      href: productTabHref(failedProduct.product.id, failedTab),
      cta: "Review job"
    };
  }

  const readyProduct = productsWithReadiness.find(
    ({ product, readiness }) =>
      readiness.score >= 90 && !["PUBLISHED_AS_DRAFT", "PUBLISHED_LIVE"].includes(product.shopifyStatus)
  );
  if (readyProduct) {
    return {
      eyebrow: "Ready to publish",
      title: `${readyProduct.product.title || readyProduct.product.name || "Product"} is ready for a Shopify draft`,
      detail: "The listing has the required media, copy, price, inventory decision, and connected store.",
      href: productTabHref(readyProduct.product.id, "publish"),
      cta: "Create Shopify draft"
    };
  }

  const unfinishedProduct = productsWithReadiness.find(({ readiness }) => readiness.score < 90);
  if (unfinishedProduct) {
    const nextItem = unfinishedProduct.readiness.nextItem;
    return {
      eyebrow: `${unfinishedProduct.readiness.score}% listing quality`,
      title: nextItem
        ? `Finish ${nextItem.label.toLowerCase()}`
        : `Continue ${unfinishedProduct.product.title || unfinishedProduct.product.name || "this product"}`,
      detail: nextItem?.detail || "Open the workspace and complete the remaining listing requirements.",
      href: productTabHref(unfinishedProduct.product.id, nextItem?.tab ?? "brief"),
      cta: "Continue product"
    };
  }

  return {
    eyebrow: "Workspace ready",
    title: "Create the next Shopify-ready product",
    detail: "Your current drafts are in good shape. Start another product from a fresh original image.",
    href: "/products/new",
    cta: "Create next draft"
  };
}

function DashboardNextAction({
  action,
  readyForShopify,
  published,
  total
}: {
  action: DashboardAction;
  readyForShopify: number;
  published: number;
  total: number;
}) {
  return (
    <section className="grid gap-5 border border-line bg-white p-5 shadow-soft lg:grid-cols-[minmax(0,1fr)_360px]">
      <div>
        <p className="text-sm font-medium text-action">{action.eyebrow}</p>
        <h2 className="mt-1 text-2xl font-semibold leading-tight">{action.title}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">{action.detail}</p>
        <Link
          href={action.href}
          className="studio-focus mt-5 inline-flex h-10 items-center gap-2 rounded bg-action px-4 text-sm font-semibold text-white"
        >
          {action.cta}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
      <div className="grid grid-cols-3 divide-x divide-line border border-line bg-canvas text-center">
        <PulseMetric
          icon={Gauge}
          label="Ready quality"
          value={readyForShopify}
          suffix={total ? `/${total}` : undefined}
        />
        <PulseMetric
          icon={Send}
          label="Published"
          value={published}
          suffix={total ? `/${total}` : undefined}
        />
        <PulseMetric icon={CheckCircle2} label="In progress" value={Math.max(total - published, 0)} />
      </div>
    </section>
  );
}

function ProductPipeline({
  total,
  readyForShopify,
  published,
  failedJobs
}: {
  total: number;
  readyForShopify: number;
  published: number;
  failedJobs: number;
}) {
  const inProgress = Math.max(total - published, 0);
  const readyWidth = total ? Math.round((readyForShopify / total) * 100) : 0;
  const publishedWidth = total ? Math.round((published / total) * 100) : 0;

  return (
    <section className="border border-line bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted">Pipeline health</p>
          <h2 className="mt-1 text-xl font-semibold">Shopify readiness</h2>
        </div>
        <span className="rounded bg-canvas px-2.5 py-1 text-xs font-semibold text-muted">
          {total} total
        </span>
      </div>
      <div className="mt-5 space-y-4">
        <PipelineRow label="Ready quality" value={readyForShopify} total={total} width={readyWidth} tone="action" />
        <PipelineRow label="Published" value={published} total={total} width={publishedWidth} tone="ink" />
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div className="border border-line bg-canvas p-3">
          <p className="text-xs text-muted">In progress</p>
          <p className="mt-1 text-lg font-semibold">{inProgress}</p>
        </div>
        <div className="border border-line bg-canvas p-3">
          <p className="text-xs text-muted">Failed jobs</p>
          <p className={`mt-1 text-lg font-semibold ${failedJobs ? "text-red-700" : "text-action"}`}>
            {failedJobs}
          </p>
        </div>
      </div>
    </section>
  );
}

function PipelineRow({
  label,
  value,
  total,
  width,
  tone
}: {
  label: string;
  value: number;
  total: number;
  width: number;
  tone: "action" | "ink";
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted">
          <span className="font-semibold text-ink">{value}</span>/{total || 0}
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded bg-canvas">
        <div
          className={`h-full rounded ${tone === "action" ? "bg-action" : "bg-ink"}`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

function RecentJobs({
  jobs
}: {
  jobs: Array<GenerationJob & { productTitle: string }>;
}) {
  return (
    <section className="border border-line bg-white p-5">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted">Automation</p>
          <h2 className="text-xl font-semibold">Recent jobs</h2>
        </div>
        <Link href="/usage" className="text-sm font-semibold text-action">
          Usage
        </Link>
      </div>
      <div className="space-y-3">
        {jobs.length ? (
          jobs.map((job) => <JobRow key={job.id} job={job} />)
        ) : (
          <div className="border border-line bg-canvas p-4 text-sm text-muted">
            Jobs will appear after image or copy generation.
          </div>
        )}
      </div>
    </section>
  );
}

function JobRow({
  job
}: {
  job: GenerationJob & { productTitle: string };
}) {
  const failed = job.status === "FAILED";
  const complete = job.status === "COMPLETED";

  return (
    <div className="border border-line bg-canvas p-4 text-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${
                failed ? "bg-red-500" : complete ? "bg-action" : "bg-amber-500"
              }`}
              aria-hidden
            />
            <span className="font-semibold">{statusLabel(job.type)}</span>
          </div>
          <p className="mt-1 truncate text-muted">{job.productTitle}</p>
        </div>
        <span className={failed ? "text-red-700" : "text-muted"}>{statusLabel(job.status)}</span>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded bg-white">
        <div
          className={`h-full rounded ${failed ? "bg-red-500" : "bg-action"}`}
          style={{ width: `${job.progress}%` }}
        />
      </div>
    </div>
  );
}

function PulseMetric({
  icon: Icon,
  label,
  value,
  suffix
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  suffix?: string;
}) {
  return (
    <div className="p-4">
      <Icon className="mx-auto h-4 w-4 text-action" aria-hidden />
      <p className="mt-3 text-xl font-semibold">
        {value}
        {suffix ? <span className="text-sm text-muted">{suffix}</span> : null}
      </p>
      <p className="mt-1 text-xs text-muted">{label}</p>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  tone = "light"
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  tone?: "light" | "dark";
}) {
  return (
    <div className={tone === "dark" ? "bg-ink p-4 text-white" : "border border-line bg-white p-4"}>
      <Icon className={`h-5 w-5 ${tone === "dark" ? "text-emerald-200" : "text-action"}`} aria-hidden />
      <p className="mt-4 text-2xl font-semibold">{value}</p>
      <p className={tone === "dark" ? "text-sm text-white/55" : "text-sm text-muted"}>{label}</p>
    </div>
  );
}
