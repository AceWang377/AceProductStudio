import Link from "next/link";
import type { ComponentType } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Activity,
  Clock3,
  CheckCircle2,
  CircleAlert,
  Database,
  Eye,
  FilePenLine,
  Gauge,
  Image as ImageIcon,
  Layers3,
  Link2,
  Lightbulb,
  LineChart,
  ListChecks,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";
import { GrowthApplyButton } from "@/components/growth/GrowthApplyButton";
import { GrowthMonitorButton } from "@/components/growth/GrowthMonitorButton";
import { SearchConsoleRewriteApplyButton } from "@/components/growth/SearchConsoleRewriteApplyButton";
import { requireCurrentUser } from "@/lib/auth";
import { GROWTH_APPLY_CREDIT_COST, GROWTH_AUDIT_CREDIT_COST, TRIAL_CREDITS } from "@/lib/credits";
import {
  getGrowthAudit,
  type GrowthAuditIssue,
  type GrowthCollectionScore,
  type GrowthInternalLinkSuggestion,
  type GrowthOptimizationTask,
  type GrowthStoreOpportunity,
  type GrowthProductScore
} from "@/lib/growth-audit";
import { listLatestGrowthMonitorRuns, type GrowthMonitorRun } from "@/lib/growth-monitoring";
import { listProducts, readState } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function GrowthPage() {
  const user = await requireCurrentUser();
  const [products, state, monitorRuns] = await Promise.all([
    listProducts(),
    readState(),
    listLatestGrowthMonitorRuns(user.id, 3)
  ]);
  const audit = await getGrowthAudit({
    connection: state.shopifyConnection,
    workspaceProducts: products
  });
  const shopifyConnected = Boolean(state.shopifyConnection?.isActive);
  const topIssues = audit.products.flatMap((product) =>
    product.issues.slice(0, 2).map((issue) => ({
      ...issue,
      productTitle: product.product.title,
      productId: product.product.id
    }))
  ).slice(0, 6);
  const latestMonitorRun = monitorRuns[0];
  const writeBackReadyTasks = audit.optimizationTasks.filter((task) => task.canWriteBack).length;
  const highImpactTasks = audit.optimizationTasks.filter((task) => task.priority === "high").length;
  const topCollectionIssues = audit.collections.flatMap((collection) =>
    collection.issues.slice(0, 2).map((issue) => ({
      ...issue,
      collectionTitle: collection.collection.title,
      collectionId: collection.collection.id
    }))
  ).slice(0, 5);
  const latestPageSpeed = latestMonitorRun?.output?.technicalSeo?.pageSpeed;
  const competitorGapCount = latestMonitorRun?.output?.competitorKeywordGaps?.length ?? 0;
  const keywordOpportunityTargets = (latestMonitorRun?.output?.keywordOpportunities ?? []).slice(0, 4).map((opportunity) => ({
    opportunity,
    product: findProductForOpportunity(opportunity.page, audit.products)
  }));
  const writeBackCandidates = audit.products
    .filter((product) =>
      product.product.source === "shopify" &&
      product.product.id.startsWith("gid://shopify/Product/") &&
      product.issues.length > 0
    )
    .slice()
    .sort((left, right) => left.overallScore - right.overallScore)
    .slice(0, 3);
  const workflowStages = [
    {
      title: "Audit",
      detail: "Read only live Online Store products and collections, then score content, media, schema, technical, and AI-answer readiness.",
      metricLabel: "Live products",
      metricValue: audit.productCount,
      icon: SearchCheck
    },
    {
      title: "Prioritize",
      detail: "Turn weak scores into a ranked queue with severity, effort, expected impact, and update scope.",
      metricLabel: "Tasks",
      metricValue: audit.optimizationTasks.length,
      icon: FilePenLine
    },
    {
      title: "Apply",
      detail: "Write back SEO title, meta description, tags, and answer-ready copy only after merchant confirmation.",
      metricLabel: "Write-back",
      metricValue: writeBackReadyTasks,
      icon: ShieldCheck
    },
    {
      title: "Monitor",
      detail: "Use Search Console, crawler, sitemap, redirect, page-speed, competitor-gap, and AI visibility checks to decide the next move.",
      metricLabel: "Runs",
      metricValue: monitorRuns.length,
      icon: LineChart
    }
  ];
  const skillCoverage = [
    {
      title: "On-page SEO",
      score: audit.averageSeoScore,
      status: "ready",
      detail: "SEO titles, meta descriptions, product titles, descriptions, tags, snippet previews, and CTR-ready rewrites.",
      skills: ["Title/meta scoring", "Description depth", "Keyword tags", "SERP preview"]
    },
    {
      title: "GEO answer readiness",
      score: audit.averageGeoScore,
      status: "ready",
      detail: "Buyer questions, product facts, use cases, comparison context, trust copy, and AI-answer-friendly blocks.",
      skills: ["FAQ blocks", "Use cases", "Comparison copy", "Trust context"]
    },
    {
      title: "Collection SEO",
      score: audit.averageCollectionSeoScore,
      status: audit.collections.length ? "ready" : "setup",
      detail: "Collection/category pages are scored as ranking assets with title, meta, buying-guide copy, FAQs, image context, and public URL checks.",
      skills: ["Category keywords", "Buying guides", "Collection FAQs", "Collection snippets"]
    },
    {
      title: "Image SEO",
      score: audit.averageImageSeoScore,
      status: "ready",
      detail: "Alt text, filename quality, image count, dimensions, compression readiness, and media ordering.",
      skills: ["Alt text", "Filename guidance", "Image size", "Media order"]
    },
    {
      title: "Technical indexability",
      score: latestPageSpeed?.averageResponseMs ? Math.round((audit.averageTechnicalSeoScore + (latestPageSpeed.slowUrls?.length ? 55 : 85)) / 2) : audit.averageTechnicalSeoScore,
      status: latestMonitorRun ? "ready" : "partial",
      detail: "Live-product filtering, product handles, canonical domain, sitemap health, broken links, redirects, and page-speed/Core Web Vitals readiness.",
      skills: ["Live-only audit", "Sitemap", "Broken links", "Page speed"]
    },
    {
      title: "Structured data",
      score: audit.averageSchemaScore,
      status: "partial",
      detail: "Product schema readiness, FAQ readiness, review/rating prerequisites, offer fields, collection context, and rich-result gaps.",
      skills: ["Product schema", "FAQ readiness", "Review readiness", "Offer context"]
    },
    {
      title: "Internal linking",
      score: audit.internalLinkSuggestions.length ? Math.min(95, 45 + audit.internalLinkSuggestions.length * 6) : 20,
      status: audit.internalLinkSuggestions.length ? "partial" : "setup",
      detail: "Suggests contextual links between products, collections, and future blog/buying-guide pages so authority flows into revenue pages.",
      skills: ["Product links", "Collection links", "Blog anchors", "Comparison paths"]
    },
    {
      title: "Growth intelligence",
      score: latestMonitorRun?.output?.commercialReadinessScore ?? audit.aiVisibilityScore,
      status: latestMonitorRun ? "partial" : "setup",
      detail: "Search Console queries, low-CTR pages, competitor keyword gaps, AI visibility checks, and history.",
      skills: ["GSC queries", "CTR gaps", "Competitor gaps", "AI visibility"]
    }
  ] as const;
  const dataSources = [
    {
      label: "Shopify product audit",
      status: shopifyConnected ? "ready" : "setup",
      cost: "Included",
      detail: "Uses the connected Shopify Admin API to read products and prepare user-approved write-back.",
      action: shopifyConnected ? "Connected" : "Connect Shopify OAuth"
    },
    {
      label: "Technical crawler",
      status: "ready",
      cost: "No paid API",
      detail: "Runs inside your app to check sitemap.xml, robots.txt, broken internal links, and redirect chains.",
      action: "Available now"
    },
    {
      label: "Vercel daily cron",
      status: process.env.CRON_SECRET?.trim() ? "ready" : "setup",
      cost: "Hobby daily",
      detail: "Vercel Cron Jobs are available on Hobby for once-per-day schedules, which fits the current MVP.",
      action: process.env.CRON_SECRET?.trim() ? "Protected" : "Add CRON_SECRET"
    },
    {
      label: "Competitor keyword gap",
      status: process.env.GROWTH_COMPETITOR_DOMAINS?.trim() ? "ready" : "setup",
      cost: "Free with manual competitor list",
      detail: "Uses your Search Console queries and a manually configured competitor-domain list. Paid Ahrefs/Semrush-style keyword APIs can be added later.",
      action: process.env.GROWTH_COMPETITOR_DOMAINS?.trim() ? "Competitors configured" : "Optional env later"
    },
    {
      label: "Page speed / Core Web Vitals",
      status: latestPageSpeed?.checkedUrls ? "ready" : "setup",
      cost: "Free basic crawler",
      detail: "The current crawler measures response time. PageSpeed Insights can be connected later for full Core Web Vitals field/lab data.",
      action: latestPageSpeed?.checkedUrls ? "Crawler data ready" : "Run monitor"
    },
    {
      label: "Review schema data",
      status: process.env.JUDGEME_API_TOKEN?.trim() || process.env.LOOX_API_KEY?.trim() ? "ready" : "setup",
      cost: "Likely paid app/API later",
      detail: "Judge.me, Loox, or another review source is needed for real rating/review data. MVP only checks readiness and never fabricates reviews.",
      action: "Defer until review app"
    },
    {
      label: "Google Search Console",
      status: process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL?.trim() && process.env.GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY?.trim()
        ? "ready"
        : "setup",
      cost: "Free quota",
      detail: "Reads clicks, impressions, CTR, position, queries, and sitemaps from verified properties.",
      action: "Optional but high value"
    },
    {
      label: "AI visibility proxy",
      status: process.env.GOOGLE_CUSTOM_SEARCH_API_KEY?.trim() && process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID?.trim()
        ? "ready"
        : "setup",
      cost: "100/day free",
      detail: "Uses Google Custom Search JSON API as a lightweight proxy for brand and product visibility checks.",
      action: "Optional"
    }
  ] as const;
  const noApiWins = audit.products
    .flatMap((product) => product.issues.slice(0, 2).map((issue) => ({
      key: `${product.product.id}-${issue.key}`,
      productTitle: product.product.title,
      label: issue.label,
      detail: issue.suggestedFix,
      severity: issue.severity
    })))
    .concat(audit.collections.flatMap((collection) => collection.issues.slice(0, 1).map((issue) => ({
      key: `${collection.collection.id}-${issue.key}`,
      productTitle: `${collection.collection.title} collection`,
      label: issue.label,
      detail: issue.suggestedFix,
      severity: issue.severity
    }))))
    .slice(0, 5);
  const primaryFocus =
    audit.optimizationTasks[0]?.title ||
    latestMonitorRun?.output?.actionPlan?.[0]?.title ||
    (shopifyConnected ? "Run live monitor" : "Connect Shopify");

  return (
    <div className="space-y-7">
      <section className="overflow-hidden border border-line bg-[#16251f] text-white shadow-soft">
        <div className="grid gap-0 xl:grid-cols-[minmax(0,1fr)_440px]">
          <div className="p-5 sm:p-7">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase text-white/60">
              <span>Growth Studio</span>
              <span className="h-1 w-1 rounded-full bg-white/30" aria-hidden />
              <span>{shopifyConnected ? "Live Online Store pages only" : "Connect Shopify for live audit"}</span>
            </div>
            <h1 className="mt-4 max-w-3xl text-3xl font-semibold leading-tight sm:text-4xl">
              Score Shopify products and collections for SEO and GEO before you approve updates.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">
              Read live pages from the connected Shopify store, find weak titles, thin descriptions, missing image context, internal-link gaps, and AI-answer gaps, then write selected fixes only after user confirmation.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={shopifyConnected ? "/products" : "/settings/shopify"}
                className="studio-focus inline-flex h-11 items-center gap-2 rounded bg-white px-4 text-sm font-semibold text-ink"
              >
                {shopifyConnected ? "Open product workflow" : "Connect Shopify"}
                <ArrowUpRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/shopify-seo-geo-optimizer"
                className="studio-focus inline-flex h-11 items-center gap-2 rounded border border-white/15 px-4 text-sm font-semibold text-white hover:bg-white/10"
              >
                SEO/GEO guide
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
          <div className="border-t border-white/10 bg-white/[0.04] p-5 sm:p-7 xl:border-l xl:border-t-0">
            <div className="grid grid-cols-2 gap-px overflow-hidden border border-white/10 bg-white/10">
              <Metric label="SEO score" value={audit.averageSeoScore || "--"} tone="dark" icon={SearchCheck} />
              <Metric label="GEO score" value={audit.averageGeoScore || "--"} tone="dark" icon={Sparkles} />
              <Metric label="Schema" value={audit.averageSchemaScore || "--"} tone="dark" icon={CheckCircle2} />
              <Metric label="Technical" value={audit.averageTechnicalSeoScore || "--"} tone="dark" icon={Gauge} />
            </div>
            <div className="mt-4 border border-white/10 bg-white/[0.04] p-4 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-white/60">Audit source</span>
                <span className="font-semibold">{audit.source === "shopify" ? "Live Shopify products" : "AceStudio workspace"}</span>
              </div>
              <div className="mt-2 flex items-center justify-between gap-4">
                <span className="text-white/60">Excluded non-live</span>
                <span className="font-semibold">{audit.excludedProductCount}</span>
              </div>
              {audit.storeName || audit.shopDomain ? (
                <p className="mt-2 truncate text-white/60">{audit.storeName || audit.shopDomain}</p>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {audit.error ? (
        <section className="border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
          <div className="flex gap-3">
            <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
            <div>
              <h2 className="font-semibold">Live Shopify audit could not run</h2>
              <p className="mt-1 leading-6">
                {audit.error} The page is showing AceStudio workspace products instead, so users still get a useful preview.
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="border border-line bg-white p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium text-action">Structured growth command center</p>
              <h2 className="mt-1 text-2xl font-semibold">One operating system for Shopify SEO and GEO</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
                Mature SEO products do not stop at a score. AceStudio now separates the work into audit, prioritization, approved write-back, and measurement so merchants always know what to do next.
              </p>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
                Only Shopify products with <strong className="font-semibold text-ink">ACTIVE status, a published date, and a public Online Store URL</strong> are included. Draft, archived, hidden, and unlisted products are excluded because they cannot rank in search.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:min-w-64">
              <MiniMetric label="High priority" value={highImpactTasks} />
              <MiniMetric label="Write-back ready" value={writeBackReadyTasks} />
            </div>
          </div>
          <div className="mt-5 grid gap-3 lg:grid-cols-4">
            {workflowStages.map((step) => (
              <WorkflowStep
                key={step.title}
                title={step.title}
                detail={step.detail}
                icon={step.icon}
                metricLabel={step.metricLabel}
                metricValue={step.metricValue}
              />
            ))}
          </div>
        </div>

        <aside className="border border-line bg-[#16251f] p-5 text-white">
          <Zap className="h-5 w-5 text-[#98d7c3]" aria-hidden />
          <h2 className="mt-4 text-lg font-semibold">Next best action</h2>
          <p className="mt-2 text-sm leading-6 text-white/65">
            The page should guide the merchant to one clear move instead of making them interpret every score.
          </p>
          <div className="mt-4 border border-white/10 bg-white/[0.04] p-4">
            <p className="text-xs font-semibold uppercase text-white/45">Recommended now</p>
            <p className="mt-2 text-xl font-semibold">{primaryFocus}</p>
            <p className="mt-2 text-sm leading-6 text-white/60">
              Monitoring costs {GROWTH_AUDIT_CREDIT_COST} credit. Confirmed Shopify write-back costs {GROWTH_APPLY_CREDIT_COST} credits. Trial users start with {TRIAL_CREDITS} credits.
            </p>
          </div>
        </aside>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="border border-line bg-white p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-[#e9f8f2]">
              <FilePenLine className="h-5 w-5 text-action" aria-hidden />
            </div>
            <div>
              <p className="text-sm font-medium text-action">Optimization writer</p>
              <h2 className="mt-1 text-2xl font-semibold">Do the SEO/GEO work, not just score it</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
                The commercial version has to behave like an approved optimization assistant: generate better fields,
                show an editable before/after diff, preview credit cost, then write selected improvements back to Shopify.
              </p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <WriteBackCapability
              icon={SearchCheck}
              title="Search snippet fields"
              detail="Improve SEO title and meta description without changing the merchant-facing product name by default."
            />
            <WriteBackCapability
              icon={Target}
              title="Keyword tags"
              detail="Normalize product tags around category, intent, material, use case, and buyer search language."
            />
            <WriteBackCapability
              icon={Sparkles}
              title="AI answer content"
              detail="Append answer-ready buyer Q&A and product facts so the page is easier for search and AI systems to understand."
            />
          </div>
          <div className="mt-5 border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
            Product display titles are deliberately not overwritten yet. That field affects merchandising, brand naming,
            and ads. Add it later as a separate checkbox when the merchant explicitly wants AceStudio to rewrite public product names.
          </div>
        </div>

        <aside className="border border-line bg-white p-5">
          <ShieldCheck className="h-5 w-5 text-action" aria-hidden />
          <h2 className="mt-4 text-lg font-semibold">Ready for approved write-back</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            These live Shopify products have the weakest scores and can be improved now with a reviewed Shopify update.
          </p>
          <div className="mt-4 space-y-3">
            {writeBackCandidates.length ? (
              writeBackCandidates.map((product) => (
                <WriteBackCandidateCard
                  key={product.product.id}
                  product={product}
                  creditCost={GROWTH_APPLY_CREDIT_COST}
                />
              ))
            ) : (
              <p className="border border-line bg-canvas p-3 text-sm leading-6 text-muted">
                No live Shopify products need write-back right now. Draft, archived, hidden, and unlisted products stay out of this queue.
              </p>
            )}
          </div>
        </aside>
      </section>

      <section className="border border-line bg-white p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-action">SEO/GEO skill coverage</p>
            <h2 className="mt-1 text-2xl font-semibold">The core skill map this feature should own</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
              The strongest commercial version covers the same pillars merchants expect from SEO suites and newer GEO tools: content, answer readiness, images, indexability, rich snippets, internal links, and growth intelligence.
            </p>
          </div>
          <span className="inline-flex h-9 items-center rounded border border-line px-3 text-sm font-semibold">
            {skillCoverage.length} pillars
          </span>
        </div>
        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          {skillCoverage.map((item) => (
            <SkillCoverageBlock key={item.title} item={item} />
          ))}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="border border-line bg-white p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium text-action">Collection SEO scoring</p>
              <h2 className="mt-1 text-2xl font-semibold">Score category pages, not only product pages</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
                Collection pages can rank for broader category keywords and should act like buying-guide landing pages. AceStudio now audits live public collections for snippets, category copy, FAQs, images, and crawlable URLs.
              </p>
            </div>
            <div className={`min-w-32 border p-3 text-center ${scoreTone(audit.averageCollectionSeoScore)}`}>
              <p className="text-[11px] font-semibold uppercase">Collection score</p>
              <p className="mt-1 text-2xl font-semibold">{audit.averageCollectionSeoScore || "--"}</p>
            </div>
          </div>
          <div className="mt-5 divide-y divide-line border-y border-line">
            {audit.collections.length ? (
              audit.collections.slice(0, 6).map((collection) => (
                <CollectionAuditRow key={collection.collection.id} collection={collection} />
              ))
            ) : (
              <div className="bg-canvas p-5 text-sm leading-6 text-muted">
                No public Shopify collections were returned yet. Publish collections to Online Store, then run Growth Studio again to score category pages.
              </div>
            )}
          </div>
        </div>

        <aside className="border border-line bg-white p-5">
          <Link2 className="h-5 w-5 text-action" aria-hidden />
          <h2 className="mt-4 text-lg font-semibold">Internal linking suggestions</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Use these as human-reviewed recommendations first. Later, you can add a Shopify write-back confirmation to insert links into product, collection, or blog content.
          </p>
          <div className="mt-4 space-y-3">
            {audit.internalLinkSuggestions.length ? (
              audit.internalLinkSuggestions.slice(0, 6).map((suggestion) => (
                <InternalLinkSuggestionBlock key={suggestion.key} suggestion={suggestion} />
              ))
            ) : (
              <p className="border border-line bg-canvas p-3 text-sm leading-6 text-muted">
                Add live collections or related live products to generate internal linking ideas.
              </p>
            )}
          </div>
        </aside>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="border border-line bg-white p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium text-action">Optimization queue</p>
              <h2 className="mt-1 text-2xl font-semibold">Ranked fixes merchants can actually execute</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
                Prioritized by issue severity, page score, and commercial category. This mirrors the useful part of paid SEO suites: a clear queue with impact, effort, and update scope.
              </p>
            </div>
            <span className="inline-flex h-9 items-center rounded border border-line px-3 text-sm font-semibold">
              {audit.optimizationTasks.length} tasks
            </span>
          </div>
          <div className="mt-5 divide-y divide-line border-y border-line">
            {audit.optimizationTasks.length ? (
              audit.optimizationTasks.slice(0, 8).map((task) => (
                <OptimizationTaskRow key={task.key} task={task} />
              ))
            ) : (
              <div className="bg-canvas p-5 text-sm leading-6 text-muted">
                No optimization tasks yet. Connect Shopify or add product drafts to build the queue.
              </div>
            )}
          </div>
        </div>

        <aside className="border border-line bg-white p-5">
          <Lightbulb className="h-5 w-5 text-action" aria-hidden />
          <h2 className="mt-4 text-lg font-semibold">Store-level playbooks</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            These are the repeatable growth motions that make the feature feel like a product, not a one-off checker.
          </p>
          <div className="mt-4 space-y-3">
            {audit.storeOpportunities.slice(0, 4).map((opportunity) => (
              <StoreOpportunityBlock key={opportunity.key} opportunity={opportunity} />
            ))}
          </div>
        </aside>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="border border-line bg-white p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium text-action">Commercial SEO engine</p>
              <h2 className="mt-1 text-2xl font-semibold">Turn monitoring into prioritized optimization tasks</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
                AceStudio now converts Search Console queries, crawler results, and AI visibility gaps into a ranked action plan that merchants can review before writing changes back to Shopify.
              </p>
            </div>
            <div className="min-w-32 border border-line bg-canvas p-3 text-center">
              <p className="text-[11px] font-semibold uppercase text-muted">Readiness</p>
              <p className="mt-1 text-2xl font-semibold">
                {latestMonitorRun?.output?.commercialReadinessScore ?? "--"}
              </p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 lg:grid-cols-2">
            {latestMonitorRun?.output?.actionPlan?.length ? (
              latestMonitorRun.output.actionPlan.map((item) => (
                <ActionPlanCard key={item.key} item={item} />
              ))
            ) : (
              <div className="border border-dashed border-line bg-canvas p-5 text-sm leading-6 text-muted lg:col-span-2">
                Run the live monitor to generate a prioritized action plan. Without Search Console credentials, the plan will focus on setup, technical SEO, and AI visibility readiness.
              </div>
            )}
          </div>
        </div>

        <aside className="border border-line bg-[#16251f] p-5 text-white">
          <Target className="h-5 w-5 text-[#98d7c3]" aria-hidden />
          <h2 className="mt-4 text-lg font-semibold">Keyword opportunities</h2>
          <p className="mt-2 text-sm leading-6 text-white/65">
            The strongest commercial signal is not just the average score. It is which query is already getting visibility and what update can convert it into clicks.
          </p>
          <div className="mt-4 space-y-3">
            {keywordOpportunityTargets.length ? (
              keywordOpportunityTargets.map(({ opportunity, product }) => (
                <KeywordOpportunityBlock
                  key={`${opportunity.opportunityType}-${opportunity.query}-${opportunity.page ?? ""}`}
                  opportunity={opportunity}
                  product={product}
                  creditCost={GROWTH_APPLY_CREDIT_COST}
                />
              ))
            ) : (
              <p className="border border-white/10 bg-white/[0.04] p-3 text-sm leading-6 text-white/65">
                Connect Search Console to unlock query-level opportunities like low CTR, zero-click, and striking-distance keywords.
              </p>
            )}
          </div>
          <div className="mt-5 border-t border-white/10 pt-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold">Competitor keyword gaps</h3>
              <span className="rounded bg-white/10 px-2 py-1 text-[10px] font-semibold uppercase text-white/70">
                {competitorGapCount || "setup"}
              </span>
            </div>
            <div className="mt-3 space-y-3">
              {latestMonitorRun?.output?.competitorKeywordGaps?.length ? (
                latestMonitorRun.output.competitorKeywordGaps.slice(0, 3).map((gap) => (
                  <CompetitorGapBlock key={`${gap.query}-${gap.page ?? ""}`} gap={gap} />
                ))
              ) : (
                <p className="border border-white/10 bg-white/[0.04] p-3 text-sm leading-6 text-white/65">
                  Add a comma-separated <span className="font-semibold">GROWTH_COMPETITOR_DOMAINS</span> env var to compare your Search Console queries against chosen competitor stores. No paid API required for this MVP layer.
                </p>
              )}
            </div>
          </div>
        </aside>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="border border-line bg-white p-5">
          <div className="flex items-start gap-3">
            <Database className="mt-1 h-5 w-5 text-action" aria-hidden />
            <div>
              <p className="text-sm font-medium text-action">Data source setup</p>
              <h2 className="mt-1 text-2xl font-semibold">Keep the MVP useful before every optional API is connected</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
                The product audit, technical crawler, and daily cron can already run on the current stack. Google APIs unlock stronger query and visibility intelligence, but they are not required for the first customer demos.
              </p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {dataSources.map((source) => (
              <DataSourceCard key={source.label} source={source} />
            ))}
          </div>
        </div>

        <aside className="border border-line bg-white p-5">
          <Clock3 className="h-5 w-5 text-action" aria-hidden />
          <h2 className="mt-4 text-lg font-semibold">No-API optimization queue</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            These fixes are generated from product content and Shopify data, so merchants can improve pages even before Search Console is connected.
          </p>
          <div className="mt-4 space-y-3">
            {noApiWins.length ? (
              noApiWins.map((win) => <NoApiWinBlock key={win.key} win={win} />)
            ) : (
              <p className="border border-line bg-canvas p-3 text-sm leading-6 text-muted">
                No urgent no-API fixes are available right now. Create or connect products to populate this queue.
              </p>
            )}
          </div>
        </aside>
      </section>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="border border-line bg-white p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium text-action">Live monitor</p>
              <h2 className="mt-1 text-2xl font-semibold">Search Console, crawler, and AI visibility tracking</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
                Run a real check for clicks, impressions, query data, sitemap health, product-page response speed, broken internal links, redirect chains, competitor gaps, and visibility across Google search results as an AI visibility proxy.
              </p>
            </div>
            <GrowthMonitorButton creditCost={GROWTH_AUDIT_CREDIT_COST} />
          </div>
          {monitorRuns.length ? (
            <div className="mt-5 grid gap-3 lg:grid-cols-3">
              {monitorRuns.map((run) => (
                <MonitorRunCard key={run.id} run={run} />
              ))}
            </div>
          ) : (
            <div className="mt-5 border border-dashed border-line bg-canvas p-5 text-sm leading-6 text-muted">
              No live monitor run yet. Run it once after adding the Growth monitoring Supabase migration and the optional Google credentials.
            </div>
          )}
        </div>

        <aside className="border border-line bg-[#f7faf8] p-5">
          <Activity className="h-5 w-5 text-action" aria-hidden />
          <h2 className="mt-4 text-lg font-semibold">What this unlocks</h2>
          <div className="mt-4 space-y-3 text-sm leading-6 text-muted">
            <p>Search Console: find high-impression queries with weak CTR and rewrite titles around them.</p>
            <p>Technical crawler: catch 404s, redirect chains, sitemap gaps, and canonical host issues.</p>
            <p>Page speed: flag slow Shopify pages now, then connect PageSpeed Insights later only if you need full Core Web Vitals field data.</p>
            <p>Competitor gaps: use your own competitor list plus Search Console queries before paying for keyword databases.</p>
            <p>AI visibility: track whether brand and product queries surface your pages in answer-engine-style search results.</p>
          </div>
        </aside>
      </section>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div>
          <div className="mb-3 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm text-muted">Product scores</p>
              <h2 className="text-xl font-semibold">Lowest scoring products first</h2>
            </div>
            <Link href="/products" className="text-sm font-semibold text-action">
              Open products
            </Link>
          </div>
          {audit.products.length ? (
            <div className="border-y border-line">
              {audit.products.slice(0, 12).map((product) => (
                <ProductAuditRow
                  key={`${product.product.source}-${product.product.id}`}
                  product={product}
                  applyCreditCost={GROWTH_APPLY_CREDIT_COST}
                />
              ))}
            </div>
          ) : (
            <div className="border border-line bg-white p-8 text-sm text-muted">
              No live Online Store products are available for audit yet. Growth Studio ignores draft, archived, hidden, and unlisted Shopify products because those pages cannot rank until they are actively published to Online Store.
            </div>
          )}
        </div>

        <aside>
          <div className="border border-line bg-white p-5">
            <div className="flex items-center gap-2">
              <CircleAlert className="h-5 w-5 text-action" aria-hidden />
              <h2 className="text-lg font-semibold">Top recommendations</h2>
            </div>
            <div className="mt-4 space-y-3">
              {topIssues.length ? (
                topIssues.map((issue) => (
                  <IssueBlock key={`${issue.productId}-${issue.key}`} issue={issue} productTitle={issue.productTitle} />
                ))
              ) : topCollectionIssues.length ? (
                topCollectionIssues.map((issue) => (
                  <IssueBlock key={`${issue.collectionId}-${issue.key}`} issue={issue} productTitle={`${issue.collectionTitle} collection`} />
                ))
              ) : (
                <p className="text-sm leading-6 text-muted">
                  Products look strong enough for the first MVP audit. Keep monitoring after new products are added.
                </p>
              )}
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border border-line bg-canvas p-3 text-center">
      <p className="text-[11px] font-semibold uppercase text-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function WorkflowStep({
  icon: Icon,
  title,
  detail,
  metricLabel,
  metricValue
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  detail: string;
  metricLabel?: string;
  metricValue?: string | number;
}) {
  return (
    <article className="border border-line bg-canvas p-4">
      <Icon className="h-5 w-5 text-action" aria-hidden />
      <h3 className="mt-4 text-sm font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted">{detail}</p>
      {metricLabel ? (
        <div className="mt-4 border border-line bg-white p-3">
          <p className="text-[10px] font-semibold uppercase text-muted">{metricLabel}</p>
          <p className="mt-1 text-xl font-semibold">{metricValue}</p>
        </div>
      ) : null}
    </article>
  );
}

function WriteBackCapability({
  icon: Icon,
  title,
  detail
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  detail: string;
}) {
  return (
    <article className="border border-line bg-canvas p-4">
      <Icon className="h-5 w-5 text-action" aria-hidden />
      <h3 className="mt-4 text-sm font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted">{detail}</p>
    </article>
  );
}

function WriteBackCandidateCard({
  product,
  creditCost
}: {
  product: GrowthProductScore;
  creditCost: number;
}) {
  const primaryIssue = product.issues[0];

  return (
    <article className="border border-line bg-canvas p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold leading-5">{product.product.title}</h3>
          <p className="mt-1 text-xs leading-5 text-muted">
            {primaryIssue?.label ?? "SEO/GEO improvements available"}
          </p>
        </div>
        <span className={`rounded border px-2 py-1 text-xs font-semibold ${scoreTone(product.overallScore)}`}>
          {product.overallScore}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {["SEO title", "Meta", "Tags", "Q&A"].map((field) => (
          <span key={field} className="rounded bg-white px-2 py-0.5 text-[11px] font-semibold text-muted">
            {field}
          </span>
        ))}
      </div>
      <div className="mt-3">
        <GrowthApplyButton productId={product.product.id} creditCost={creditCost} />
      </div>
    </article>
  );
}

function OptimizationTaskRow({ task }: { task: GrowthOptimizationTask }) {
  const writeBack = task.canWriteBack && task.writeBackScope.length;
  const categoryIcon = {
    content: FilePenLine,
    schema: Layers3,
    image: ImageIcon,
    technical: Gauge,
    "search-console": SearchCheck,
    "ai-visibility": Sparkles
  } satisfies Record<GrowthOptimizationTask["category"], ComponentType<{ className?: string }>>;
  const Icon = categoryIcon[task.category];

  return (
    <article className="grid gap-4 bg-white p-4 lg:grid-cols-[minmax(0,1fr)_240px]">
      <div className="flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-canvas">
          <Icon className="h-5 w-5 text-action" aria-hidden />
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold">{task.title}</h3>
            <span className={`rounded border px-2 py-1 text-[11px] font-semibold uppercase ${priorityTone(task.priority)}`}>
              {task.priority}
            </span>
            <span className="rounded border border-line px-2 py-1 text-[11px] font-semibold uppercase text-muted">
              {task.effort} effort
            </span>
          </div>
          {task.productTitle ? (
            <p className="mt-1 text-xs font-semibold text-muted">{task.productTitle}</p>
          ) : null}
          <p className="mt-2 text-sm leading-6 text-muted">{task.whyItMatters}</p>
          <p className="mt-2 text-sm font-semibold">{task.recommendedAction}</p>
          <p className="mt-1 text-xs leading-5 text-muted">{task.expectedImpact}</p>
        </div>
      </div>
      <div className="space-y-3">
        <div className="border border-line bg-canvas p-3">
          <p className="text-[11px] font-semibold uppercase text-muted">Priority score</p>
          <p className="mt-1 text-2xl font-semibold">{task.priorityScore}</p>
        </div>
        {writeBack ? (
          <div className="border border-emerald-200 bg-emerald-50 p-3 text-emerald-900">
            <p className="text-[11px] font-semibold uppercase">Confirm-to-apply scope</p>
            <p className="mt-1 text-sm font-semibold">{task.writeBackScope.join(", ")}</p>
          </div>
        ) : (
          <div className="border border-line bg-canvas p-3 text-muted">
            <p className="text-[11px] font-semibold uppercase">Manual or monitor-only</p>
            <p className="mt-1 text-sm">Review before changing Shopify theme, schema, or crawl settings.</p>
          </div>
        )}
        {task.targetUrl ? (
          <Link href={task.targetUrl} target="_blank" className="inline-flex text-xs font-semibold text-action">
            Open target
          </Link>
        ) : null}
      </div>
    </article>
  );
}

function StoreOpportunityBlock({ opportunity }: { opportunity: GrowthStoreOpportunity }) {
  const statusClass =
    opportunity.status === "ready"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : opportunity.status === "partial"
        ? "border-amber-200 bg-amber-50 text-amber-900"
        : "border-red-200 bg-red-50 text-red-700";

  return (
    <article className="border border-line bg-canvas p-3">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold leading-5">{opportunity.title}</h3>
        <span className={`rounded border px-2 py-1 text-[10px] font-semibold uppercase ${statusClass}`}>
          {opportunity.impact.replaceAll("-", " ")}
        </span>
      </div>
      <p className="mt-2 text-sm leading-6 text-muted">{opportunity.detail}</p>
      <div className="mt-3 border border-line bg-white p-3">
        <p className="text-[11px] font-semibold uppercase text-muted">Commercial benchmark</p>
        <p className="mt-1 text-xs leading-5 text-muted">{opportunity.benchmark}</p>
      </div>
      <p className="mt-3 text-sm font-semibold">{opportunity.recommendedAction}</p>
    </article>
  );
}

function SkillCoverageBlock({
  item
}: {
  item: {
    title: string;
    score: number;
    status: "ready" | "partial" | "setup";
    detail: string;
    skills: readonly string[];
  };
}) {
  const statusClass =
    item.status === "ready"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : item.status === "partial"
        ? "border-amber-200 bg-amber-50 text-amber-900"
        : "border-line bg-canvas text-muted";

  return (
    <article className="grid gap-4 border border-line bg-canvas p-4 sm:grid-cols-[120px_minmax(0,1fr)]">
      <div className={`border p-3 text-center ${scoreTone(item.score)}`}>
        <p className="text-[10px] font-semibold uppercase">Score</p>
        <p className="mt-1 text-3xl font-semibold">{item.score || "--"}</p>
      </div>
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-semibold">{item.title}</h3>
          <span className={`rounded border px-2 py-1 text-[11px] font-semibold uppercase ${statusClass}`}>
            {item.status}
          </span>
        </div>
        <p className="mt-2 text-sm leading-6 text-muted">{item.detail}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {item.skills.map((skill) => (
            <span key={skill} className="rounded border border-line bg-white px-2 py-1 text-xs font-medium text-muted">
              {skill}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  tone
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  tone: "dark" | "light";
}) {
  const dark = tone === "dark";
  return (
    <div className={`p-4 ${dark ? "bg-[#16251f] text-white" : "bg-white text-ink"}`}>
      <Icon className={`h-4 w-4 ${dark ? "text-[#98d7c3]" : "text-action"}`} aria-hidden />
      <p className={`mt-3 text-xs ${dark ? "text-white/60" : "text-muted"}`}>{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function scoreTone(score: number) {
  if (score >= 80) return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (score >= 60) return "border-amber-200 bg-amber-50 text-amber-900";
  return "border-red-200 bg-red-50 text-red-700";
}

function normalizeOpportunityUrl(value?: string | null) {
  if (!value) return "";
  try {
    const url = new URL(value);
    return `${url.hostname.replace(/^www\./, "")}${url.pathname.replace(/\/$/, "")}`.toLowerCase();
  } catch {
    return value.toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "");
  }
}

function findProductForOpportunity(page: string | undefined, products: GrowthProductScore[]) {
  const pageKey = normalizeOpportunityUrl(page);
  if (!pageKey) return undefined;

  return products.find((entry) => {
    const product = entry.product;
    const productKey = normalizeOpportunityUrl(product.onlineStoreUrl);
    if (productKey && productKey === pageKey) return true;
    return Boolean(product.handle && pageKey.endsWith(`/products/${product.handle.toLowerCase()}`));
  });
}

function ProductAuditRow({
  product,
  applyCreditCost
}: {
  product: GrowthProductScore;
  applyCreditCost: number;
}) {
  const title = product.product.title;
  const primaryIssue = product.issues[0];
  const href = product.product.source === "workspace" ? `/products/${product.product.id}` : product.product.adminUrl;
  const canApplyToShopify = product.product.source === "shopify" && product.product.id.startsWith("gid://shopify/Product/");

  return (
    <article className="grid gap-4 border-b border-line bg-white p-4 last:border-b-0 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-semibold">{title}</h3>
          <span className="rounded border border-line px-2 py-0.5 text-xs text-muted">
            {product.product.source === "shopify" ? "Shopify" : "Workspace"}
          </span>
        </div>
        <p className="mt-2 text-sm leading-6 text-muted">
          {primaryIssue
            ? primaryIssue.detail
            : product.strengths[0] || "This product has enough SEO/GEO context for the first MVP audit."}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {product.issues.slice(0, 3).map((issue) => (
            <span key={issue.key} className="rounded border border-line px-2 py-1 text-xs text-muted">
              {issue.label}
            </span>
          ))}
        </div>
        {product.issues.length ? (
          <div className="mt-4 border border-line bg-canvas p-3">
            <p className="text-xs font-semibold uppercase text-muted">Write-back draft</p>
            <p className="mt-2 text-sm font-semibold">{product.suggestedFix.seoTitle}</p>
            <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted">{product.suggestedFix.seoDescription}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {product.suggestedFix.tags.slice(0, 5).map((tag) => (
                <span key={tag} className="rounded bg-white px-2 py-0.5 text-[11px] font-medium text-muted">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ) : null}
        <div className="mt-4 border border-line bg-white p-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase text-muted">
            <Eye className="h-3.5 w-3.5" aria-hidden />
            <span>SERP preview</span>
            <span className="rounded bg-canvas px-2 py-0.5">{product.intentStage}</span>
          </div>
          <p className="mt-2 text-sm font-semibold text-[#1a0dab]">{product.snippetPreview.title}</p>
          <p className="mt-1 text-xs text-[#006621]">{product.snippetPreview.urlPath}</p>
          <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted">{product.snippetPreview.description}</p>
          {product.snippetPreview.warnings.length ? (
            <p className="mt-2 text-xs font-semibold text-amber-700">{product.snippetPreview.warnings[0]}</p>
          ) : null}
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="border border-line bg-canvas p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase text-muted">AI answer readiness</p>
              <span className={`rounded border px-2 py-0.5 text-[11px] font-semibold ${scoreTone(product.aiAnswerReadiness.score)}`}>
                {product.aiAnswerReadiness.score}/100
              </span>
            </div>
            <ul className="mt-3 space-y-2 text-xs leading-5 text-muted">
              {product.aiAnswerReadiness.factors.slice(0, 4).map((factor) => (
                <li key={factor.key} className="flex gap-2">
                  {factor.passed ? (
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-action" aria-hidden />
                  ) : (
                    <CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-700" aria-hidden />
                  )}
                  <span>
                    <span className="font-semibold text-ink">{factor.label}: </span>
                    {factor.passed ? factor.detail : factor.recommendedAction}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="border border-line bg-canvas p-3">
            <p className="text-xs font-semibold uppercase text-muted">Schema writer</p>
            <ul className="mt-3 space-y-2 text-xs leading-5 text-muted">
              {product.schemaSuggestions.slice(0, 4).map((schema) => (
                <li key={schema.type} className="flex items-start justify-between gap-3 border-b border-line/70 pb-2 last:border-b-0 last:pb-0">
                  <span>
                    <span className="font-semibold text-ink">{schema.type}</span>
                    <span className="block">{schema.missing.length ? `Missing: ${schema.missing.join(", ")}` : schema.note}</span>
                  </span>
                  <span className={`rounded border px-2 py-0.5 text-[10px] font-semibold uppercase ${
                    schema.status === "ready"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : schema.status === "partial"
                        ? "border-amber-200 bg-amber-50 text-amber-900"
                        : "border-red-200 bg-red-50 text-red-700"
                  }`}>
                    {schema.status}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
          <ScorePill label="SEO" score={product.seoScore} />
          <ScorePill label="GEO" score={product.geoScore} />
          <ScorePill label="Tech" score={product.technicalSeoScore} />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <MiniScore label="Schema" score={product.schemaScore} />
          <MiniScore label="Image" score={product.imageSeoScore} />
          <MiniScore label="AI" score={product.aiVisibilityScore} />
        </div>
        {canApplyToShopify && product.issues.length ? (
          <GrowthApplyButton productId={product.product.id} creditCost={applyCreditCost} />
        ) : null}
        {href ? (
          <Link
            href={href}
            target={product.product.source === "shopify" ? "_blank" : undefined}
            className="studio-focus inline-flex h-10 w-full items-center justify-center gap-2 rounded border border-line bg-white px-3 text-sm font-semibold hover:bg-canvas"
          >
            {product.product.source === "shopify" ? "Open in Shopify" : "Open draft"}
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </Link>
        ) : null}
      </div>
    </article>
  );
}

function CollectionAuditRow({ collection }: { collection: GrowthCollectionScore }) {
  const primaryIssue = collection.issues[0];

  return (
    <article className="grid gap-4 bg-white p-4 lg:grid-cols-[minmax(0,1fr)_220px]">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-semibold">{collection.collection.title}</h3>
          <span className="rounded border border-line px-2 py-0.5 text-xs text-muted">Collection</span>
        </div>
        <p className="mt-2 text-sm leading-6 text-muted">
          {primaryIssue
            ? primaryIssue.detail
            : "This collection has enough category-level SEO context for the current audit."}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {collection.issues.slice(0, 3).map((issue) => (
            <span key={issue.key} className="rounded border border-line px-2 py-1 text-xs text-muted">
              {issue.label}
            </span>
          ))}
        </div>
        <div className="mt-4 border border-line bg-canvas p-3">
          <p className="text-xs font-semibold uppercase text-muted">Collection SERP preview</p>
          <p className="mt-2 text-sm font-semibold text-[#1a0dab]">{collection.snippetPreview.title}</p>
          <p className="mt-1 text-xs text-[#006621]">{collection.snippetPreview.urlPath}</p>
          <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted">{collection.snippetPreview.description}</p>
          {collection.snippetPreview.warnings.length ? (
            <p className="mt-2 text-xs font-semibold text-amber-700">{collection.snippetPreview.warnings[0]}</p>
          ) : null}
        </div>
      </div>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <ScorePill label="SEO" score={collection.seoScore} />
          <ScorePill label="GEO" score={collection.geoScore} />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <MiniScore label="Schema" score={collection.schemaScore} />
          <MiniScore label="Image" score={collection.imageSeoScore} />
          <MiniScore label="Tech" score={collection.technicalSeoScore} />
        </div>
        {collection.collection.onlineStoreUrl ? (
          <Link
            href={collection.collection.onlineStoreUrl}
            target="_blank"
            className="studio-focus inline-flex h-10 w-full items-center justify-center gap-2 rounded border border-line bg-white px-3 text-sm font-semibold hover:bg-canvas"
          >
            Open collection
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </Link>
        ) : null}
      </div>
    </article>
  );
}

function InternalLinkSuggestionBlock({ suggestion }: { suggestion: GrowthInternalLinkSuggestion }) {
  return (
    <article className="border border-line bg-canvas p-3">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold leading-5">{suggestion.anchorText}</h3>
        <span className={`rounded border px-2 py-1 text-[10px] font-semibold uppercase ${priorityTone(suggestion.priority)}`}>
          {suggestion.priority}
        </span>
      </div>
      <p className="mt-2 text-xs font-semibold uppercase text-muted">{suggestion.linkType.replaceAll("_", " ")}</p>
      <p className="mt-2 text-sm leading-6 text-muted">
        Link <span className="font-semibold text-ink">{suggestion.sourceTitle}</span> to{" "}
        <span className="font-semibold text-ink">{suggestion.targetTitle}</span>.
      </p>
      <p className="mt-2 text-sm leading-6 text-muted">{suggestion.reason}</p>
      {suggestion.targetUrl ? (
        <Link href={suggestion.targetUrl} target="_blank" className="mt-3 inline-flex text-xs font-semibold text-action">
          Open target
        </Link>
      ) : null}
    </article>
  );
}

function MonitorRunCard({ run }: { run: GrowthMonitorRun }) {
  const output = run.output;
  const searchConsole = output?.searchConsole;
  const technicalSeo = output?.technicalSeo;
  const aiVisibility = output?.aiVisibility;
  const pageSpeed = technicalSeo?.pageSpeed;
  const date = new Date(run.createdAt).toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC"
  });

  return (
    <article className="border border-line bg-canvas p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-muted">{run.status}</p>
          <h3 className="mt-1 text-sm font-semibold">{date} UTC</h3>
        </div>
        <span className="rounded border border-line bg-white px-2 py-1 text-xs font-semibold">
          {run.runType}
        </span>
      </div>
      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Clicks / impressions</dt>
          <dd className="font-semibold">
            {searchConsole ? `${searchConsole.clicks ?? 0} / ${searchConsole.impressions ?? 0}` : "--"}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Broken links</dt>
          <dd className="font-semibold">{technicalSeo?.brokenLinks?.length ?? "--"}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Sitemap URLs</dt>
          <dd className="font-semibold">{technicalSeo?.sitemapUrls?.length ?? "--"}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Avg response</dt>
          <dd className="font-semibold">{pageSpeed?.averageResponseMs ? `${pageSpeed.averageResponseMs}ms` : "--"}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">PageSpeed URLs</dt>
          <dd className="font-semibold">{pageSpeed?.coreWebVitals?.length ?? 0}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Competitor gaps</dt>
          <dd className="font-semibold">{output?.competitorKeywordGaps?.length ?? "--"}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">AI visibility</dt>
          <dd className="font-semibold">{aiVisibility?.configured ? `${aiVisibility.score ?? 0}%` : "setup"}</dd>
        </div>
      </dl>
      {output?.recommendations?.length ? (
        <p className="mt-4 line-clamp-3 text-xs leading-5 text-muted">{output.recommendations[0]}</p>
      ) : run.error ? (
        <p className="mt-4 line-clamp-3 text-xs leading-5 text-red-700">{run.error}</p>
      ) : null}
      {pageSpeed?.coreWebVitals?.[0] ? (
        <div className="mt-4 border border-line bg-white p-3 text-xs leading-5 text-muted">
          <p className="font-semibold text-ink">
            PSI mobile score: {pageSpeed.coreWebVitals[0].performanceScore ?? "--"}/100
          </p>
          <p className="mt-1">
            LCP {pageSpeed.coreWebVitals[0].largestContentfulPaintMs ? `${pageSpeed.coreWebVitals[0].largestContentfulPaintMs}ms` : "--"} ·
            CLS {pageSpeed.coreWebVitals[0].cumulativeLayoutShift ?? "--"}
          </p>
        </div>
      ) : null}
    </article>
  );
}

function priorityTone(priority?: string) {
  if (priority === "high") return "border-red-200 bg-red-50 text-red-700";
  if (priority === "medium") return "border-amber-200 bg-amber-50 text-amber-900";
  return "border-emerald-200 bg-emerald-50 text-emerald-800";
}

function ActionPlanCard({
  item
}: {
  item: NonNullable<NonNullable<GrowthMonitorRun["output"]>["actionPlan"]>[number];
}) {
  return (
    <article className="border border-line bg-canvas p-4">
      <div className="flex items-start justify-between gap-3">
        <ListChecks className="mt-0.5 h-5 w-5 shrink-0 text-action" aria-hidden />
        <span className={`rounded border px-2 py-1 text-[11px] font-semibold uppercase ${priorityTone(item.priority)}`}>
          {item.priority}
        </span>
      </div>
      <h3 className="mt-3 text-sm font-semibold">{item.title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted">{item.detail}</p>
      <div className="mt-3 border border-line bg-white p-3">
        <p className="text-[11px] font-semibold uppercase text-muted">Recommended action</p>
        <p className="mt-1 text-sm font-semibold">{item.actionType.replaceAll("_", " ")}</p>
        <p className="mt-1 text-xs leading-5 text-muted">{item.estimatedImpact}</p>
      </div>
      {item.rewrite ? (
        <div className="mt-3 border border-line bg-white p-3">
          <p className="text-[11px] font-semibold uppercase text-muted">Search Console rewrite draft</p>
          <p className="mt-2 text-sm font-semibold">{item.rewrite.seoTitle}</p>
          <p className="mt-1 text-xs leading-5 text-muted">{item.rewrite.seoDescription}</p>
          <p className="mt-2 text-xs font-semibold text-action">{item.rewrite.faqQuestion}</p>
        </div>
      ) : null}
      {item.playbook?.length ? (
        <ul className="mt-3 space-y-1.5 text-xs leading-5 text-muted">
          {item.playbook.slice(0, 3).map((step) => (
            <li key={step} className="flex gap-2">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-action" aria-hidden />
              <span>{step}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {item.targetUrl ? (
        <Link
          href={item.targetUrl}
          target="_blank"
          className="mt-3 inline-flex text-xs font-semibold text-action"
        >
          Open target page
        </Link>
      ) : null}
    </article>
  );
}

function KeywordOpportunityBlock({
  opportunity,
  product,
  creditCost
}: {
  opportunity: NonNullable<NonNullable<GrowthMonitorRun["output"]>["keywordOpportunities"]>[number];
  product?: GrowthProductScore;
  creditCost: number;
}) {
  const canWriteBack = Boolean(product?.product.source === "shopify" && product.product.id.startsWith("gid://shopify/Product/"));

  return (
    <div className="border border-white/10 bg-white/[0.04] p-3">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold leading-5">{opportunity.query}</p>
        <span className="rounded bg-white/10 px-2 py-1 text-[10px] font-semibold uppercase text-white/70">
          {opportunity.opportunityType.replaceAll("_", " ")}
        </span>
      </div>
      <p className="mt-2 text-xs leading-5 text-white/60">
        {opportunity.reason} <span className="font-semibold text-white/75">{opportunity.pageType}</span>
      </p>
      <div className="mt-3 grid grid-cols-3 gap-px overflow-hidden border border-white/10 bg-white/10 text-center text-xs">
        <div className="bg-[#16251f] p-2">
          <p className="text-white/45">Impr.</p>
          <p className="mt-1 font-semibold">{opportunity.impressions}</p>
        </div>
        <div className="bg-[#16251f] p-2">
          <p className="text-white/45">CTR</p>
          <p className="mt-1 font-semibold">{(opportunity.ctr * 100).toFixed(1)}%</p>
        </div>
        <div className="bg-[#16251f] p-2">
          <p className="text-white/45">Pos.</p>
          <p className="mt-1 font-semibold">{opportunity.position || "--"}</p>
        </div>
      </div>
      <div className="mt-3 border border-white/10 bg-black/10 p-3">
        <p className="text-[10px] font-semibold uppercase text-white/45">Rewrite draft</p>
        <p className="mt-1 text-xs font-semibold leading-5 text-white/85">{opportunity.rewrite.seoTitle}</p>
        <p className="mt-1 text-xs leading-5 text-white/60">{opportunity.rewrite.seoDescription}</p>
      </div>
      {canWriteBack && product ? (
        <SearchConsoleRewriteApplyButton
          productId={product.product.id}
          rewrite={opportunity.rewrite}
          creditCost={creditCost}
        />
      ) : (
        <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-xs leading-5 text-white/55">
          Write-back is available when this query is matched to a live Shopify product page.
        </p>
      )}
    </div>
  );
}

function CompetitorGapBlock({
  gap
}: {
  gap: NonNullable<NonNullable<GrowthMonitorRun["output"]>["competitorKeywordGaps"]>[number];
}) {
  return (
    <div className="border border-white/10 bg-white/[0.04] p-3">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold leading-5">{gap.query}</p>
        <span className={`rounded border px-2 py-1 text-[10px] font-semibold uppercase ${priorityTone(gap.priority)}`}>
          {gap.priority}
        </span>
      </div>
      <p className="mt-2 text-xs leading-5 text-white/60">{gap.reason}</p>
      <p className="mt-2 text-xs leading-5 text-white/60">
        Compare: {gap.competitorDomains.slice(0, 3).join(", ")}
      </p>
      <p className="mt-3 text-xs font-semibold leading-5 text-white/80">{gap.recommendedAction}</p>
    </div>
  );
}

function DataSourceCard({
  source
}: {
  source: {
    label: string;
    status: "ready" | "setup";
    cost: string;
    detail: string;
    action: string;
  };
}) {
  const ready = source.status === "ready";
  return (
    <article className="border border-line bg-canvas p-4">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold">{source.label}</h3>
        <span className={`rounded border px-2 py-1 text-[11px] font-semibold uppercase ${
          ready ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-amber-200 bg-amber-50 text-amber-900"
        }`}>
          {ready ? "Ready" : "Setup"}
        </span>
      </div>
      <p className="mt-2 text-xs font-semibold uppercase text-muted">{source.cost}</p>
      <p className="mt-2 text-sm leading-6 text-muted">{source.detail}</p>
      <p className="mt-3 text-xs font-semibold text-action">{source.action}</p>
    </article>
  );
}

function NoApiWinBlock({
  win
}: {
  win: {
    productTitle: string;
    label: string;
    detail: string;
    severity: "high" | "medium" | "low";
  };
}) {
  return (
    <div className="border border-line bg-canvas p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-muted">{win.productTitle}</p>
          <h3 className="mt-1 text-sm font-semibold">{win.label}</h3>
        </div>
        <span className={`rounded border px-2 py-1 text-[10px] font-semibold uppercase ${priorityTone(win.severity)}`}>
          {win.severity}
        </span>
      </div>
      <p className="mt-2 text-sm leading-6 text-muted">{win.detail}</p>
    </div>
  );
}

function ScorePill({ label, score }: { label: string; score: number }) {
  return (
    <div className={`border p-2 text-center ${scoreTone(score)}`}>
      <p className="text-[11px] font-semibold uppercase">{label}</p>
      <p className="mt-1 text-lg font-semibold">{score}</p>
    </div>
  );
}

function MiniScore({ label, score }: { label: string; score: number }) {
  return (
    <div className="rounded border border-line bg-canvas p-2 text-center">
      <p className="text-[10px] font-semibold uppercase text-muted">{label}</p>
      <p className="mt-1 text-sm font-semibold">{score}</p>
    </div>
  );
}

function IssueBlock({
  issue,
  productTitle
}: {
  issue: GrowthAuditIssue;
  productTitle: string;
}) {
  const severityClass =
    issue.severity === "high"
      ? "text-red-700"
      : issue.severity === "medium"
        ? "text-amber-700"
        : "text-muted";

  return (
    <div className="border border-line bg-canvas p-3">
      <div className="flex items-start gap-2">
        {issue.severity === "high" ? (
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-600" aria-hidden />
        ) : (
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-action" aria-hidden />
        )}
        <div>
          <p className="text-xs font-semibold text-muted">{productTitle}</p>
          <h3 className="mt-1 text-sm font-semibold">{issue.label}</h3>
          <p className={`mt-1 text-xs font-semibold uppercase ${severityClass}`}>{issue.severity}</p>
          <p className="mt-2 text-sm leading-6 text-muted">{issue.suggestedFix}</p>
        </div>
      </div>
    </div>
  );
}
