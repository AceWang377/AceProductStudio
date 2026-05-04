import Link from "next/link";
import { ArrowUpRight, FileText, ImagePlus, Plus, Send, Store } from "lucide-react";
import { listProducts } from "@/lib/store";
import { ProductList } from "@/components/product/ProductList";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await listProducts();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted">Draft management</p>
          <h1 className="text-3xl font-semibold">Products</h1>
        </div>
        <Link
          href="/products/new"
          className="studio-focus inline-flex h-10 items-center gap-2 rounded bg-action px-4 text-sm font-semibold text-white"
        >
          <Plus className="h-4 w-4" aria-hidden />
          New
        </Link>
      </div>
      {products.length ? (
        <ProductList products={products} />
      ) : (
        <EmptyProducts />
      )}
    </div>
  );
}

function EmptyProducts() {
  const steps = [
    {
      title: "Upload",
      detail: "Start from one clear product photo.",
      icon: ImagePlus
    },
    {
      title: "Generate",
      detail: "Create images and Shopify copy.",
      icon: FileText
    },
    {
      title: "Publish",
      detail: "Send a review-ready draft to Shopify.",
      icon: Send
    }
  ];

  return (
    <section className="border border-line bg-white">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="p-6 sm:p-8">
          <p className="text-sm font-medium text-muted">First product</p>
          <h2 className="mt-2 max-w-2xl text-2xl font-semibold leading-tight">
            Create your first Shopify-ready listing from a product photo.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
            The workflow keeps the original image separate, generates a publish media set, prepares SEO copy, and saves everything for review before Shopify publishing.
          </p>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="border border-line bg-canvas p-4">
                  <Icon className="h-5 w-5 text-action" aria-hidden />
                  <h3 className="mt-4 font-semibold">{step.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-muted">{step.detail}</p>
                </div>
              );
            })}
          </div>
          <Link
            href="/products/new"
            className="studio-focus mt-6 inline-flex h-11 items-center gap-2 rounded bg-action px-4 text-sm font-semibold text-white"
          >
            Upload first product
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
        <aside className="border-t border-line bg-canvas p-6 sm:p-8 lg:border-l lg:border-t-0">
          <Store className="h-5 w-5 text-action" aria-hidden />
          <h3 className="mt-4 text-lg font-semibold">Connect Shopify when ready</h3>
          <p className="mt-2 text-sm leading-6 text-muted">
            You can create drafts before connecting a store. Connect Shopify before publishing so drafts can be sent in one step.
          </p>
          <Link
            href="/settings/shopify"
            className="studio-focus mt-5 inline-flex h-10 items-center gap-2 rounded border border-line bg-white px-3 text-sm font-semibold hover:bg-canvas"
          >
            Shopify setup
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </Link>
        </aside>
      </div>
    </section>
  );
}
