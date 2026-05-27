import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Coins, ShieldCheck } from "lucide-react";
import { CREDIT_PACKS, formatPackPrice } from "@/lib/billing";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple ACE ZERO TRADING credit packs for Shopify product image generation, SEO copy, Growth Studio audits, and approved Shopify write-back workflows.",
  alternates: {
    canonical: "/pricing"
  },
  openGraph: {
    title: `Pricing | ${siteConfig.name}`,
    description:
      "Review ACE ZERO TRADING credit packs for Shopify product creation, SEO/GEO optimization, and draft-first publishing.",
    url: `${siteConfig.url}/pricing`,
    type: "website"
  }
};

const included = [
  "Generate Shopify-ready product media from one product photo.",
  "Create SEO title, product description, tags, bullets, and FAQ copy.",
  "Run Growth Studio checks for live Shopify SEO/GEO readiness.",
  "Preview selected Shopify write-back changes before anything is updated."
];

const creditRules = [
  {
    title: "Image generation",
    body: "Image generation is the main credit cost because it uses the highest-cost AI workflow."
  },
  {
    title: "SEO/GEO optimization",
    body: "Growth audits can use credits when they generate rewrite drafts, image alt text, or write-back previews."
  },
  {
    title: "Draft-first publishing",
    body: "Publishing is review-first. ACE ZERO TRADING creates drafts or applies confirmed SEO updates only after approval."
  }
];

export default function PricingPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "ACE ZERO TRADING Pricing",
        description: metadata.description,
        url: `${siteConfig.url}/pricing`
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
            name: "Pricing",
            item: `${siteConfig.url}/pricing`
          }
        ]
      },
      {
        "@type": "OfferCatalog",
        name: "ACE ZERO TRADING credit packs",
        itemListElement: CREDIT_PACKS.map((pack) => ({
          "@type": "Offer",
          name: pack.name,
          description: pack.description,
          price: (pack.unitAmount / 100).toFixed(2),
          priceCurrency: pack.currency.toUpperCase(),
          url: `${siteConfig.url}/pricing`,
          availability: "https://schema.org/InStock"
        }))
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "What do ACE ZERO TRADING credits pay for?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Credits are used for generation and optimization workflows such as product images, SEO/GEO rewrite drafts, and approved Shopify update previews."
            }
          },
          {
            "@type": "Question",
            name: "Does ACE ZERO TRADING publish products live automatically?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "No. ACE ZERO TRADING is designed around draft-first publishing and review-before-write Shopify updates."
            }
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
      <section className="grid gap-8 border-b border-line pb-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
        <div>
          <p className="text-sm font-semibold text-action">Pricing</p>
          <h1 className="mt-3 max-w-4xl text-4xl font-semibold leading-tight sm:text-5xl">
            Credit packs for Shopify product creation and SEO/GEO optimization.
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-muted">
            Start with enough credits to create product media, generate SEO copy, audit live
            Shopify pages, and approve selected improvements before writing them back.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/login"
              className="studio-focus inline-flex h-11 items-center gap-2 rounded bg-action px-4 text-sm font-semibold text-white"
            >
              Start with ACE ZERO TRADING
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/how-it-works"
              className="studio-focus inline-flex h-11 items-center rounded border border-line bg-white px-4 text-sm font-semibold hover:bg-canvas"
            >
              See how it works
            </Link>
          </div>
        </div>
        <div className="border border-line bg-[#f4f7f4] p-5">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded bg-white text-action">
              <ShieldCheck className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <h2 className="font-semibold">Review-before-spend workflow</h2>
              <p className="mt-1 text-sm leading-6 text-muted">
                Users see credit costs before confirmed generation or Shopify write-back actions.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {CREDIT_PACKS.map((pack) => (
          <article key={pack.id} className="flex flex-col border border-line bg-white p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">{pack.name}</h2>
                <p className="mt-2 text-sm leading-6 text-muted">{pack.description}</p>
              </div>
              <Coins className="h-5 w-5 text-action" aria-hidden />
            </div>
            <p className="mt-6 text-4xl font-semibold">{formatPackPrice(pack)}</p>
            <p className="mt-1 text-sm text-muted">{pack.credits} credits</p>
            <Link
              href="/login"
              className="studio-focus mt-6 inline-flex h-10 items-center justify-center rounded bg-action px-4 text-sm font-semibold text-white"
            >
              Choose {pack.name}
            </Link>
          </article>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
        <div>
          <p className="text-sm font-semibold text-action">Included</p>
          <h2 className="mt-2 text-2xl font-semibold">What credits support</h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            Pricing is intentionally simple for the MVP: credits map to the workflows
            that create new assets or prepare confirmed Shopify updates.
          </p>
        </div>
        <div className="grid gap-px overflow-hidden border border-line bg-line md:grid-cols-2">
          {included.map((item) => (
            <div key={item} className="flex gap-3 bg-white p-5 text-sm leading-6 text-muted">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-action" aria-hidden />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-px overflow-hidden border border-line bg-line md:grid-cols-3">
        {creditRules.map((rule) => (
          <article key={rule.title} className="bg-white p-5">
            <h2 className="text-lg font-semibold">{rule.title}</h2>
            <p className="mt-3 text-sm leading-6 text-muted">{rule.body}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
