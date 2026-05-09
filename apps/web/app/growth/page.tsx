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
import { GrowthImageAltApplyButton } from "@/components/growth/GrowthImageAltApplyButton";
import { GrowthInternalLinkApplyButton } from "@/components/growth/GrowthInternalLinkApplyButton";
import { GrowthMonitorButton } from "@/components/growth/GrowthMonitorButton";
import { SearchConsoleRewriteApplyButton } from "@/components/growth/SearchConsoleRewriteApplyButton";
import { requireCurrentUser } from "@/lib/auth";
import { GROWTH_APPLY_CREDIT_COST, GROWTH_AUDIT_CREDIT_COST, TRIAL_CREDITS } from "@/lib/credits";
import { getServerDictionary } from "@/lib/i18n/server";
import {
  getGrowthAudit,
  type GrowthAuditIssue,
  type GrowthCollectionScore,
  type GrowthInternalLinkSuggestion,
  type GrowthOptimizationTask,
  type GrowthStoreOpportunity,
  type GrowthProductScore
} from "@/lib/growth-audit";
import { listLatestGrowthMonitorRuns, type GrowthMonitorRun, type GrowthSnippetRewrite } from "@/lib/growth-monitoring";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { listProducts, readState } from "@/lib/store";

export const dynamic = "force-dynamic";

type GrowthPageCopy = Dictionary["growthPage"];

export default async function GrowthPage() {
  const user = await requireCurrentUser();
  const [{ t }, products, state, monitorRuns] = await Promise.all([
    getServerDictionary(),
    listProducts(),
    readState(),
    listLatestGrowthMonitorRuns(user.id, 3)
  ]);
  const copy = t.growthPage;
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
  const collectionWriteBackCandidates = audit.collections
    .filter((collection) =>
      collection.collection.source === "shopify" &&
      collection.collection.id.startsWith("gid://shopify/Collection/") &&
      collection.issues.length > 0
    )
    .slice()
    .sort((left, right) => left.overallScore - right.overallScore)
    .slice(0, 2);
  const workflowIcons = [SearchCheck, FilePenLine, ShieldCheck, LineChart] as const;
  const workflowMetricValues = [
    audit.productCount,
    audit.optimizationTasks.length,
    writeBackReadyTasks,
    monitorRuns.length
  ];
  const workflowStages = copy.workflow.stages.map((step, index) => ({
    ...step,
    metricValue: workflowMetricValues[index] ?? 0,
    icon: workflowIcons[index] ?? SearchCheck
  }));
  const skillScores = [
    audit.averageSeoScore,
    audit.averageGeoScore,
    audit.averageCollectionSeoScore,
    audit.averageImageSeoScore,
    latestPageSpeed?.averageResponseMs ? Math.round((audit.averageTechnicalSeoScore + (latestPageSpeed.slowUrls?.length ? 55 : 85)) / 2) : audit.averageTechnicalSeoScore,
    audit.averageSchemaScore,
    audit.internalLinkSuggestions.length ? Math.min(95, 45 + audit.internalLinkSuggestions.length * 6) : 20,
    latestMonitorRun?.output?.commercialReadinessScore ?? audit.aiVisibilityScore
  ];
  const skillStatuses = [
    "ready",
    "ready",
    audit.collections.length ? "ready" : "setup",
    "ready",
    latestMonitorRun ? "ready" : "partial",
    "partial",
    audit.internalLinkSuggestions.length ? "partial" : "setup",
    latestMonitorRun ? "partial" : "setup"
  ] as const;
  const skillCoverage = copy.skillCoverage.items.map((item, index) => ({
    ...item,
    score: skillScores[index] ?? 0,
    status: skillStatuses[index] ?? "setup"
  }));
  const dataSourceStatuses = [
    shopifyConnected ? "ready" : "setup",
    "ready",
    process.env.CRON_SECRET?.trim() ? "ready" : "setup",
    process.env.GROWTH_COMPETITOR_DOMAINS?.trim() ? "ready" : "setup",
    latestPageSpeed?.checkedUrls ? "ready" : "setup",
    process.env.JUDGEME_API_TOKEN?.trim() || process.env.LOOX_API_KEY?.trim() ? "ready" : "setup",
    process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL?.trim() && process.env.GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY?.trim() ? "ready" : "setup",
    process.env.GOOGLE_CUSTOM_SEARCH_API_KEY?.trim() && process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID?.trim() ? "ready" : "setup"
  ] as const;
  const dataSources = copy.dataSources.items.map((source, index) => {
    const status = dataSourceStatuses[index] ?? "setup";
    return {
      label: source.label,
      status,
      cost: source.cost,
      detail: source.detail,
      action: status === "ready" ? source.readyAction : source.setupAction
    };
  });
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
    (shopifyConnected ? copy.monitorButton.run : copy.hero.connectShopify);

  return (
    <div className="space-y-7">
      <section className="overflow-hidden border border-line bg-[#16251f] text-white shadow-soft">
        <div className="grid gap-0 xl:grid-cols-[minmax(0,1fr)_440px]">
          <div className="p-5 sm:p-7">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase text-white/60">
              <span>{copy.hero.eyebrow}</span>
              <span className="h-1 w-1 rounded-full bg-white/30" aria-hidden />
              <span>{shopifyConnected ? copy.hero.liveOnly : copy.hero.connectAudit}</span>
            </div>
            <h1 className="mt-4 max-w-3xl text-3xl font-semibold leading-tight sm:text-4xl">
              {copy.hero.title}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">
              {copy.hero.body}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={shopifyConnected ? "/products" : "/settings/shopify"}
                className="studio-focus inline-flex h-11 items-center gap-2 rounded bg-white px-4 text-sm font-semibold text-ink"
              >
                {shopifyConnected ? copy.hero.openProductWorkflow : copy.hero.connectShopify}
                <ArrowUpRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/shopify-seo-geo-optimizer"
                className="studio-focus inline-flex h-11 items-center gap-2 rounded border border-white/15 px-4 text-sm font-semibold text-white hover:bg-white/10"
              >
                {copy.hero.guide}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
          <div className="border-t border-white/10 bg-white/[0.04] p-5 sm:p-7 xl:border-l xl:border-t-0">
            <div className="grid grid-cols-2 gap-px overflow-hidden border border-white/10 bg-white/10">
              <Metric label={copy.hero.metricLabels.seoScore} value={audit.averageSeoScore || "--"} tone="dark" icon={SearchCheck} />
              <Metric label={copy.hero.metricLabels.geoScore} value={audit.averageGeoScore || "--"} tone="dark" icon={Sparkles} />
              <Metric label={copy.hero.metricLabels.schema} value={audit.averageSchemaScore || "--"} tone="dark" icon={CheckCircle2} />
              <Metric label={copy.hero.metricLabels.technical} value={audit.averageTechnicalSeoScore || "--"} tone="dark" icon={Gauge} />
            </div>
            <div className="mt-4 border border-white/10 bg-white/[0.04] p-4 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-white/60">{copy.hero.metricLabels.auditSource}</span>
                <span className="font-semibold">{audit.source === "shopify" ? copy.hero.metricLabels.liveShopifyProducts : copy.hero.metricLabels.aceStudioWorkspace}</span>
              </div>
              <div className="mt-2 flex items-center justify-between gap-4">
                <span className="text-white/60">{copy.hero.metricLabels.excludedNonLive}</span>
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
              <h2 className="font-semibold">{copy.error.liveAuditTitle}</h2>
              <p className="mt-1 leading-6">
                {audit.error} {copy.error.fallbackSuffix}
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="border border-line bg-white p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium text-action">{copy.commandCenter.eyebrow}</p>
              <h2 className="mt-1 text-2xl font-semibold">{copy.commandCenter.title}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
                {copy.commandCenter.body}
              </p>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
                {copy.commandCenter.liveOnlyNote}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:min-w-64">
              <MiniMetric label={copy.commandCenter.highPriority} value={highImpactTasks} />
              <MiniMetric label={copy.commandCenter.writeBackReady} value={writeBackReadyTasks} />
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
          <h2 className="mt-4 text-lg font-semibold">{copy.nextBestAction.title}</h2>
          <p className="mt-2 text-sm leading-6 text-white/65">
            {copy.nextBestAction.body}
          </p>
          <div className="mt-4 border border-white/10 bg-white/[0.04] p-4">
            <p className="text-xs font-semibold uppercase text-white/45">{copy.nextBestAction.recommendedNow}</p>
            <p className="mt-2 text-xl font-semibold">{primaryFocus}</p>
            <p className="mt-2 text-sm leading-6 text-white/60">
              {copy.nextBestAction.monitoringCosts} {GROWTH_AUDIT_CREDIT_COST} {GROWTH_AUDIT_CREDIT_COST === 1 ? copy.nextBestAction.credit : copy.nextBestAction.credits}. {copy.nextBestAction.confirmedWriteBackCosts} {GROWTH_APPLY_CREDIT_COST} {copy.nextBestAction.credits}. {copy.nextBestAction.trialUsersStartWith} {TRIAL_CREDITS} {copy.nextBestAction.credits}.
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
              <p className="text-sm font-medium text-action">{copy.optimizationWriter.eyebrow}</p>
              <h2 className="mt-1 text-2xl font-semibold">{copy.optimizationWriter.title}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
                {copy.optimizationWriter.body}
              </p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <WriteBackCapability
              icon={SearchCheck}
              title={copy.optimizationWriter.capabilities[0]?.title ?? ""}
              detail={copy.optimizationWriter.capabilities[0]?.detail ?? ""}
            />
            <WriteBackCapability
              icon={Target}
              title={copy.optimizationWriter.capabilities[1]?.title ?? ""}
              detail={copy.optimizationWriter.capabilities[1]?.detail ?? ""}
            />
            <WriteBackCapability
              icon={Sparkles}
              title={copy.optimizationWriter.capabilities[2]?.title ?? ""}
              detail={copy.optimizationWriter.capabilities[2]?.detail ?? ""}
            />
          </div>
          <div className="mt-5 border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
            {copy.optimizationWriter.safetyNote}
          </div>
        </div>

        <aside className="border border-line bg-white p-5">
          <ShieldCheck className="h-5 w-5 text-action" aria-hidden />
          <h2 className="mt-4 text-lg font-semibold">{copy.optimizationWriter.readyTitle}</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            {copy.optimizationWriter.readyBody}
          </p>
          <div className="mt-4 space-y-3">
            {writeBackCandidates.length || collectionWriteBackCandidates.length ? (
              <>
                {writeBackCandidates.map((product) => (
                  <WriteBackCandidateCard
                    key={product.product.id}
                    product={product}
                    creditCost={GROWTH_APPLY_CREDIT_COST}
                    copy={copy}
                  />
                ))}
                {collectionWriteBackCandidates.map((collection) => (
                  <WriteBackCollectionCandidateCard
                    key={collection.collection.id}
                    collection={collection}
                    creditCost={GROWTH_APPLY_CREDIT_COST}
                    copy={copy}
                  />
                ))}
              </>
            ) : (
              <p className="border border-line bg-canvas p-3 text-sm leading-6 text-muted">
                {copy.optimizationWriter.noCandidates}
              </p>
            )}
          </div>
        </aside>
      </section>

      <section className="border border-line bg-white p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-action">{copy.skillCoverage.eyebrow}</p>
            <h2 className="mt-1 text-2xl font-semibold">{copy.skillCoverage.title}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
              {copy.skillCoverage.body}
            </p>
          </div>
          <span className="inline-flex h-9 items-center rounded border border-line px-3 text-sm font-semibold">
            {skillCoverage.length} {copy.skillCoverage.pillars}
          </span>
        </div>
        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          {skillCoverage.map((item) => (
            <SkillCoverageBlock key={item.title} item={item} copy={copy} />
          ))}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="border border-line bg-white p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium text-action">{copy.collectionSeo.eyebrow}</p>
              <h2 className="mt-1 text-2xl font-semibold">{copy.collectionSeo.title}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
                {copy.collectionSeo.body}
              </p>
            </div>
            <div className={`min-w-32 border p-3 text-center ${scoreTone(audit.averageCollectionSeoScore)}`}>
              <p className="text-[11px] font-semibold uppercase">{copy.collectionSeo.scoreLabel}</p>
              <p className="mt-1 text-2xl font-semibold">{audit.averageCollectionSeoScore || "--"}</p>
            </div>
          </div>
          <div className="mt-5 divide-y divide-line border-y border-line">
            {audit.collections.length ? (
              audit.collections.slice(0, 6).map((collection) => (
                <CollectionAuditRow
                  key={collection.collection.id}
                  collection={collection}
                  applyCreditCost={GROWTH_APPLY_CREDIT_COST}
                  copy={copy}
                />
              ))
            ) : (
              <div className="bg-canvas p-5 text-sm leading-6 text-muted">
                {copy.collectionSeo.empty}
              </div>
            )}
          </div>
        </div>

        <aside className="border border-line bg-white p-5">
          <Link2 className="h-5 w-5 text-action" aria-hidden />
          <h2 className="mt-4 text-lg font-semibold">{copy.internalLinks.title}</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            {copy.internalLinks.body}
          </p>
          <div className="mt-4 space-y-3">
            {audit.internalLinkSuggestions.length ? (
              audit.internalLinkSuggestions.slice(0, 6).map((suggestion) => (
                <InternalLinkSuggestionBlock
                  key={suggestion.key}
                  suggestion={suggestion}
                  copy={copy}
                  creditCost={GROWTH_APPLY_CREDIT_COST}
                />
              ))
            ) : (
              <p className="border border-line bg-canvas p-3 text-sm leading-6 text-muted">
                {copy.internalLinks.empty}
              </p>
            )}
          </div>
        </aside>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="border border-line bg-white p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium text-action">{copy.optimizationQueue.eyebrow}</p>
              <h2 className="mt-1 text-2xl font-semibold">{copy.optimizationQueue.title}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
                {copy.optimizationQueue.body}
              </p>
            </div>
            <span className="inline-flex h-9 items-center rounded border border-line px-3 text-sm font-semibold">
              {audit.optimizationTasks.length} {copy.optimizationQueue.tasks}
            </span>
          </div>
          <div className="mt-5 divide-y divide-line border-y border-line">
            {audit.optimizationTasks.length ? (
              audit.optimizationTasks.slice(0, 8).map((task) => (
                <OptimizationTaskRow key={task.key} task={task} copy={copy} />
              ))
            ) : (
              <div className="bg-canvas p-5 text-sm leading-6 text-muted">
                {copy.optimizationQueue.empty}
              </div>
            )}
          </div>
        </div>

        <aside className="border border-line bg-white p-5">
          <Lightbulb className="h-5 w-5 text-action" aria-hidden />
          <h2 className="mt-4 text-lg font-semibold">{copy.storePlaybooks.title}</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            {copy.storePlaybooks.body}
          </p>
          <div className="mt-4 space-y-3">
            {audit.storeOpportunities.slice(0, 4).map((opportunity) => (
              <StoreOpportunityBlock key={opportunity.key} opportunity={opportunity} copy={copy} />
            ))}
          </div>
        </aside>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="border border-line bg-white p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium text-action">{copy.commercialSeo.eyebrow}</p>
              <h2 className="mt-1 text-2xl font-semibold">{copy.commercialSeo.title}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
                {copy.commercialSeo.body}
              </p>
            </div>
            <div className="min-w-32 border border-line bg-canvas p-3 text-center">
              <p className="text-[11px] font-semibold uppercase text-muted">{copy.commercialSeo.readiness}</p>
              <p className="mt-1 text-2xl font-semibold">
                {latestMonitorRun?.output?.commercialReadinessScore ?? "--"}
              </p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 lg:grid-cols-2">
            {latestMonitorRun?.output?.actionPlan?.length ? (
              latestMonitorRun.output.actionPlan.map((item) => (
                <ActionPlanCard key={item.key} item={item} copy={copy} />
              ))
            ) : (
              <div className="border border-dashed border-line bg-canvas p-5 text-sm leading-6 text-muted lg:col-span-2">
                {copy.commercialSeo.empty}
              </div>
            )}
          </div>
        </div>

        <aside className="border border-line bg-[#16251f] p-5 text-white">
          <Target className="h-5 w-5 text-[#98d7c3]" aria-hidden />
          <h2 className="mt-4 text-lg font-semibold">{copy.keywordOpportunities.title}</h2>
          <p className="mt-2 text-sm leading-6 text-white/65">
            {copy.keywordOpportunities.body}
          </p>
          <div className="mt-4 space-y-3">
            {keywordOpportunityTargets.length ? (
              keywordOpportunityTargets.map(({ opportunity, product }) => (
                <KeywordOpportunityBlock
                  key={`${opportunity.opportunityType}-${opportunity.query}-${opportunity.page ?? ""}`}
                  opportunity={opportunity}
                  product={product}
                  creditCost={GROWTH_APPLY_CREDIT_COST}
                  copy={copy}
                />
              ))
            ) : (
              <p className="border border-white/10 bg-white/[0.04] p-3 text-sm leading-6 text-white/65">
                {copy.dataSources.items[6]?.setupAction}
              </p>
            )}
          </div>
          <div className="mt-5 border-t border-white/10 pt-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold">{copy.keywordOpportunities.competitorGaps}</h3>
              <span className="rounded bg-white/10 px-2 py-1 text-[10px] font-semibold uppercase text-white/70">
                {competitorGapCount || "setup"}
              </span>
            </div>
            <div className="mt-3 space-y-3">
              {latestMonitorRun?.output?.competitorKeywordGaps?.length ? (
                latestMonitorRun.output.competitorKeywordGaps.slice(0, 3).map((gap) => (
                  <CompetitorGapBlock key={`${gap.query}-${gap.page ?? ""}`} gap={gap} copy={copy} />
                ))
              ) : (
                <p className="border border-white/10 bg-white/[0.04] p-3 text-sm leading-6 text-white/65">
                  {copy.keywordOpportunities.competitorSetup}
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
              <p className="text-sm font-medium text-action">{copy.dataSources.eyebrow}</p>
              <h2 className="mt-1 text-2xl font-semibold">{copy.dataSources.title}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
                {copy.dataSources.body}
              </p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {dataSources.map((source) => (
              <DataSourceCard key={source.label} source={source} copy={copy} />
            ))}
          </div>
        </div>

        <aside className="border border-line bg-white p-5">
          <Clock3 className="h-5 w-5 text-action" aria-hidden />
          <h2 className="mt-4 text-lg font-semibold">{copy.noApiQueue.title}</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            {copy.noApiQueue.body}
          </p>
          <div className="mt-4 space-y-3">
            {noApiWins.length ? (
              noApiWins.map((win) => <NoApiWinBlock key={win.key} win={win} />)
            ) : (
              <p className="border border-line bg-canvas p-3 text-sm leading-6 text-muted">
                {copy.noApiQueue.empty}
              </p>
            )}
          </div>
        </aside>
      </section>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="border border-line bg-white p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium text-action">{copy.liveMonitor.eyebrow}</p>
              <h2 className="mt-1 text-2xl font-semibold">{copy.liveMonitor.title}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
                {copy.liveMonitor.body}
              </p>
            </div>
            <GrowthMonitorButton creditCost={GROWTH_AUDIT_CREDIT_COST} />
          </div>
          {monitorRuns.length ? (
            <div className="mt-5 grid gap-3 lg:grid-cols-3">
              {monitorRuns.map((run) => (
                <MonitorRunCard key={run.id} run={run} copy={copy} />
              ))}
            </div>
          ) : (
            <div className="mt-5 border border-dashed border-line bg-canvas p-5 text-sm leading-6 text-muted">
              {copy.liveMonitor.empty}
            </div>
          )}
        </div>

        <aside className="border border-line bg-[#f7faf8] p-5">
          <Activity className="h-5 w-5 text-action" aria-hidden />
          <h2 className="mt-4 text-lg font-semibold">{copy.liveMonitor.unlocksTitle}</h2>
          <div className="mt-4 space-y-3 text-sm leading-6 text-muted">
            {copy.liveMonitor.unlocks.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>
        </aside>
      </section>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div>
          <div className="mb-3 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm text-muted">{copy.productScores.eyebrow}</p>
              <h2 className="text-xl font-semibold">{copy.productScores.title}</h2>
            </div>
            <Link href="/products" className="text-sm font-semibold text-action">
              {copy.productScores.openProducts}
            </Link>
          </div>
          {audit.products.length ? (
            <div className="border-y border-line">
              {audit.products.slice(0, 12).map((product) => (
                <ProductAuditRow
                  key={`${product.product.source}-${product.product.id}`}
                  product={product}
                  applyCreditCost={GROWTH_APPLY_CREDIT_COST}
                  copy={copy}
                />
              ))}
            </div>
          ) : (
            <div className="border border-line bg-white p-8 text-sm text-muted">
              {copy.productScores.empty}
            </div>
          )}
        </div>

        <aside>
          <div className="border border-line bg-white p-5">
            <div className="flex items-center gap-2">
              <CircleAlert className="h-5 w-5 text-action" aria-hidden />
              <h2 className="text-lg font-semibold">{copy.recommendations.title}</h2>
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
                  {copy.recommendations.strongEnough}
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
  creditCost,
  copy
}: {
  product: GrowthProductScore;
  creditCost: number;
  copy: GrowthPageCopy;
}) {
  const primaryIssue = product.issues[0];

  return (
    <article className="border border-line bg-canvas p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold leading-5">{product.product.title}</h3>
          <p className="mt-1 text-xs leading-5 text-muted">
            {primaryIssue?.label ?? copy.optimizationWriter.fallbackIssue}
          </p>
        </div>
        <span className={`rounded border px-2 py-1 text-xs font-semibold ${scoreTone(product.overallScore)}`}>
          {product.overallScore}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {copy.optimizationWriter.fields.map((field) => (
          <span key={field} className="rounded bg-white px-2 py-0.5 text-[11px] font-semibold text-muted">
            {field}
          </span>
        ))}
      </div>
      <div className="mt-3">
        <GrowthApplyButton productId={product.product.id} creditCost={creditCost} />
      </div>
      {product.product.imageCount > product.product.imagesWithAlt || product.imageSeoScore < 90 ? (
        <div className="mt-3">
          <GrowthImageAltApplyButton productId={product.product.id} creditCost={creditCost} />
        </div>
      ) : null}
    </article>
  );
}

function WriteBackCollectionCandidateCard({
  collection,
  creditCost,
  copy
}: {
  collection: GrowthCollectionScore;
  creditCost: number;
  copy: GrowthPageCopy;
}) {
  const primaryIssue = collection.issues[0];

  return (
    <article className="border border-line bg-canvas p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold leading-5">{collection.collection.title}</h3>
          <p className="mt-1 text-xs leading-5 text-muted">
            {primaryIssue?.label ?? copy.optimizationWriter.fallbackIssue}
          </p>
        </div>
        <span className={`rounded border px-2 py-1 text-xs font-semibold ${scoreTone(collection.overallScore)}`}>
          {collection.overallScore}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {copy.optimizationWriter.collectionFields.map((field) => (
          <span key={field} className="rounded bg-white px-2 py-0.5 text-[11px] font-semibold text-muted">
            {field}
          </span>
        ))}
      </div>
      <div className="mt-3">
        <GrowthApplyButton
          productId={collection.collection.id}
          targetType="collection"
          creditCost={creditCost}
        />
      </div>
    </article>
  );
}

function OptimizationTaskRow({ task, copy }: { task: GrowthOptimizationTask; copy: GrowthPageCopy }) {
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
              {task.effort} {copy.common.effort}
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
          <p className="text-[11px] font-semibold uppercase text-muted">{copy.optimizationQueue.priorityScore}</p>
          <p className="mt-1 text-2xl font-semibold">{task.priorityScore}</p>
        </div>
        {writeBack ? (
          <div className="border border-emerald-200 bg-emerald-50 p-3 text-emerald-900">
            <p className="text-[11px] font-semibold uppercase">{copy.optimizationQueue.confirmScope}</p>
            <p className="mt-1 text-sm font-semibold">{task.writeBackScope.join(", ")}</p>
          </div>
        ) : (
          <div className="border border-line bg-canvas p-3 text-muted">
            <p className="text-[11px] font-semibold uppercase">{copy.optimizationQueue.manualOnly}</p>
            <p className="mt-1 text-sm">{copy.optimizationQueue.manualBody}</p>
          </div>
        )}
        {task.targetUrl ? (
          <Link href={task.targetUrl} target="_blank" className="inline-flex text-xs font-semibold text-action">
            {copy.optimizationQueue.openTarget}
          </Link>
        ) : null}
      </div>
    </article>
  );
}

function StoreOpportunityBlock({ opportunity, copy }: { opportunity: GrowthStoreOpportunity; copy: GrowthPageCopy }) {
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
        <p className="text-[11px] font-semibold uppercase text-muted">{copy.storePlaybooks.benchmark}</p>
        <p className="mt-1 text-xs leading-5 text-muted">{opportunity.benchmark}</p>
      </div>
      <p className="mt-3 text-sm font-semibold">{opportunity.recommendedAction}</p>
    </article>
  );
}

function SkillCoverageBlock({
  item,
  copy
}: {
  item: {
    title: string;
    score: number;
    status: "ready" | "partial" | "setup";
    detail: string;
    skills: readonly string[];
  };
  copy: GrowthPageCopy;
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
        <p className="text-[10px] font-semibold uppercase">{copy.skillCoverage.score}</p>
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
  applyCreditCost,
  copy
}: {
  product: GrowthProductScore;
  applyCreditCost: number;
  copy: GrowthPageCopy;
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
            {product.product.source === "shopify" ? copy.productScores.sourceShopify : copy.productScores.sourceWorkspace}
          </span>
        </div>
        <p className="mt-2 text-sm leading-6 text-muted">
          {primaryIssue
            ? primaryIssue.detail
            : product.strengths[0] || copy.productScores.fallbackStrong}
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
            <p className="text-xs font-semibold uppercase text-muted">{copy.productScores.writeBackDraft}</p>
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
            <span>{copy.productScores.serpPreview}</span>
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
              <p className="text-xs font-semibold uppercase text-muted">{copy.productScores.aiAnswerReadiness}</p>
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
            <p className="text-xs font-semibold uppercase text-muted">{copy.productScores.schemaWriter}</p>
            <ul className="mt-3 space-y-2 text-xs leading-5 text-muted">
              {product.schemaSuggestions.slice(0, 4).map((schema) => (
                <li key={schema.type} className="flex items-start justify-between gap-3 border-b border-line/70 pb-2 last:border-b-0 last:pb-0">
                  <span>
                    <span className="font-semibold text-ink">{schema.type}</span>
                    <span className="block">{schema.missing.length ? `${copy.productScores.missing} ${schema.missing.join(", ")}` : schema.note}</span>
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
        {canApplyToShopify && (product.product.imageCount > product.product.imagesWithAlt || product.imageSeoScore < 90) ? (
          <GrowthImageAltApplyButton productId={product.product.id} creditCost={applyCreditCost} />
        ) : null}
        {href ? (
          <Link
            href={href}
            target={product.product.source === "shopify" ? "_blank" : undefined}
            className="studio-focus inline-flex h-10 w-full items-center justify-center gap-2 rounded border border-line bg-white px-3 text-sm font-semibold hover:bg-canvas"
          >
            {product.product.source === "shopify" ? copy.productScores.openInShopify : copy.productScores.openDraft}
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </Link>
        ) : null}
      </div>
    </article>
  );
}

function CollectionAuditRow({
  collection,
  applyCreditCost,
  copy
}: {
  collection: GrowthCollectionScore;
  applyCreditCost: number;
  copy: GrowthPageCopy;
}) {
  const primaryIssue = collection.issues[0];
  const canApplyToShopify = collection.collection.source === "shopify" && collection.collection.id.startsWith("gid://shopify/Collection/");

  return (
    <article className="grid gap-4 bg-white p-4 lg:grid-cols-[minmax(0,1fr)_220px]">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-semibold">{collection.collection.title}</h3>
          <span className="rounded border border-line px-2 py-0.5 text-xs text-muted">{copy.collectionSeo.badge}</span>
        </div>
        <p className="mt-2 text-sm leading-6 text-muted">
          {primaryIssue
            ? primaryIssue.detail
            : copy.productScores.fallbackStrong}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {collection.issues.slice(0, 3).map((issue) => (
            <span key={issue.key} className="rounded border border-line px-2 py-1 text-xs text-muted">
              {issue.label}
            </span>
          ))}
        </div>
        <div className="mt-4 border border-line bg-canvas p-3">
          <p className="text-xs font-semibold uppercase text-muted">{copy.collectionSeo.serpPreview}</p>
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
        {canApplyToShopify && collection.issues.length ? (
          <GrowthApplyButton
            productId={collection.collection.id}
            targetType="collection"
            creditCost={applyCreditCost}
          />
        ) : null}
        {collection.collection.onlineStoreUrl ? (
          <Link
            href={collection.collection.onlineStoreUrl}
            target="_blank"
            className="studio-focus inline-flex h-10 w-full items-center justify-center gap-2 rounded border border-line bg-white px-3 text-sm font-semibold hover:bg-canvas"
          >
            {copy.collectionSeo.openCollection}
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </Link>
        ) : null}
      </div>
    </article>
  );
}

function InternalLinkSuggestionBlock({
  suggestion,
  copy,
  creditCost
}: {
  suggestion: GrowthInternalLinkSuggestion;
  copy: GrowthPageCopy;
  creditCost: number;
}) {
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
        {copy.internalLinks.link} <span className="font-semibold text-ink">{suggestion.sourceTitle}</span> {copy.internalLinks.to}{" "}
        <span className="font-semibold text-ink">{suggestion.targetTitle}</span>.
      </p>
      <p className="mt-2 text-sm leading-6 text-muted">{suggestion.reason}</p>
      {suggestion.targetUrl ? (
        <Link href={suggestion.targetUrl} target="_blank" className="mt-3 inline-flex text-xs font-semibold text-action">
          {copy.internalLinks.openTarget}
        </Link>
      ) : null}
      <GrowthInternalLinkApplyButton suggestion={suggestion} creditCost={creditCost} />
    </article>
  );
}

function MonitorRunCard({ run, copy }: { run: GrowthMonitorRun; copy: GrowthPageCopy }) {
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
          <dd className="font-semibold">{aiVisibility?.configured ? `${aiVisibility.score ?? 0}%` : copy.common.statusSetup}</dd>
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
  item,
  copy
}: {
  item: NonNullable<NonNullable<GrowthMonitorRun["output"]>["actionPlan"]>[number];
  copy: GrowthPageCopy;
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
        <p className="text-[11px] font-semibold uppercase text-muted">{copy.commercialSeo.recommendedAction}</p>
        <p className="mt-1 text-sm font-semibold">{item.actionType.replaceAll("_", " ")}</p>
        <p className="mt-1 text-xs leading-5 text-muted">{item.estimatedImpact}</p>
      </div>
      {item.rewrite ? (
        <div className="mt-3 border border-line bg-white p-3">
          <p className="text-[11px] font-semibold uppercase text-muted">{copy.commercialSeo.rewriteDraft}</p>
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
          {copy.commercialSeo.openTargetPage}
        </Link>
      ) : null}
    </article>
  );
}

function KeywordOpportunityBlock({
  opportunity,
  product,
  creditCost,
  copy
}: {
  opportunity: NonNullable<NonNullable<GrowthMonitorRun["output"]>["keywordOpportunities"]>[number];
  product?: GrowthProductScore;
  creditCost: number;
  copy: GrowthPageCopy;
}) {
  const canWriteBack = Boolean(product?.product.source === "shopify" && product.product.id.startsWith("gid://shopify/Product/"));
  const rewrite = getOpportunityRewrite(opportunity);
  const ctr = Number.isFinite(opportunity.ctr) ? opportunity.ctr : 0;
  const opportunityType = opportunity.opportunityType?.replaceAll("_", " ") ?? "keyword opportunity";

  return (
    <div className="border border-white/10 bg-white/[0.04] p-3">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold leading-5">{opportunity.query}</p>
        <span className="rounded bg-white/10 px-2 py-1 text-[10px] font-semibold uppercase text-white/70">
          {opportunityType}
        </span>
      </div>
      <p className="mt-2 text-xs leading-5 text-white/60">
        {opportunity.reason} <span className="font-semibold text-white/75">{opportunity.pageType ?? "unknown"}</span>
      </p>
      <div className="mt-3 grid grid-cols-3 gap-px overflow-hidden border border-white/10 bg-white/10 text-center text-xs">
        <div className="bg-[#16251f] p-2">
          <p className="text-white/45">{copy.keywordOpportunities.impressions}</p>
          <p className="mt-1 font-semibold">{opportunity.impressions ?? "--"}</p>
        </div>
        <div className="bg-[#16251f] p-2">
          <p className="text-white/45">CTR</p>
          <p className="mt-1 font-semibold">{(ctr * 100).toFixed(1)}%</p>
        </div>
        <div className="bg-[#16251f] p-2">
          <p className="text-white/45">Pos.</p>
          <p className="mt-1 font-semibold">{opportunity.position || "--"}</p>
        </div>
      </div>
      {rewrite ? (
        <div className="mt-3 border border-white/10 bg-black/10 p-3">
          <p className="text-[10px] font-semibold uppercase text-white/45">{copy.keywordOpportunities.rewriteDraft}</p>
          <p className="mt-1 text-xs font-semibold leading-5 text-white/85">{rewrite.seoTitle}</p>
          <p className="mt-1 text-xs leading-5 text-white/60">{rewrite.seoDescription}</p>
        </div>
      ) : (
        <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-xs leading-5 text-white/55">
          {copy.keywordOpportunities.legacyRun}
        </p>
      )}
      {canWriteBack && product && rewrite ? (
        <SearchConsoleRewriteApplyButton
          productId={product.product.id}
          rewrite={rewrite}
          creditCost={creditCost}
        />
      ) : (
        <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-xs leading-5 text-white/55">
          {copy.keywordOpportunities.writeBackUnavailable}
        </p>
      )}
    </div>
  );
}

function getOpportunityRewrite(
  opportunity: NonNullable<NonNullable<GrowthMonitorRun["output"]>["keywordOpportunities"]>[number]
): GrowthSnippetRewrite | null {
  const savedRewrite = (opportunity as typeof opportunity & { rewrite?: GrowthSnippetRewrite }).rewrite;
  if (savedRewrite?.seoTitle && savedRewrite.seoDescription && savedRewrite.faqQuestion && savedRewrite.answerBlock) {
    return savedRewrite;
  }

  const query = opportunity.query?.replace(/\s+/g, " ").trim();
  if (!query) return null;
  const title = titleCaseQuery(query);
  const pageType = opportunity.pageType ?? "product";
  const pageLabel = pageType === "collection"
    ? "Collection"
    : pageType === "blog"
      ? "Guide"
      : pageType === "home"
        ? "Store"
        : "Product";
  const intent = inferOpportunityIntent(query);

  return {
    seoTitle: clampOpportunitySnippet(`${title} | ${pageLabel} Details, Photos and FAQs`, 68),
    seoDescription: clampOpportunitySnippet(
      `Find ${query} with clear product details, photos, FAQs, shipping and return context, and buying guidance before purchase.`,
      158
    ),
    faqQuestion: intent === "comparison"
      ? `How should shoppers compare ${query}?`
      : `What should shoppers know before buying ${query}?`,
    answerBlock: clampOpportunitySnippet(
      `Use this page to answer ${query} directly: summarize key facts, list product or collection attributes, explain best-fit use cases, and link to related pages.`,
      260
    ),
    intent,
    confidence: query.length >= 4 && pageType !== "unknown" ? "medium" : "low"
  };
}

function titleCaseQuery(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .map((word) => `${word.slice(0, 1).toUpperCase()}${word.slice(1).toLowerCase()}`)
    .join(" ");
}

function inferOpportunityIntent(query: string): GrowthSnippetRewrite["intent"] {
  if (/\b(best|vs|compare|alternative|difference|which)\b/i.test(query)) return "comparison";
  if (/\b(how|what|why|guide|ideas|tips)\b/i.test(query)) return "informational";
  if (/\b(brand|official|ace|store)\b/i.test(query)) return "brand";
  return "commercial";
}

function clampOpportunitySnippet(value: string, maxLength: number) {
  const clean = value.replace(/\s+/g, " ").trim();
  if (clean.length <= maxLength) return clean;
  const sliced = clean.slice(0, maxLength + 1);
  const lastSpace = sliced.lastIndexOf(" ");
  return (lastSpace > maxLength * 0.68 ? sliced.slice(0, lastSpace) : sliced.slice(0, maxLength)).trim();
}

function CompetitorGapBlock({
  gap,
  copy
}: {
  gap: NonNullable<NonNullable<GrowthMonitorRun["output"]>["competitorKeywordGaps"]>[number];
  copy: GrowthPageCopy;
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
        {copy.keywordOpportunities.compare} {gap.competitorDomains.slice(0, 3).join(", ")}
      </p>
      <p className="mt-3 text-xs font-semibold leading-5 text-white/80">{gap.recommendedAction}</p>
    </div>
  );
}

function DataSourceCard({
  source,
  copy
}: {
  source: {
    label: string;
    status: "ready" | "setup";
    cost: string;
    detail: string;
    action: string;
  };
  copy: GrowthPageCopy;
}) {
  const ready = source.status === "ready";
  return (
    <article className="border border-line bg-canvas p-4">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold">{source.label}</h3>
        <span className={`rounded border px-2 py-1 text-[11px] font-semibold uppercase ${
          ready ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-amber-200 bg-amber-50 text-amber-900"
        }`}>
          {ready ? copy.dataSources.ready : copy.dataSources.setup}
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
