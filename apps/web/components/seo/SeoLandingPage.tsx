import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { seoResourceList } from "@/lib/seo-resources";

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
  faq: Array<{
    question: string;
    answer: string;
  }>;
};

export function SeoLandingPage({
  eyebrow,
  title,
  description,
  primaryCta,
  sections,
  benefits,
  faq
}: SeoLandingPageProps) {
  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <section className="grid gap-8 border-b border-line pb-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <div>
          <p className="text-sm font-semibold text-action">{eyebrow}</p>
          <h1 className="mt-3 max-w-4xl text-4xl font-semibold leading-tight sm:text-5xl">
            {title}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-muted">{description}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/login"
              className="studio-focus inline-flex h-11 items-center gap-2 rounded bg-action px-4 text-sm font-semibold text-white"
            >
              {primaryCta}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/support"
              className="studio-focus inline-flex h-11 items-center rounded border border-line bg-white px-4 text-sm font-semibold hover:bg-canvas"
            >
              Talk to support
            </Link>
          </div>
        </div>
        <div className="border border-line bg-white p-5">
          <h2 className="text-lg font-semibold">What AceStudio helps with</h2>
          <ul className="mt-4 space-y-3">
            {benefits.map((benefit) => (
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

      <section className="border-y border-line py-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-action">Shopify AI resources</p>
            <h2 className="mt-2 text-2xl font-semibold">Recommended guides for this workflow</h2>
          </div>
          <Link
            href="/resources"
            className="studio-focus inline-flex h-11 items-center gap-2 rounded border border-line bg-white px-4 text-sm font-semibold hover:bg-canvas"
          >
            View all resources
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
                Read guide
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-line py-10">
        <h2 className="text-2xl font-semibold">Frequently asked questions</h2>
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
            <p className="text-sm font-semibold text-action">Ready to build the first draft?</p>
            <h2 className="mt-2 text-2xl font-semibold">Create Shopify-ready product content from one photo.</h2>
          </div>
          <Link
            href="/login"
            className="studio-focus inline-flex h-11 items-center justify-center gap-2 rounded bg-action px-4 text-sm font-semibold text-white"
          >
            Open AceStudio
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </section>
    </div>
  );
}
