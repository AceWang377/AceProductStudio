import Link from "next/link";
import { ArrowRight, CheckCircle2, ChevronRight } from "lucide-react";
import { seoResourceList, type seoResources } from "@/lib/seo-resources";

type SeoArticle = (typeof seoResources)[keyof typeof seoResources];

export function SeoArticlePage({ article }: { article: SeoArticle }) {
  const relatedArticles = seoResourceList
    .filter((item) => item.slug !== article.slug)
    .slice(0, 3);

  return (
    <article className="mx-auto max-w-4xl">
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-sm text-muted">
        <Link href="/" className="studio-focus rounded hover:text-ink">
          ACE ZERO TRADING
        </Link>
        <ChevronRight className="h-4 w-4" aria-hidden />
        <Link href="/resources" className="studio-focus rounded hover:text-ink">
          Resources
        </Link>
        <ChevronRight className="h-4 w-4" aria-hidden />
        <span className="line-clamp-1 text-ink">{article.title}</span>
      </nav>
      <header className="border-b border-line pb-8">
        <div className="flex flex-wrap gap-2 text-sm text-muted">
          <span>{article.category}</span>
          <span aria-hidden>·</span>
          <span>{article.readingTime}</span>
          <span aria-hidden>·</span>
          <time dateTime={article.updatedAt}>Updated {article.updatedAt}</time>
        </div>
        <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
          {article.title}
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-8 text-muted">{article.description}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={article.relatedPath}
            className="studio-focus inline-flex h-11 items-center gap-2 rounded bg-action px-4 text-sm font-semibold text-white"
          >
            See related workflow
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <Link
            href="/resources"
            className="studio-focus inline-flex h-11 items-center rounded border border-line bg-white px-4 text-sm font-semibold hover:bg-canvas"
          >
            All resources
          </Link>
        </div>
      </header>

      <div className="mt-8 space-y-8">
        {article.sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-2xl font-semibold">{section.title}</h2>
            <p className="mt-3 text-base leading-8 text-muted">{section.body}</p>
          </section>
        ))}
      </div>

      <section className="mt-10 border border-line bg-white p-5">
        <h2 className="text-xl font-semibold">Practical checklist</h2>
        <ul className="mt-4 space-y-3">
          {article.checklist.map((item) => (
            <li key={item} className="flex gap-3 text-sm leading-6 text-muted">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-action" aria-hidden />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10 border-y border-line py-8">
        <h2 className="text-2xl font-semibold">FAQ</h2>
        <div className="mt-5 space-y-4">
          {article.faq.map((item) => (
            <div key={item.question} className="border border-line bg-white p-5">
              <h3 className="text-base font-semibold">{item.question}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{item.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-semibold">Related Shopify AI guides</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {relatedArticles.map((item) => (
            <Link
              key={item.slug}
              href={`/resources/${item.slug}`}
              className="studio-focus group flex flex-col border border-line bg-white p-5 transition hover:border-action hover:bg-canvas"
            >
              <p className="text-sm font-semibold text-action">{item.category}</p>
              <h3 className="mt-3 text-base font-semibold leading-snug">{item.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-6 text-muted">{item.excerpt}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold">
                Read guide
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-10 border border-line bg-[#eef4ef] p-6">
        <p className="text-sm font-semibold text-action">Turn this into a repeatable workflow</p>
        <h2 className="mt-2 text-2xl font-semibold">
          Use ACE ZERO TRADING to generate product media, copy, and Shopify drafts from one place.
        </h2>
        <Link
          href="/login"
          className="studio-focus mt-5 inline-flex h-11 items-center gap-2 rounded bg-action px-4 text-sm font-semibold text-white"
        >
          Start your first product
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </section>
    </article>
  );
}
