import Link from "next/link";
import { ArrowUpRight, Boxes, CheckCircle2, CircleAlert, Clock, Coins } from "lucide-react";
import { listProducts, readState } from "@/lib/store";
import { getCreditAccount } from "@/lib/credits";
import { OnboardingChecklist } from "@/components/onboarding/OnboardingChecklist";
import { ProductCard } from "@/components/product/ProductCard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const products = await listProducts();
  const state = await readState();
  const credits = await getCreditAccount();
  const ready = products.filter((product) => product.status === "READY").length;
  const failedJobs = products.flatMap((product) => product.jobs).filter((job) => job.status === "FAILED").length;
  const recentJobs = products.flatMap((product) => product.jobs).slice(0, 4);

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
            value={state.shopifyConnection?.isActive ? "On" : "Off"}
          />
        </div>
      </section>

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
                    <span className="font-medium">{job.type.toLowerCase().replaceAll("_", " ")}</span>
                    <span>{job.progress}%</span>
                  </div>
                  <p className="mt-2 text-muted">{job.status.toLowerCase()}</p>
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
