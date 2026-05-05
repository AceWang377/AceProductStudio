import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpenText } from "lucide-react";
import { seoResourceList } from "@/lib/seo-resources";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Shopify AI Product Content Resources",
  description:
    "Guides for using AI to create Shopify product images, SEO descriptions, and draft-first product publishing workflows.",
  alternates: {
    canonical: "/resources"
  },
  openGraph: {
    title: `Shopify AI Product Content Resources | ${siteConfig.name}`,
    description:
      "Practical SEO guides for Shopify merchants using AI-generated product images, copy, and draft publishing workflows.",
    url: `${siteConfig.url}/resources`,
    type: "website"
  }
};

export default function ResourcesPage() {
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Shopify AI Product Content Resources",
      description: metadata.description,
      url: `${siteConfig.url}/resources`,
      mainEntity: seoResourceList.map((article) => ({
        "@type": "Article",
        headline: article.title,
        description: article.description,
        url: `${siteConfig.url}/resources/${article.slug}`,
        datePublished: article.publishedAt,
        dateModified: article.updatedAt
      }))
    },
    {
      "@context": "https://schema.org",
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
          name: "Resources",
          item: `${siteConfig.url}/resources`
        }
      ]
    }
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <section className="border-b border-line pb-8">
        <div className="flex items-center gap-2 text-sm font-semibold text-action">
          <BookOpenText className="h-4 w-4" aria-hidden />
          Shopify AI resources
        </div>
        <h1 className="mt-3 max-w-4xl text-4xl font-semibold leading-tight sm:text-5xl">
          Guides for AI product images, Shopify SEO copy, and draft publishing.
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-8 text-muted">
          Practical tutorials for merchants who want to use AI inside a controlled Shopify product workflow.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {seoResourceList.map((article) => (
          <Link
            key={article.slug}
            href={`/resources/${article.slug}`}
            className="studio-focus group flex flex-col border border-line bg-white p-5 transition hover:border-action hover:bg-canvas"
          >
            <p className="text-sm font-semibold text-action">{article.category}</p>
            <h2 className="mt-3 text-xl font-semibold leading-snug">{article.title}</h2>
            <p className="mt-3 flex-1 text-sm leading-6 text-muted">{article.excerpt}</p>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-ink">
              Read guide
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
            </span>
          </Link>
        ))}
      </section>
    </div>
  );
}
