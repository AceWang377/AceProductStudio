import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  FileText,
  Images,
  PackageCheck,
  Send,
  Store,
  UploadCloud
} from "lucide-react";
import type { Product, ShopifyConnection } from "@/lib/types";

type OnboardingStep = {
  title: string;
  description: string;
  href: string;
  action: string;
  complete: boolean;
  icon: React.ComponentType<{ className?: string }>;
};

function hasGeneratedImages(product: Product) {
  return product.images.some((image) => image.type !== "ORIGINAL");
}

function hasGeneratedCopy(product: Product) {
  return Boolean(
    product.description?.trim() ||
      product.bulletPoints.length ||
      product.tags.length ||
      product.faq.length
  );
}

function hasCommerceDetails(product: Product) {
  const price = Number.parseFloat(product.price ?? "");
  const hasValidPrice = Number.isFinite(price) && price > 0;
  const hasInventoryDecision = product.trackInventory
    ? product.inventoryQuantity !== undefined && product.inventoryQuantity >= 0
    : true;
  return hasValidPrice && hasInventoryDecision;
}

function getLatestProduct(products: Product[]) {
  return products[0] ?? null;
}

function productTabHref(product: Product | null, tab: "brief" | "media" | "copy" | "commerce" | "publish") {
  return product ? `/products/${product.id}?tab=${tab}` : "/products/new";
}

export function OnboardingChecklist({
  products,
  shopifyConnection
}: {
  products: Product[];
  shopifyConnection?: ShopifyConnection;
}) {
  const latestProduct = getLatestProduct(products);
  const steps: OnboardingStep[] = [
    {
      title: "Connect Shopify",
      description: "Save the store connection that will receive product drafts.",
      href: "/settings/shopify",
      action: shopifyConnection?.isActive ? "View connection" : "Connect store",
      complete: Boolean(shopifyConnection?.isActive),
      icon: Store
    },
    {
      title: "Upload first product",
      description: "Start from one original product photo.",
      href: latestProduct ? productTabHref(latestProduct, "brief") : "/products/new",
      action: latestProduct ? "View brief" : "Upload photo",
      complete: Boolean(latestProduct),
      icon: UploadCloud
    },
    {
      title: "Generate images",
      description: "Create lifestyle, detail, intro, and white background media.",
      href: productTabHref(latestProduct, "media"),
      action: "Open media workflow",
      complete: products.some(hasGeneratedImages),
      icon: Images
    },
    {
      title: "Generate copy",
      description: "Prepare title, description, bullets, tags, and FAQ.",
      href: productTabHref(latestProduct, "copy"),
      action: "Open copy editor",
      complete: products.some(hasGeneratedCopy),
      icon: FileText
    },
    {
      title: "Set commerce details",
      description: "Add price and decide whether inventory should be tracked.",
      href: productTabHref(latestProduct, "commerce"),
      action: "Open commerce",
      complete: products.some(hasCommerceDetails),
      icon: PackageCheck
    },
    {
      title: "Publish draft",
      description: "Send the completed product to Shopify as a draft.",
      href: productTabHref(latestProduct, "publish"),
      action: "Review publish",
      complete: products.some((product) =>
        ["PUBLISHED_AS_DRAFT", "PUBLISHED_LIVE"].includes(product.shopifyStatus)
      ),
      icon: Send
    }
  ];
  const completedCount = steps.filter((step) => step.complete).length;
  const nextStep = steps.find((step) => !step.complete) ?? steps[steps.length - 1];
  const progress = Math.round((completedCount / steps.length) * 100);

  return (
    <section className="border border-line bg-white">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm text-muted">Launch checklist</p>
              <h2 className="mt-1 text-xl font-semibold">Set up your first Shopify-ready product</h2>
            </div>
            <span className="inline-flex h-9 items-center rounded border border-line px-3 text-sm font-semibold">
              {completedCount}/{steps.length} complete
            </span>
          </div>
          <div className="mt-5 h-2 overflow-hidden rounded bg-canvas">
            <div className="h-full rounded bg-action" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <Link
                  key={step.title}
                  href={step.href}
                  className="studio-focus group flex gap-3 border border-line p-4 transition hover:border-action hover:bg-canvas"
                >
                  <span className="mt-0.5">
                    {step.complete ? (
                      <CheckCircle2 className="h-5 w-5 text-action" aria-hidden />
                    ) : (
                      <Circle className="h-5 w-5 text-muted" aria-hidden />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2 font-semibold">
                      <Icon className="h-4 w-4 text-muted" aria-hidden />
                      {step.title}
                    </span>
                    <span className="mt-1 block text-sm text-muted">{step.description}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
        <aside className="border-t border-line bg-canvas p-5 lg:border-l lg:border-t-0">
          <p className="text-sm text-muted">Next best action</p>
          <h3 className="mt-1 text-lg font-semibold">{nextStep.title}</h3>
          <p className="mt-2 text-sm text-muted">{nextStep.description}</p>
          <Link
            href={nextStep.href}
            className="studio-focus mt-5 inline-flex h-10 items-center gap-2 rounded bg-action px-4 text-sm font-semibold text-white"
          >
            {nextStep.action}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </aside>
      </div>
    </section>
  );
}
