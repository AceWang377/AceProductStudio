"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ExternalLink } from "lucide-react";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { seoResourceList } from "@/lib/seo-resources";
import { siteConfig } from "@/lib/site";

type SeoLandingPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  primaryCta: string;
  sections: Array<{
    title: string;
    body: string;
  }>;
  benefits: string[];
  proof?: {
    eyebrow: string;
    title: string;
    body: string;
    metrics: Array<{ label: string; value: string }>;
    media: Array<{ src: string; alt: string; label: string }>;
    resultCards: Array<{ title: string; detail: string }>;
  };
  richResults?: {
    eyebrow: string;
    title: string;
    body: string;
    checks: string[];
  };
  optimizationAreas?: Array<{
    title: string;
    body: string;
    checks: string[];
  }>;
  faq: Array<{
    question: string;
    answer: string;
  }>;
  translationKey?: "shopifySeoGeoOptimizer";
};

export function SeoLandingPage({
  eyebrow,
  title,
  description,
  primaryCta,
  sections,
  benefits,
  proof,
  richResults,
  optimizationAreas,
  faq,
  translationKey
}: SeoLandingPageProps) {
  const { t } = useLanguage();
  const translatedPage = translationKey ? t.seo[translationKey] : null;
  const pageEyebrow = translatedPage?.eyebrow ?? eyebrow;
  const pageTitle = translatedPage?.title ?? title;
  const pageDescription = translatedPage?.description ?? description;
  const pagePrimaryCta = translatedPage?.primaryCta ?? primaryCta;
  const pageBenefits = translatedPage?.benefits ?? benefits;
  const pageProof = translatedPage?.proof ?? proof;
  const pageRichResults = translatedPage?.richResults ?? richResults;
  const pageOptimizationAreas = translatedPage?.optimizationAreas ?? optimizationAreas;
  const richResultsUrl = `https://search.google.com/test/rich-results?url=${encodeURIComponent(`${siteConfig.url}/shopify-seo-geo-optimizer`)}`;

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <section className="grid gap-8 border-b border-line pb-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <div>
          <p className="text-sm font-semibold text-action">{pageEyebrow}</p>
          <h1 className="mt-3 max-w-4xl text-4xl font-semibold leading-tight sm:text-5xl">
            {pageTitle}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-muted">{pageDescription}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/login"
              className="studio-focus inline-flex h-11 items-center gap-2 rounded bg-action px-4 text-sm font-semibold text-white"
            >
              {pagePrimaryCta}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/support"
              className="studio-focus inline-flex h-11 items-center rounded border border-line bg-white px-4 text-sm font-semibold hover:bg-canvas"
            >
              {t.seo.landing.talkToSupport}
            </Link>
          </div>
        </div>
        <div className="border border-line bg-white p-5">
          <h2 className="text-lg font-semibold">{t.seo.landing.helpsWith}</h2>
          <ul className="mt-4 space-y-3">
            {pageBenefits.map((benefit) => (
              <li key={benefit} className="flex gap-3 text-sm leading-6 text-muted">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-action" aria-hidden />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {sections.map((section) => (
          <article key={section.title} className="border border-line bg-white p-5">
            <h2 className="text-xl font-semibold">{section.title}</h2>
            <p className="mt-3 text-sm leading-7 text-muted">{section.body}</p>
          </article>
        ))}
      </section>

      {pageProof ? (
        <section className="border-y border-line py-10">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
            <div>
              <p className="text-sm font-semibold text-action">{pageProof.eyebrow}</p>
              <h2 className="mt-2 text-2xl font-semibold">{pageProof.title}</h2>
              <p className="mt-3 text-sm leading-6 text-muted">{pageProof.body}</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {pageProof.metrics.map((metric) => (
                  <div key={metric.label} className="border border-line bg-white p-4">
                    <p className="text-2xl font-semibold">{metric.value}</p>
                    <p className="mt-1 text-xs font-semibold uppercase text-muted">{metric.label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {pageProof.resultCards.map((result) => (
                  <article key={result.title} className="border border-line bg-white p-4">
                    <p className="text-sm font-semibold text-action">{result.title}</p>
                    <p className="mt-2 text-sm leading-6 text-muted">{result.detail}</p>
                  </article>
                ))}
              </div>
            </div>
            <div className="border border-line bg-white p-4">
              <div className="grid gap-3 sm:grid-cols-[1.15fr_0.85fr]">
                {pageProof.media.map((item, index) => (
                  <figure
                    key={item.src}
                    className={index === 0 ? "sm:row-span-2" : ""}
                  >
                    <div className="relative aspect-square overflow-hidden border border-line bg-canvas">
                      <Image
                        src={item.src}
                        alt={item.alt}
                        fill
                        sizes={index === 0 ? "(min-width: 1024px) 360px, 100vw" : "(min-width: 1024px) 220px, 50vw"}
                        className="object-cover"
                      />
                    </div>
                    <figcaption className="mt-2 text-xs font-semibold uppercase text-muted">
                      {item.label}
                    </figcaption>
                  </figure>
                ))}
              </div>
              <div className="mt-4 border border-line bg-canvas p-4">
                <p className="text-xs font-semibold uppercase text-muted">{t.seo.landing.sampleDiff}</p>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold text-muted">{t.seo.landing.before}</p>
                    <p className="mt-1 text-sm font-semibold">Blush Aurora Ring</p>
                    <p className="mt-1 text-xs leading-5 text-muted">No meta description. Missing image alt text.</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-action">{t.seo.landing.after}</p>
                    <p className="mt-1 text-sm font-semibold">Blush Aurora Ring for Elegant Gift Styling</p>
                    <p className="mt-1 text-xs leading-5 text-muted">Meta, FAQ, alt text, and internal link ready for approval.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {pageOptimizationAreas?.length ? (
        <section className="border-y border-line py-10">
          <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
            <div>
              <p className="text-sm font-semibold text-action">{t.seo.landing.optimizationEyebrow}</p>
              <h2 className="mt-2 text-2xl font-semibold">{t.seo.landing.optimizationTitle}</h2>
              <p className="mt-3 text-sm leading-6 text-muted">
                {t.seo.landing.optimizationIntro}
              </p>
            </div>
            <div className="grid gap-px overflow-hidden border border-line bg-line md:grid-cols-2">
              {pageOptimizationAreas.map((area) => (
                <article key={area.title} className="bg-white p-5">
                  <h3 className="text-lg font-semibold">{area.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">{area.body}</p>
                  <ul className="mt-4 space-y-2">
                    {area.checks.map((check) => (
                      <li key={check} className="flex gap-2 text-sm text-muted">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-action" aria-hidden />
                        <span>{check}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {pageRichResults ? (
        <section className="border-y border-line py-10">
          <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
            <div>
              <p className="text-sm font-semibold text-action">{pageRichResults.eyebrow}</p>
              <h2 className="mt-2 text-2xl font-semibold">{pageRichResults.title}</h2>
              <p className="mt-3 text-sm leading-6 text-muted">{pageRichResults.body}</p>
              <a
                href={richResultsUrl}
                target="_blank"
                rel="noreferrer"
                className="studio-focus mt-5 inline-flex h-11 items-center gap-2 rounded border border-line bg-white px-4 text-sm font-semibold hover:bg-canvas"
              >
                {t.seo.landing.openRichResultsTest}
                <ExternalLink className="h-4 w-4" aria-hidden />
              </a>
            </div>
            <div className="grid gap-px overflow-hidden border border-line bg-line md:grid-cols-2">
              {pageRichResults.checks.map((check) => (
                <div key={check} className="flex gap-3 bg-white p-5 text-sm leading-6 text-muted">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-action" aria-hidden />
                  <span>{check}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="border-y border-line py-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-action">{t.seo.landing.resourcesEyebrow}</p>
            <h2 className="mt-2 text-2xl font-semibold">{t.seo.landing.resourcesTitle}</h2>
          </div>
          <Link
            href="/resources"
            className="studio-focus inline-flex h-11 items-center gap-2 rounded border border-line bg-white px-4 text-sm font-semibold hover:bg-canvas"
          >
            {t.seo.landing.viewAllResources}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {seoResourceList.slice(0, 3).map((article) => (
            <Link
              key={article.slug}
              href={`/resources/${article.slug}`}
              className="studio-focus group flex min-h-56 flex-col border border-line bg-white p-5 transition hover:border-action hover:bg-canvas"
            >
              <p className="text-sm font-semibold text-action">{article.category}</p>
              <h3 className="mt-3 text-base font-semibold leading-snug">{article.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-6 text-muted">{article.excerpt}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold">
                {t.seo.landing.readGuide}
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-line py-10">
        <h2 className="text-2xl font-semibold">{t.seo.landing.faqTitle}</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {faq.map((item) => (
            <article key={item.question} className="border border-line bg-white p-5">
              <h3 className="text-base font-semibold">{item.question}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{item.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border border-line bg-[#eef4ef] p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-action">{t.seo.landing.finalEyebrow}</p>
            <h2 className="mt-2 text-2xl font-semibold">{t.seo.landing.finalTitle}</h2>
          </div>
          <Link
            href="/login"
            className="studio-focus inline-flex h-11 items-center justify-center gap-2 rounded bg-action px-4 text-sm font-semibold text-white"
          >
            {t.seo.landing.finalCta}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </section>
    </div>
  );
}
