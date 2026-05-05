"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  FileText,
  Images,
  Send,
  Store,
  UploadCloud
} from "lucide-react";
import type { Product, ShopifyConnection } from "@/lib/types";
import { getProductReadiness } from "@/lib/product-readiness";
import { useLanguage } from "@/components/i18n/LanguageProvider";

type OnboardingStep = {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  action: string;
  complete: boolean;
  icon: React.ComponentType<{ className?: string }>;
};

function hasGeneratedImages(product: Product) {
  return product.images.filter((image) => image.type !== "ORIGINAL").length >= 4;
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

function hasReviewReadyProduct(product: Product, shopifyConnected: boolean) {
  return getProductReadiness({ product, shopifyConnected }).score >= 90;
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
  const { t } = useLanguage();
  const latestProduct = getLatestProduct(products);
  const shopifyConnected = Boolean(shopifyConnection?.isActive);
  const generateHref = latestProduct
    ? hasGeneratedImages(latestProduct)
      ? productTabHref(latestProduct, "copy")
      : productTabHref(latestProduct, "media")
    : "/products/new";
  const reviewHref = productTabHref(latestProduct, "publish");
  const steps: OnboardingStep[] = [
    {
      eyebrow: `${t.onboarding.step} 1`,
      title: t.onboarding.connectShopify.title,
      description: t.onboarding.connectShopify.description,
      href: "/settings/shopify",
      action: shopifyConnection?.isActive
        ? t.onboarding.connectShopify.activeAction
        : t.onboarding.connectShopify.action,
      complete: shopifyConnected,
      icon: Store
    },
    {
      eyebrow: `${t.onboarding.step} 2`,
      title: t.onboarding.uploadProduct.title,
      description: t.onboarding.uploadProduct.description,
      href: latestProduct ? productTabHref(latestProduct, "brief") : "/products/new",
      action: latestProduct
        ? t.onboarding.uploadProduct.activeAction
        : t.onboarding.uploadProduct.action,
      complete: Boolean(latestProduct),
      icon: UploadCloud
    },
    {
      eyebrow: `${t.onboarding.step} 3`,
      title: t.onboarding.generate.title,
      description: t.onboarding.generate.description,
      href: generateHref,
      action: latestProduct && hasGeneratedImages(latestProduct)
        ? t.onboarding.generate.copyAction
        : t.onboarding.generate.mediaAction,
      complete: products.some((product) => hasGeneratedImages(product) && hasGeneratedCopy(product)),
      icon: Images
    },
    {
      eyebrow: `${t.onboarding.step} 4`,
      title: t.onboarding.review.title,
      description: t.onboarding.review.description,
      href: reviewHref,
      action: t.onboarding.review.action,
      complete: products.some((product) => hasReviewReadyProduct(product, shopifyConnected) && hasCommerceDetails(product)),
      icon: FileText
    },
    {
      eyebrow: `${t.onboarding.step} 5`,
      title: t.onboarding.publish.title,
      description: t.onboarding.publish.description,
      href: reviewHref,
      action: t.onboarding.publish.action,
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
    <section className="overflow-hidden border border-line bg-white shadow-soft">
      <div className="grid gap-0 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium text-action">{t.onboarding.eyebrow}</p>
              <h2 className="mt-1 text-2xl font-semibold leading-tight">{t.onboarding.title}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                {t.onboarding.description}
              </p>
            </div>
            <span className="inline-flex h-9 items-center rounded border border-line px-3 text-sm font-semibold">
              {completedCount}/{steps.length} {t.onboarding.progress}
            </span>
          </div>
          <div className="mt-5 h-2 overflow-hidden rounded bg-canvas">
            <div className="h-full rounded bg-action" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-5 grid gap-3 lg:grid-cols-5">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <Link
                  key={step.title}
                  href={step.href}
                  className="studio-focus group flex min-h-40 flex-col justify-between border border-line bg-white p-4 transition hover:border-action hover:bg-canvas"
                >
                  <span className="flex items-start justify-between gap-3">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded bg-canvas text-sm font-semibold text-muted">
                      {index + 1}
                    </span>
                    {step.complete ? (
                      <CheckCircle2 className="h-5 w-5 text-action" aria-hidden />
                    ) : (
                      <Circle className="h-5 w-5 text-muted" aria-hidden />
                    )}
                  </span>
                  <span className="mt-5 block">
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted">{step.eyebrow}</span>
                    <span className="mt-2 flex items-center gap-2 font-semibold">
                      <Icon className="h-4 w-4 text-action" aria-hidden />
                      <span>{step.title}</span>
                    </span>
                    <span className="mt-2 block text-sm leading-5 text-muted">{step.description}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
        <aside className="border-t border-line bg-canvas p-5 sm:p-6 xl:border-l xl:border-t-0">
          <p className="text-sm font-medium text-action">{t.onboarding.nextBestAction}</p>
          <h3 className="mt-1 text-xl font-semibold">
            {t.onboarding.nextPrefix} {nextStep.title}
          </h3>
          <p className="mt-2 text-sm text-muted">{nextStep.description}</p>
          <Link
            href={nextStep.href}
            className="studio-focus mt-5 inline-flex h-11 items-center gap-2 rounded bg-action px-4 text-sm font-semibold text-white"
          >
            {nextStep.action}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <div className="mt-6 border-t border-line pt-5 text-sm text-muted">
            <p className="font-semibold text-ink">{t.onboarding.draftSafetyTitle}</p>
            <p className="mt-1 leading-6">
              {t.onboarding.draftSafetyBody}
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}
