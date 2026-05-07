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
import { requireCurrentUser } from "@/lib/auth";
import { GROWTH_APPLY_CREDIT_COST, GROWTH_AUDIT_CREDIT_COST, TRIAL_CREDITS } from "@/lib/credits";
import {
  getGrowthAudit,
  type GrowthAuditCapability,
  type GrowthAuditIssue,
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
  const productsNeedingWork = audit.products.filter((product) => product.overallScore < 80).length;
  const latestMonitorRun = monitorRuns[0];
  const writeBackReadyTasks = audit.optimizationTasks.filter((task) => task.canWriteBack).length;
  const highImpactTasks = audit.optimizationTasks.filter((task) => task.priority === "high").length;
  const commercialLoop = [
    {
      title: "Find ranking blockers",
      detail: "Audit product content, media, schema readiness, canonical health, and Search Console signals.",
      icon: SearchCheck
    },
    {
      title: "Generate fixes",
      detail: "Create merchant-reviewable SEO titles, meta descriptions, tags, FAQs, comparison copy, and image guidance.",
      icon: FilePenLine
    },
    {
      title: "Confirm write-back",
      detail: "Apply only selected Shopify changes after the user approves the exact update scope.",
      icon: ShieldCheck
    },
    {
      title: "Measure next move",
      detail: "Re-run monitoring to decide whether to improve CTR, rich snippets, AI visibility, or technical crawl health.",
      icon: LineChart
    }
  ];
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
    .slice(0, 5);

  return (
    <div className="space-y-7">
      <section className="overflow-hidden border border-line bg-[#16251f] text-white shadow-soft">
        <div className="grid gap-0 xl:grid-cols-[minmax(0,1fr)_440px]">
          <div className="p-5 sm:p-7">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase text-white/60">
              <span>Growth Studio</span>
              <span className="h-1 w-1 rounded-full bg-white/30" aria-hidden />
              <span>{shopifyConnected ? "Live Online Store products only" : "Connect Shopify for live audit"}</span>
            </div>
            <h1 className="mt-4 max-w-3xl text-3xl font-semibold leading-tight sm:text-4xl">
              Score Shopify products for SEO and GEO before you approve updates.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">
              Read products from the connected Shopify store, find weak titles, thin descriptions, missing image context, and AI-answer gaps, then write selected fixes only after user confirmation.
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
              <p className="text-sm font-medium text-action">Commercial ranking workflow</p>
              <h2 className="mt-1 text-2xl font-semibold">A Shopify SEO/GEO work queue, not just a score.</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
                Mature SEO products win because they turn audits into prioritized actions. AceStudio now ranks what to fix, explains why it matters, shows expected impact, and marks which changes can be written back to Shopify after confirmation.
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
            {commercialLoop.map((step) => (
              <WorkflowStep key={step.title} title={step.title} detail={step.detail} icon={step.icon} />
            ))}
          </div>
        </div>

        <aside className="border border-line bg-[#16251f] p-5 text-white">
          <Zap className="h-5 w-5 text-[#98d7c3]" aria-hidden />
          <h2 className="mt-4 text-lg font-semibold">What makes it commercially useful</h2>
          <div className="mt-4 space-y-3 text-sm leading-6 text-white/65">
            <p>It separates monitoring from action, so merchants know what update should happen next.</p>
            <p>It keeps Shopify write-back review-first, which is safer for real stores than silent automation.</p>
            <p>It combines SEO, GEO, image SEO, schema readiness, and technical crawl health in one product loop.</p>
            <p>Credit usage is explicit: live monitoring costs {GROWTH_AUDIT_CREDIT_COST} credit and confirmed Shopify write-back costs {GROWTH_APPLY_CREDIT_COST} credits. The {TRIAL_CREDITS}-credit trial balance covers at least one simple optimization.</p>
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

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="border border-line bg-white p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium text-action">Store health</p>
              <h2 className="mt-1 text-2xl font-semibold">SEO/GEO audit summary</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                This MVP scores products, creates fix recommendations, and keeps Shopify write-back behind a per-product confirmation step.
              </p>
            </div>
            <span className="inline-flex h-9 items-center rounded border border-line px-3 text-sm font-semibold">
              {productsNeedingWork} need work
            </span>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <SummaryTile
              icon={Gauge}
              title="Score first"
              detail="Find which products need attention before spending credits on rewriting."
            />
            <SummaryTile
              icon={SearchCheck}
              title="SEO checks"
              detail="Title length, meta description, product depth, tags, and image alt context."
            />
            <SummaryTile
              icon={Sparkles}
              title="GEO checks"
              detail="Buyer Q&A, use cases, concrete facts, comparison context, and trust signals."
            />
          </div>
        </div>

        <aside className="space-y-4">
          <div className="border border-line bg-white p-5">
            <LineChart className="h-5 w-5 text-action" aria-hidden />
            <h2 className="mt-4 text-lg font-semibold">MVP workflow</h2>
            <ol className="mt-4 space-y-3 text-sm leading-6 text-muted">
              <li>1. Connect Shopify and read products.</li>
              <li>2. Score SEO/GEO quality.</li>
              <li>3. Review issues and suggested fixes.</li>
              <li>4. Confirm selected fixes before writing them to Shopify.</li>
            </ol>
          </div>
          <div className="border border-line bg-white p-5">
            <SearchCheck className="h-5 w-5 text-action" aria-hidden />
            <h2 className="mt-4 text-lg font-semibold">Optimization signals</h2>
            <div className="mt-4 space-y-3 text-sm leading-6 text-muted">
              <p>Search: title, meta description, tags, and content depth.</p>
              <p>GEO: buyer Q&A, use cases, facts, comparisons, and trust context.</p>
              <p>Media: image count, alt text readiness, and product image context.</p>
            </div>
          </div>
          <div className="border border-line bg-[#eef4ef] p-5">
            <ShieldCheck className="h-5 w-5 text-action" aria-hidden />
            <h2 className="mt-4 text-lg font-semibold">Safe by default</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Growth Studio audits first. SEO title, meta description, tags, and appended buyer Q&A are written to Shopify only after the user clicks confirm.
            </p>
          </div>
        </aside>
      </section>

      <section className="border border-line bg-white p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-action">Technical SEO and AI visibility</p>
            <h2 className="mt-1 text-2xl font-semibold">Make product pages crawlable, rich-result ready, and AI-answer ready.</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
              This layer expands Growth Studio beyond copy checks: schema readiness, image SEO depth, broken-link and sitemap health, Google Search Console signals, and AI visibility tracking.
            </p>
          </div>
          <span className="inline-flex h-9 items-center rounded border border-line px-3 text-sm font-semibold">
            {audit.productCount} products
          </span>
        </div>
        <div className="mt-5 grid gap-3 lg:grid-cols-5">
          {audit.capabilities.map((capability) => (
            <CapabilityCard key={capability.key} capability={capability} />
          ))}
        </div>
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
            {latestMonitorRun?.output?.keywordOpportunities?.length ? (
              latestMonitorRun.output.keywordOpportunities.slice(0, 4).map((opportunity) => (
                <KeywordOpportunityBlock
                  key={`${opportunity.opportunityType}-${opportunity.query}-${opportunity.page ?? ""}`}
                  opportunity={opportunity}
                />
              ))
            ) : (
              <p className="border border-white/10 bg-white/[0.04] p-3 text-sm leading-6 text-white/65">
                Connect Search Console to unlock query-level opportunities like low CTR, zero-click, and striking-distance keywords.
              </p>
            )}
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
                Run a real check for clicks, impressions, query data, sitemap health, broken internal links, redirect chains, and visibility across Google search results as an AI visibility proxy.
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

function SummaryTile({
  icon: Icon,
  title,
  detail
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  detail: string;
}) {
  return (
    <div className="border border-line bg-canvas p-4">
      <Icon className="h-5 w-5 text-action" aria-hidden />
      <h3 className="mt-3 text-sm font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted">{detail}</p>
    </div>
  );
}

function scoreTone(score: number) {
  if (score >= 80) return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (score >= 60) return "border-amber-200 bg-amber-50 text-amber-900";
  return "border-red-200 bg-red-50 text-red-700";
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
    <article className="grid gap-4 border-b border-line bg-white p-4 last:border-b-0 lg:grid-cols-[minmax(0,1fr)_260px]">
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
            <p className="text-xs font-semibold uppercase text-muted">Suggested update</p>
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

function CapabilityCard({ capability }: { capability: GrowthAuditCapability }) {
  const statusClass =
    capability.status === "ready"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : capability.status === "partial"
        ? "border-amber-200 bg-amber-50 text-amber-900"
        : "border-red-200 bg-red-50 text-red-700";

  return (
    <article className="flex min-h-72 flex-col border border-line bg-canvas p-4">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold leading-5">{capability.title}</h3>
        <span className={`rounded border px-2 py-1 text-xs font-semibold ${statusClass}`}>
          {capability.score}
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-muted">{capability.description}</p>
      <ul className="mt-4 flex-1 space-y-2 text-xs leading-5 text-muted">
        {capability.recommendations.map((recommendation) => (
          <li key={recommendation} className="flex gap-2">
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-action" aria-hidden />
            <span>{recommendation}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-[11px] font-semibold uppercase text-muted">
        {capability.status === "ready" ? "Ready" : capability.status === "partial" ? "Partial" : "Needs setup"}
      </p>
    </article>
  );
}

function MonitorRunCard({ run }: { run: GrowthMonitorRun }) {
  const output = run.output;
  const searchConsole = output?.searchConsole;
  const technicalSeo = output?.technicalSeo;
  const aiVisibility = output?.aiVisibility;
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
          <dt className="text-muted">AI visibility</dt>
          <dd className="font-semibold">{aiVisibility?.configured ? `${aiVisibility.score ?? 0}%` : "setup"}</dd>
        </div>
      </dl>
      {output?.recommendations?.length ? (
        <p className="mt-4 line-clamp-3 text-xs leading-5 text-muted">{output.recommendations[0]}</p>
      ) : run.error ? (
        <p className="mt-4 line-clamp-3 text-xs leading-5 text-red-700">{run.error}</p>
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
  opportunity
}: {
  opportunity: NonNullable<NonNullable<GrowthMonitorRun["output"]>["keywordOpportunities"]>[number];
}) {
  return (
    <div className="border border-white/10 bg-white/[0.04] p-3">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold leading-5">{opportunity.query}</p>
        <span className="rounded bg-white/10 px-2 py-1 text-[10px] font-semibold uppercase text-white/70">
          {opportunity.opportunityType.replaceAll("_", " ")}
        </span>
      </div>
      <p className="mt-2 text-xs leading-5 text-white/60">{opportunity.reason}</p>
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
