import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Boxes,
  CheckCircle2,
  CircleAlert,
  Clock,
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
import type { Product } from "@/lib/types";

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
    <div className="space-y-8">
      <section className="grid gap-6 border-b border-line pb-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <p className="text-sm text-muted">Personal ecommerce content workspace</p>
          <h1 className="mt-2 max-w-3xl text-4xl font-semibold leading-tight">
            Upload a product photo, generate review-ready content, then publish as a Shopify draft.
          </h1>
          <Link
            href="/products/new"
            className="studio-focus mt-6 inline-flex h-11 items-center gap-2 rounded bg-action px-4 text-sm font-semibold text-white"
          >
            Create product draft
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Metric icon={Boxes} label="Drafts" value={products.length} />
          <Metric icon={CheckCircle2} label="Ready" value={ready} />
          <Metric icon={CircleAlert} label="Failed jobs" value={failedJobs} />
          <Metric icon={Coins} label="Credits" value={credits.isUnlimited ? "Unlimited" : credits.balance} />
          <Metric
            icon={Clock}
            label="Shopify"
            value={shopifyConnected ? "On" : "Off"}
          />
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

      <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent product drafts</h2>
            <Link href="/products" className="text-sm text-action">
              View all
            </Link>
          </div>
          {products.length ? (
            <div>
              {products.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="border border-line bg-white p-8 text-sm text-muted">
              No products yet. Create your first draft from an uploaded product photo.
            </div>
          )}
        </div>
        <aside>
          <h2 className="mb-3 text-xl font-semibold">Recent generation jobs</h2>
          <div className="space-y-3">
            {recentJobs.length ? (
              recentJobs.map((job) => (
                <div key={job.id} className="border border-line bg-white p-4 text-sm">
                  <div className="flex justify-between gap-3">
                    <span className="font-medium">{statusLabel(job.type)}</span>
                    <span>{job.progress}%</span>
                  </div>
                  <p className="mt-2 text-muted">
                    {statusLabel(job.status)} · {job.productTitle}
                  </p>
                </div>
              ))
            ) : (
              <div className="border border-line bg-white p-4 text-sm text-muted">
                Jobs will appear after image or copy generation.
              </div>
            )}
          </div>
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
    return {
      eyebrow: "Retry needed",
      title: `Review failed jobs for ${failedProduct.product.title || failedProduct.product.name || "this product"}`,
      detail: "Open the product workspace and retry the failed generation or Shopify publish job from the job panel.",
      href: `/products/${failedProduct.product.id}`,
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
      href: `/products/${readyProduct.product.id}`,
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
      href: `/products/${unfinishedProduct.product.id}`,
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
    <section className="grid gap-5 border border-line bg-white p-5 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div>
        <p className="text-sm font-medium text-muted">{action.eyebrow}</p>
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
