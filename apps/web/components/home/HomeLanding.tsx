"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  FileText,
  ImagePlus,
  LineChart,
  SearchCheck,
  Send,
  ShieldCheck,
  Sparkles,
  Store,
  WandSparkles
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useLanguage } from "@/components/i18n/LanguageProvider";

const workflowIcons = [ImagePlus, Sparkles, FileText, Send] as const;
const searchEntityIcons = [SearchCheck, Store, ShieldCheck, LineChart] as const;
const mainPathIcons = [Sparkles, SearchCheck, FileText, BarChart3] as const;

export function HomeLanding() {
  const { t } = useLanguage();
  const landing = t.landing;

  return (
    <>
      <section className="relative left-1/2 right-1/2 -mx-[50vw] -mt-6 min-h-[calc(88svh-66px)] w-screen overflow-hidden border-b border-line bg-[#f4f5f1]">
        <div className="absolute inset-0 opacity-[0.45] landing-grid" aria-hidden />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:min-h-[calc(88svh-66px)] lg:grid-cols-[minmax(0,0.9fr)_minmax(520px,1fr)] lg:items-center lg:py-16">
          <div className="landing-reveal">
            <p className="inline-flex items-center gap-2 border border-[#c8d6cf] bg-white/70 px-3 py-1.5 text-sm font-semibold text-action">
              <BadgeCheck className="h-4 w-4" aria-hidden />
              {landing.hero.badge}
            </p>
            <h1 className="mt-7 max-w-4xl text-6xl font-semibold leading-[0.96] tracking-tight text-ink sm:text-7xl lg:text-8xl">
              {landing.hero.productName}
            </h1>
            <h2 className="mt-6 max-w-3xl text-3xl font-semibold leading-tight text-[#263a33] sm:text-5xl">
              {landing.hero.headline}
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">{landing.hero.body}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/login"
                className="studio-focus group inline-flex h-12 items-center gap-2 bg-action px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#0c5d4b]"
              >
                {landing.hero.primaryCta}
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
              </Link>
              <Link
                href="/shopify-seo-geo-optimizer"
                className="studio-focus inline-flex h-12 items-center border border-[#c8d6cf] bg-white/80 px-5 text-sm font-semibold transition hover:-translate-y-0.5 hover:border-action"
              >
                {landing.hero.secondaryCta}
              </Link>
            </div>
            <div className="mt-10 grid max-w-2xl grid-cols-2 overflow-hidden border border-[#c8d6cf] bg-white/70 sm:grid-cols-4">
              {landing.proof.map((metric) => (
                <ProofMetric key={metric.label} {...metric} />
              ))}
            </div>
          </div>

          <HeroTerminal />
        </div>
      </section>

      <SectionShell
        eyebrow={landing.sitelinkPaths.eyebrow}
        title={landing.sitelinkPaths.title}
        intro={landing.sitelinkPaths.intro}
      >
        <div className="grid gap-px overflow-hidden border border-line bg-line md:grid-cols-2 lg:grid-cols-4">
          {landing.sitelinkPaths.items.map((item, index) => (
            <MainPathCard
              key={item.href}
              href={item.href}
              icon={mainPathIcons[index] ?? Sparkles}
              title={item.title}
              detail={item.detail}
              action={landing.sitelinkPaths.action}
            />
          ))}
        </div>
      </SectionShell>

      <SectionShell eyebrow={landing.workspaces.eyebrow} title={landing.workspaces.title}>
        <div className="grid gap-0 border border-line bg-white lg:grid-cols-2">
          <WorkspacePanel
            icon={WandSparkles}
            title={landing.workspaces.product.title}
            detail={landing.workspaces.product.detail}
            href="/shopify-ai-product-listing-generator"
            action={landing.workspaces.product.action}
            items={[...landing.workspaces.product.items]}
          />
          <WorkspacePanel
            icon={SearchCheck}
            title={landing.workspaces.growth.title}
            detail={landing.workspaces.growth.detail}
            href="/shopify-seo-geo-optimizer"
            action={landing.workspaces.growth.action}
            items={[...landing.workspaces.growth.items]}
          />
        </div>
      </SectionShell>

      <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen overflow-hidden border-y border-line bg-[#14231d] text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:py-20">
          <div className="landing-reveal">
            <p className="text-sm font-semibold text-[#98d7c3]">{landing.control.eyebrow}</p>
            <h2 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">
              {landing.control.title}
            </h2>
            <p className="mt-5 max-w-2xl text-sm leading-6 text-[#c7d7d0]">
              {landing.control.intro}
            </p>
          </div>
          <ProductControlSurface />
          <div className="landing-reveal landing-reveal-delay grid gap-px border border-white/10 bg-white/10 lg:col-span-2 lg:grid-cols-4">
            {landing.workflow.steps.map((step, index) => (
              <WorkflowStep
                key={step.number}
                number={step.number}
                icon={workflowIcons[index] ?? ImagePlus}
                title={step.title}
                detail={step.detail}
              />
            ))}
          </div>
        </div>
      </section>

      <SectionShell
        eyebrow={landing.growth.eyebrow}
        title={landing.growth.title}
        intro={landing.growth.intro}
      >
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <GrowthScorePanel />
          <div className="grid gap-px overflow-hidden border border-line bg-line">
            {landing.growth.signals.map((signal) => (
              <GrowthSignal key={signal.title} title={signal.title} detail={signal.detail} />
            ))}
          </div>
        </div>
      </SectionShell>

      <SectionShell
        eyebrow={landing.searchEntity.eyebrow}
        title={landing.searchEntity.title}
        intro={landing.searchEntity.intro}
      >
        <div className="grid gap-px overflow-hidden border border-line bg-line lg:grid-cols-4">
          {landing.searchEntity.cards.map((card, index) => (
            <SearchEntityCard
              key={card.title}
              icon={searchEntityIcons[index] ?? SearchCheck}
              title={card.title}
              detail={card.detail}
            />
          ))}
        </div>
      </SectionShell>

      <SectionShell eyebrow={landing.trust.eyebrow} title={landing.trust.title}>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="grid gap-px overflow-hidden border border-line bg-line">
            <TrustLine icon={ShieldCheck} title={landing.trust.lines[0]?.title ?? ""} detail={landing.trust.lines[0]?.detail ?? ""} />
            <TrustLine icon={Store} title={landing.trust.lines[1]?.title ?? ""} detail={landing.trust.lines[1]?.detail ?? ""} />
            <TrustLine icon={SearchCheck} title={landing.trust.lines[2]?.title ?? ""} detail={landing.trust.lines[2]?.detail ?? ""} />
          </div>
          <div className="grid gap-6">
            <div>
              <div className="mb-3 flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-action">{landing.resources.eyebrow}</p>
                  <h3 className="mt-1 text-xl font-semibold">{landing.resources.title}</h3>
                </div>
                <Link href="/resources" className="hidden text-sm font-semibold text-action sm:inline-flex">
                  {landing.resources.readGuide}
                </Link>
              </div>
              <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                {landing.resources.cards.map((article) => (
                  <ResourceCard
                    key={article.href}
                    href={article.href}
                    category={article.category}
                    title={article.title}
                    excerpt={article.excerpt}
                    readGuide={landing.resources.readGuide}
                  />
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-action">{landing.faq.eyebrow}</p>
              <h3 className="mt-1 text-xl font-semibold">{landing.faq.title}</h3>
              <div className="mt-3 grid gap-px overflow-hidden border border-line bg-line md:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                {landing.faq.items.map((item) => (
                  <FaqItem key={item.question} question={item.question} answer={item.answer} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </SectionShell>

      <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen border-t border-line bg-[#f4f5f1]">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-12 sm:px-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-action">{landing.finalCta.eyebrow}</p>
            <h2 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight">
              {landing.finalCta.title}
            </h2>
          </div>
          <Link
            href="/login"
            className="studio-focus group inline-flex h-12 items-center justify-center gap-2 bg-action px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5"
          >
            {landing.finalCta.action}
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
          </Link>
        </div>
      </section>
    </>
  );
}

function MainPathCard({
  href,
  icon: Icon,
  title,
  detail,
  action
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  detail: string;
  action: string;
}) {
  return (
    <Link href={href} className="group bg-white p-5 transition hover:bg-canvas">
      <Icon className="h-5 w-5 text-action" aria-hidden />
      <h3 className="mt-5 text-lg font-semibold">{title}</h3>
      <p className="mt-3 min-h-20 text-sm leading-6 text-muted">{detail}</p>
      <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-action">
        {action}
        <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
      </span>
    </Link>
  );
}

function SectionShell({
  eyebrow,
  title,
  intro,
  children
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="landing-reveal py-14 sm:py-16">
      <div className="mb-8 grid gap-4 lg:grid-cols-[360px_minmax(0,1fr)] lg:items-end">
        <div>
          <p className="text-sm font-semibold text-action">{eyebrow}</p>
          <h2 className="mt-3 max-w-4xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            {title}
          </h2>
        </div>
        {intro ? <p className="max-w-2xl text-sm leading-6 text-muted lg:justify-self-end">{intro}</p> : null}
      </div>
      {children}
    </section>
  );
}

function HeroTerminal() {
  const { t } = useLanguage();
  const terminal = t.landing.terminal;

  return (
    <div className="landing-reveal landing-reveal-delay relative hero-float">
      <div className="border border-[#c5d1cb] bg-[#101916] p-3 text-white shadow-soft">
        <div className="flex items-center justify-between border-b border-white/10 px-2 pb-3">
          <div>
            <p className="text-xs font-medium uppercase text-white/45">{terminal.workspace}</p>
            <h2 className="mt-1 text-lg font-semibold">{terminal.title}</h2>
          </div>
          <span className="border border-[#98d7c3]/30 bg-[#18352c] px-2 py-1 text-xs font-semibold text-[#98d7c3]">
            {terminal.connected}
          </span>
        </div>

        <div className="grid gap-3 pt-3 sm:grid-cols-[1fr_190px]">
          <div className="grid grid-cols-2 gap-2">
            <PreviewImage label={terminal.mediaLabels[0] ?? ""} src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80" />
            <PreviewImage label={terminal.mediaLabels[1] ?? ""} src="https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=800&q=80" />
            <PreviewImage label={terminal.mediaLabels[2] ?? ""} src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80" />
            <div className="relative min-h-36 border border-white/10 bg-white p-3">
              <span className="absolute left-2 top-2 bg-[#f4f5f1] px-2 py-1 text-xs font-semibold text-ink">
                {terminal.mediaLabels[3]}
              </span>
              <div className="grid h-full place-items-center">
                <div className="h-20 w-20 rounded-full border border-line bg-white shadow-soft" />
              </div>
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.04] p-3">
            <p className="text-xs font-medium uppercase text-white/45">{terminal.draftLabel}</p>
            <h3 className="mt-2 text-base font-semibold leading-6">{terminal.draftTitle}</h3>
            <p className="mt-2 text-xs leading-5 text-white/55">{terminal.draftBody}</p>
            <div className="mt-4 space-y-2">
              <PreviewMetric label={terminal.metrics.media} value={terminal.metrics.images} />
              <PreviewMetric label={terminal.metrics.seo} value="86/100" />
              <PreviewMetric label={terminal.metrics.geo} value="78/100" />
              <PreviewMetric label={terminal.metrics.status} value={terminal.metrics.draft} />
            </div>
          </div>
        </div>

        <div className="mt-3 grid gap-px overflow-hidden bg-white/10 text-xs sm:grid-cols-4">
          {terminal.checks.map((label) => (
            <PreviewPill key={label} label={label} />
          ))}
        </div>
      </div>
    </div>
  );
}

function PreviewImage({ label, src }: { label: string; src: string }) {
  return (
    <div className="relative min-h-36 overflow-hidden border border-white/10 bg-white">
      <Image
        src={src}
        alt=""
        fill
        sizes="(min-width: 1024px) 250px, (min-width: 640px) 45vw, 50vw"
        className="object-cover transition duration-700 hover:scale-105"
      />
      <span className="absolute left-2 top-2 bg-white/95 px-2 py-1 text-xs font-semibold text-ink">
        {label}
      </span>
    </div>
  );
}

function PreviewMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-t border-white/10 pt-2">
      <span className="text-xs text-white/50">{label}</span>
      <span className="text-xs font-semibold text-white">{value}</span>
    </div>
  );
}

function PreviewPill({ label }: { label: string }) {
  return <span className="bg-white/[0.04] px-2 py-2 text-center text-white/70">{label}</span>;
}

function ProofMetric({ value, label, detail }: { value: string; label: string; detail: string }) {
  return (
    <div className="group border-b border-r border-[#dbe3de] p-4 transition hover:bg-white even:border-r-0 sm:border-b-0 sm:even:border-r sm:last:border-r-0">
      <p className="text-2xl font-semibold tracking-tight text-ink transition group-hover:-translate-y-0.5">{value}</p>
      <p className="mt-2 text-xs font-semibold">{label}</p>
      <p className="mt-1 text-[11px] leading-4 text-muted">{detail}</p>
    </div>
  );
}

function WorkspacePanel({
  icon: Icon,
  title,
  detail,
  href,
  action,
  items
}: {
  icon: LucideIcon;
  title: string;
  detail: string;
  href: string;
  action: string;
  items: string[];
}) {
  return (
    <div className="group border-b border-line p-6 transition hover:bg-[#f8faf7] lg:border-b-0 lg:border-r lg:last:border-r-0">
      <Icon className="h-6 w-6 text-action" aria-hidden />
      <h3 className="mt-8 text-3xl font-semibold">{title}</h3>
      <p className="mt-4 max-w-xl text-sm leading-6 text-muted">{detail}</p>
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <div key={item} className="flex items-center gap-2 border-t border-line pt-3 text-sm">
            <CheckCircle2 className="h-4 w-4 text-action" aria-hidden />
            <span>{item}</span>
          </div>
        ))}
      </div>
      <Link href={href} className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-action">
        {action}
        <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
      </Link>
    </div>
  );
}

function ProductControlSurface() {
  const { t } = useLanguage();
  const control = t.landing.control;

  return (
    <div className="landing-reveal landing-reveal-delay surface-scan border border-white/10 bg-white/[0.04] p-3">
      <div className="grid gap-3 lg:grid-cols-[180px_minmax(0,1fr)_230px]">
        <aside className="hidden border border-white/10 bg-[#101916] p-4 lg:block">
          <p className="text-sm font-semibold">AceStudio</p>
          <div className="mt-6 space-y-2 text-xs text-white/55">
            {control.sidebarItems.map((item, index) => (
              <div key={item} className={index === 0 ? "bg-white/10 px-3 py-2 text-white" : "px-3 py-2"}>
                {item}
              </div>
            ))}
          </div>
        </aside>
        <div className="border border-white/10 bg-[#f4f5f1] p-4 text-ink">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <div>
              <p className="text-xs font-semibold uppercase text-muted">{control.recordLabel}</p>
              <h3 className="mt-1 text-xl font-semibold">{control.recordTitle}</h3>
            </div>
            <span className="bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-800">
              {control.ready}
            </span>
          </div>
          <div className="mt-4 grid gap-3 2xl:grid-cols-2">
            {control.fields.map((field) => (
              <ControlField key={field.label} label={field.label} value={field.value} />
            ))}
          </div>
        </div>
        <div className="border border-white/10 bg-[#101916] p-4">
          <LineChart className="h-5 w-5 text-[#98d7c3]" aria-hidden />
          <h3 className="mt-4 text-lg font-semibold">{control.auditTitle}</h3>
          <div className="mt-5 space-y-4">
            <ScoreLine label={control.scores.seo} value="86" />
            <ScoreLine label={control.scores.geo} value="78" />
            <ScoreLine label={control.scores.readiness} value="92" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ControlField({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-line bg-white p-3">
      <p className="text-xs font-semibold uppercase text-muted">{label}</p>
      <p className="mt-2 text-sm font-semibold">{value}</p>
    </div>
  );
}

function ScoreLine({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-white/50">{label}</span>
        <span className="font-semibold">{value}/100</span>
      </div>
      <div className="mt-2 h-1.5 bg-white/10">
        <div className="h-full bg-[#98d7c3]" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function WorkflowStep({
  number,
  icon: Icon,
  title,
  detail
}: {
  number: string;
  icon: LucideIcon;
  title: string;
  detail: string;
}) {
  return (
    <div className="group bg-white/[0.04] p-5 transition hover:bg-white/[0.08]">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-white/45">{number}</span>
        <Icon className="h-5 w-5 text-[#98d7c3] transition group-hover:-translate-y-0.5" aria-hidden />
      </div>
      <h3 className="mt-8 text-lg font-semibold text-white">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-white/60">{detail}</p>
    </div>
  );
}

function GrowthScorePanel() {
  const { t } = useLanguage();
  const scorePanel = t.landing.growth.scorePanel;

  return (
    <div className="border border-line bg-white p-6">
      <div className="flex items-center gap-3">
        <BarChart3 className="h-6 w-6 text-action" aria-hidden />
        <div>
          <p className="text-xs font-semibold uppercase text-muted">{scorePanel.eyebrow}</p>
          <h3 className="mt-1 text-2xl font-semibold">{scorePanel.title}</h3>
        </div>
      </div>
      <div className="mt-6 space-y-4">
        {scorePanel.rows.map((row) => (
          <AuditRow
            key={row.title}
            title={row.title}
            score={row.score}
            issue={row.issue}
            scoreLabel={scorePanel.scoreLabel}
          />
        ))}
      </div>
    </div>
  );
}

function AuditRow({
  title,
  score,
  issue,
  scoreLabel
}: {
  title: string;
  score: string;
  issue: string;
  scoreLabel: string;
}) {
  return (
    <div className="grid gap-3 border-t border-line pt-4 sm:grid-cols-[1fr_72px] sm:items-center">
      <div>
        <h4 className="text-sm font-semibold">{title}</h4>
        <p className="mt-1 text-xs text-muted">{issue}</p>
      </div>
      <div className="text-left sm:text-right">
        <p className="text-2xl font-semibold text-action">{score}</p>
        <p className="text-[11px] uppercase text-muted">{scoreLabel}</p>
      </div>
    </div>
  );
}

function GrowthSignal({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="bg-white p-5 transition hover:bg-[#f8faf7]">
      <SearchCheck className="h-5 w-5 text-action" aria-hidden />
      <h3 className="mt-5 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted">{detail}</p>
    </div>
  );
}

function SearchEntityCard({
  icon: Icon,
  title,
  detail
}: {
  icon: LucideIcon;
  title: string;
  detail: string;
}) {
  return (
    <article className="bg-white p-5 transition hover:bg-[#f8faf7]">
      <Icon className="h-5 w-5 text-action" aria-hidden />
      <h3 className="mt-5 text-lg font-semibold">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-muted">{detail}</p>
    </article>
  );
}

function TrustLine({ icon: Icon, title, detail }: { icon: LucideIcon; title: string; detail: string }) {
  return (
    <div className="grid gap-4 bg-white p-5 lg:grid-cols-[40px_minmax(0,1fr)]">
      <div className="flex h-10 w-10 items-center justify-center border border-line bg-[#f4f5f1] text-action">
        <Icon className="h-5 w-5" aria-hidden />
      </div>
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-muted">{detail}</p>
      </div>
    </div>
  );
}

function ResourceCard({
  href,
  category,
  title,
  excerpt,
  readGuide
}: {
  href: string;
  category: string;
  title: string;
  excerpt: string;
  readGuide: string;
}) {
  return (
    <Link
      href={href}
      className="studio-focus group flex min-h-52 flex-col border border-line bg-white p-5 transition hover:-translate-y-1 hover:border-action hover:bg-[#f8faf7]"
    >
      <p className="text-sm font-semibold text-action">{category}</p>
      <h3 className="mt-4 text-xl font-semibold leading-snug">{title}</h3>
      <p className="mt-3 flex-1 text-sm leading-6 text-muted">{excerpt}</p>
      <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold">
        {readGuide}
        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
      </span>
    </Link>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="bg-white p-5">
      <h3 className="text-base font-semibold">{question}</h3>
      <p className="mt-2 text-sm leading-6 text-muted">{answer}</p>
    </div>
  );
}
