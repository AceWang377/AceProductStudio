import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ImagePlus,
  PenLine,
  SearchCheck,
  Send,
  ShieldCheck,
  Store
} from "lucide-react";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "Learn how ACE ZERO TRADING connects Shopify, generates product images and SEO copy, audits live SEO/GEO pages, and writes approved updates back to Shopify.",
  alternates: {
    canonical: "/how-it-works"
  },
  openGraph: {
    title: `How It Works | ${siteConfig.name}`,
    description:
      "Connect Shopify, generate product assets, review draft content, publish safely, and improve live SEO/GEO pages with approved write-back.",
    url: `${siteConfig.url}/how-it-works`,
    type: "website"
  }
};

const steps = [
  {
    icon: Store,
    title: "Connect Shopify",
    body: "Each user connects their own Shopify store through OAuth. Store tokens stay server-side and updates stay tied to the correct workspace."
  },
  {
    icon: ImagePlus,
    title: "Upload one product photo",
    body: "Start a product workspace from one original image, then keep generated media, copy, price, inventory, and job history together."
  },
  {
    icon: PenLine,
    title: "Generate product assets",
    body: "Create ordered product images, SEO title, product description, tags, buyer FAQ, price, SKU, and inventory fields."
  },
  {
    icon: Send,
    title: "Publish a Shopify draft",
    body: "ACE ZERO TRADING publishes as draft by default so merchants can review the final listing in Shopify Admin before going live."
  },
  {
    icon: SearchCheck,
    title: "Audit live SEO/GEO pages",
    body: "Growth Studio checks live Shopify products and collections for search snippets, image SEO, internal links, schema readiness, and AI-answer clarity."
  },
  {
    icon: ShieldCheck,
    title: "Approve write-back updates",
    body: "Users preview before/after changes and credit cost, edit the AI draft, then confirm exactly which improvements are written to Shopify."
  }
];

const safeguards = [
  "Draft-first product publishing by default.",
  "Live SEO/GEO optimization only targets public Shopify pages that can rank.",
  "Before/after diffs are editable before write-back.",
  "Public product names are protected unless the merchant explicitly approves changes.",
  "Failed jobs keep readable retry logs and support context."
];

export default function HowItWorksPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "How ACE ZERO TRADING Works",
        description: metadata.description,
        url: `${siteConfig.url}/how-it-works`
      },
      {
        "@type": "HowTo",
        name: "How to create and optimize Shopify product pages with ACE ZERO TRADING",
        description:
          "A review-first workflow for Shopify product generation, draft publishing, and SEO/GEO optimization.",
        step: steps.map((step, index) => ({
          "@type": "HowToStep",
          position: index + 1,
          name: step.title,
          text: step.body
        }))
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: siteConfig.name,
            item: siteConfig.url
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "How It Works",
            item: `${siteConfig.url}/how-it-works`
          }
        ]
      }
    ]
  };

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="border-b border-line pb-10">
        <p className="text-sm font-semibold text-action">How it works</p>
        <h1 className="mt-3 max-w-4xl text-4xl font-semibold leading-tight sm:text-5xl">
          A review-first workflow from product photo to optimized Shopify page.
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-8 text-muted">
          ACE ZERO TRADING is built around two connected loops: Product Studio creates
          Shopify-ready drafts, while Growth Studio improves live pages with confirmed
          SEO/GEO updates.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            href="/login"
            className="studio-focus inline-flex h-11 items-center gap-2 rounded bg-action px-4 text-sm font-semibold text-white"
          >
            Start the workflow
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <Link
            href="/shopify-seo-geo-optimizer"
            className="studio-focus inline-flex h-11 items-center rounded border border-line bg-white px-4 text-sm font-semibold hover:bg-canvas"
          >
            View Growth Studio
          </Link>
        </div>
      </section>

      <section className="grid gap-px overflow-hidden border border-line bg-line md:grid-cols-2 lg:grid-cols-3">
        {steps.map((step, index) => {
          const Icon = step.icon;

          return (
            <article key={step.title} className="bg-white p-5">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded bg-emerald-50 text-action">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="text-xs font-semibold uppercase text-muted">
                  Step {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <h2 className="mt-5 text-xl font-semibold">{step.title}</h2>
              <p className="mt-3 text-sm leading-7 text-muted">{step.body}</p>
            </article>
          );
        })}
      </section>

      <section className="grid gap-6 border-y border-line py-10 lg:grid-cols-[360px_minmax(0,1fr)]">
        <div>
          <p className="text-sm font-semibold text-action">Safety model</p>
          <h2 className="mt-2 text-2xl font-semibold">Designed for merchant approval, not surprise automation.</h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            SEO/GEO tools become risky when they silently rewrite live commerce pages.
            ACE ZERO TRADING keeps the commercial workflow explicit and reversible.
          </p>
        </div>
        <div className="grid gap-px overflow-hidden border border-line bg-line md:grid-cols-2">
          {safeguards.map((item) => (
            <div key={item} className="flex gap-3 bg-white p-5 text-sm leading-6 text-muted">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-action" aria-hidden />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Link
          href="/shopify-ai-product-listing-generator"
          className="studio-focus group border border-line bg-white p-5 transition hover:border-action hover:bg-canvas"
        >
          <p className="text-sm font-semibold text-action">Product Studio</p>
          <h2 className="mt-2 text-2xl font-semibold">Generate draft-ready Shopify listings</h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            Create product images, SEO copy, price, SKU, inventory, and Shopify drafts from one workflow.
          </p>
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold">
            Explore Product Studio
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
          </span>
        </Link>
        <Link
          href="/shopify-seo-geo-optimizer"
          className="studio-focus group border border-line bg-white p-5 transition hover:border-action hover:bg-canvas"
        >
          <p className="text-sm font-semibold text-action">Growth Studio</p>
          <h2 className="mt-2 text-2xl font-semibold">Improve live SEO/GEO pages</h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            Score live products and collections, preview fixes, and write selected updates back to Shopify.
          </p>
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold">
            Explore Growth Studio
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
          </span>
        </Link>
      </section>
    </div>
  );
}
