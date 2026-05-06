import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Coins,
  FileText,
  ImagePlus,
  LineChart,
  LockKeyhole,
  SearchCheck,
  Send,
  ShieldCheck,
  Sparkles,
  Store,
  WandSparkles
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { seoResourceList } from "@/lib/seo-resources";
import { siteConfig } from "@/lib/site";

type HomeSearchParams = Promise<Record<string, string | string[] | undefined>>;

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "AceStudio | Shopify AI SEO & GEO Product Listing Generator",
  description:
    "AceStudio turns one product photo into Shopify-ready generated images, SEO and GEO product copy, pricing details, inventory fields, and a draft listing ready for review.",
  alternates: {
    canonical: "/"
  }
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function HomePage({
  searchParams
}: {
  searchParams?: HomeSearchParams;
}) {
  const params = searchParams ? await searchParams : {};
  const code = firstParam(params.code);
  const next = firstParam(params.next) || "/dashboard";

  if (code) {
    redirect(`/auth/callback?code=${encodeURIComponent(code)}&next=${encodeURIComponent(next)}`);
  }

  const user = await getCurrentUser();
  if (user) redirect("/dashboard");
  const jsonLd = getHomeStructuredData();

  return (
    <div className="space-y-0">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="relative left-1/2 right-1/2 -mx-[50vw] -mt-6 min-h-[calc(100svh-66px)] w-screen overflow-hidden border-b border-line bg-[#f4f5f1]">
        <div className="absolute inset-0 opacity-[0.45] landing-grid" aria-hidden />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:min-h-[calc(100svh-66px)] lg:grid-cols-[minmax(0,0.9fr)_minmax(520px,1fr)] lg:items-center lg:py-16">
          <div className="landing-reveal">
            <p className="inline-flex items-center gap-2 border border-[#c8d6cf] bg-white/70 px-3 py-1.5 text-sm font-semibold text-action">
              <BadgeCheck className="h-4 w-4" aria-hidden />
              Shopify AI product and growth workspace
            </p>
            <h1 className="mt-7 max-w-4xl text-6xl font-semibold leading-[0.96] tracking-tight text-ink sm:text-7xl lg:text-8xl">
              AceStudio
            </h1>
            <h2 className="mt-6 max-w-3xl text-3xl font-semibold leading-tight text-[#263a33] sm:text-5xl">
              Generate Shopify product content. Then improve how it ranks.
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
              From one product photo, create draft-ready media and copy, audit product SEO/GEO quality, and confirm selected improvements before writing back to Shopify.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/login"
                className="studio-focus group inline-flex h-12 items-center gap-2 bg-action px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#0c5d4b]"
              >
                Start with Product Studio
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
              </Link>
              <Link
                href="/shopify-seo-geo-optimizer"
                className="studio-focus inline-flex h-12 items-center border border-[#c8d6cf] bg-white/80 px-5 text-sm font-semibold transition hover:-translate-y-0.5 hover:border-action"
              >
                Explore Growth Studio
              </Link>
            </div>
          </div>

          <HeroTerminal />
        </div>
      </section>

      <section className="border-b border-line bg-white">
        <div className="mx-auto grid max-w-7xl divide-y divide-line px-4 sm:px-6 md:grid-cols-4 md:divide-x md:divide-y-0 md:px-6">
          <ProofMetric value="2" label="Core workflows" detail="Product Studio and Growth Studio." />
          <ProofMetric value="4+" label="Media outputs" detail="Lifestyle, detail, intro, and white background." />
          <ProofMetric value="OAuth" label="Store connection" detail="Users connect their own Shopify store." />
          <ProofMetric value="Draft" label="Default publish mode" detail="Review before anything goes live." />
        </div>
      </section>

      <SectionShell eyebrow="Platform" title="Two workspaces, one Shopify growth loop.">
        <div className="grid gap-0 border border-line bg-white lg:grid-cols-2">
          <WorkspacePanel
            icon={WandSparkles}
            title="Product Studio"
            detail="Upload a product image, generate media and listing copy, review price and inventory, then publish a Shopify draft."
            href="/shopify-ai-product-listing-generator"
            action="View product workflow"
            items={["Image generation", "SEO copy editor", "Media ordering", "Draft publishing"]}
          />
          <WorkspacePanel
            icon={SearchCheck}
            title="Growth Studio"
            detail="Audit connected Shopify products, score SEO/GEO quality, preview fixes, and write improvements only after confirmation."
            href="/shopify-seo-geo-optimizer"
            action="View growth workflow"
            items={["SEO scoring", "GEO scoring", "Suggested fixes", "Confirm-to-apply"]}
          />
        </div>
      </SectionShell>

      <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen overflow-hidden border-y border-line bg-[#14231d] text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:py-20">
          <div className="landing-reveal">
            <p className="text-sm font-semibold text-[#98d7c3]">Product control surface</p>
            <h2 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">
              A reviewable product record before Shopify receives changes.
            </h2>
            <p className="mt-5 max-w-2xl text-sm leading-6 text-[#c7d7d0]">
              The interface keeps generated media, SEO copy, commerce fields, publish history, and quality checks together so users can inspect the full product before committing.
            </p>
          </div>
          <ProductControlSurface />
        </div>
      </section>

      <SectionShell eyebrow="Workflow" title="From raw photo to optimized Shopify product.">
        <div className="grid border-y border-line md:grid-cols-4">
          <WorkflowStep
            number="01"
            icon={ImagePlus}
            title="Upload"
            detail="Start with one original product photo and a short product brief."
          />
          <WorkflowStep
            number="02"
            icon={Sparkles}
            title="Generate"
            detail="Create ordered product media and Shopify SEO copy in one workspace."
          />
          <WorkflowStep
            number="03"
            icon={FileText}
            title="Review"
            detail="Edit copy, tags, FAQ, price, inventory, and media ordering."
          />
          <WorkflowStep
            number="04"
            icon={Send}
            title="Publish"
            detail="Create a Shopify draft or confirm selected Growth Studio updates."
          />
        </div>
      </SectionShell>

      <SectionShell
        eyebrow="SEO and GEO"
        title="A growth layer for Shopify stores that need more than generated copy."
        intro="Growth Studio is designed to score product pages, identify missing search and AI-answer signals, and provide confirmable updates instead of silently overwriting store content."
      >
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <GrowthScorePanel />
          <div className="grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2">
            <GrowthSignal title="Search intent" detail="Titles, meta descriptions, tags, and buyer phrases aligned to product demand." />
            <GrowthSignal title="AI answer clarity" detail="Facts, use cases, comparisons, and FAQs that make product pages easier to summarize." />
            <GrowthSignal title="Media context" detail="Image labels and future alt text workflows for richer visual search signals." />
            <GrowthSignal title="Controlled write-back" detail="Users preview updates first, then explicitly confirm Shopify changes." />
          </div>
        </div>
      </SectionShell>

      <section className="border-y border-line bg-white">
        <div className="mx-auto grid max-w-7xl gap-0 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="border-line py-12 lg:border-r lg:pr-10">
            <p className="text-sm font-semibold text-action">Operating model</p>
            <h2 className="mt-3 text-4xl font-semibold leading-tight">
              Built for merchant trust before payments scale.
            </h2>
          </div>
          <div className="grid divide-y divide-line lg:divide-y">
            <TrustLine icon={ShieldCheck} title="Draft-first publishing" detail="The normal product flow creates a Shopify draft so users can review in Admin." />
            <TrustLine icon={Store} title="Per-store OAuth" detail="Every user connects their own Shopify store without sharing manual tokens." />
            <TrustLine icon={Coins} title="Credits-ready usage model" detail="Balances and usage history are already surfaced before Stripe goes fully live." />
            <TrustLine icon={LockKeyhole} title="Server-side token handling" detail="Sensitive Shopify credentials stay server-side and can be encrypted before real users scale." />
          </div>
        </div>
      </section>

      <SectionShell eyebrow="Resources" title="Guides that support search trust.">
        <div className="grid gap-4 md:grid-cols-3">
          {seoResourceList.slice(0, 3).map((article) => (
            <ResourceCard
              key={article.slug}
              href={`/resources/${article.slug}`}
              category={article.category}
              title={article.title}
              excerpt={article.excerpt}
            />
          ))}
        </div>
      </SectionShell>

      <SectionShell eyebrow="FAQ" title="What merchants usually ask first.">
        <div className="grid gap-px overflow-hidden border border-line bg-line md:grid-cols-3">
          <FaqItem
            question="Does it publish live by default?"
            answer="No. The safe path creates a Shopify draft first. Growth changes also require explicit confirmation."
          />
          <FaqItem
            question="Can each user connect their own store?"
            answer="Yes. Shopify OAuth is built around per-user store connections."
          />
          <FaqItem
            question="Is Growth Studio automatic?"
            answer="No. It audits and suggests first, then writes selected SEO/GEO improvements only after confirmation."
          />
        </div>
      </SectionShell>

      <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen border-t border-line bg-[#f4f5f1]">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-12 sm:px-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-action">Ready to try the flow?</p>
            <h2 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight">
              Build the first Shopify-ready product, then measure what needs to improve.
            </h2>
          </div>
          <Link
            href="/login"
            className="studio-focus group inline-flex h-12 items-center justify-center gap-2 bg-action px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5"
          >
            Open AceStudio
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
          </Link>
        </div>
      </section>
    </div>
  );
}

function getHomeStructuredData() {
  return [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: siteConfig.name,
      url: siteConfig.url,
      description:
        "AceStudio is a Shopify AI product workspace for product images, SEO copy, GEO-ready product content, and draft publishing.",
      inLanguage: "en"
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: siteConfig.name,
      legalName: siteConfig.company,
      url: siteConfig.url,
      logo: `${siteConfig.url}/brand/ace-studio-logo.png`,
      contactPoint: {
        "@type": "ContactPoint",
        email: siteConfig.supportEmail,
        contactType: "customer support"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: siteConfig.name,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: siteConfig.url,
      description:
        "AI product content workspace for Shopify merchants to generate product images, SEO and GEO copy, pricing details, inventory fields, and draft listings.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        description: "Free trial credits available before paid credit packs are enabled."
      },
      featureList: [
        "AI product image generation",
        "Shopify SEO product copy generation",
        "Shopify GEO product content guidance",
        "Shopify OAuth store connection",
        "Draft-first Shopify product publishing",
        "Credit usage history"
      ],
      provider: {
        "@type": "Organization",
        name: siteConfig.company,
        url: siteConfig.url
      }
    }
  ];
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
  return (
    <div className="landing-reveal landing-reveal-delay relative hero-float">
      <div className="border border-[#c5d1cb] bg-[#101916] p-3 text-white shadow-soft">
        <div className="flex items-center justify-between border-b border-white/10 px-2 pb-3">
          <div>
            <p className="text-xs font-medium uppercase text-white/45">AceStudio live workspace</p>
            <h2 className="mt-1 text-lg font-semibold">Draft product operating system</h2>
          </div>
          <span className="border border-[#98d7c3]/30 bg-[#18352c] px-2 py-1 text-xs font-semibold text-[#98d7c3]">
            Connected
          </span>
        </div>

        <div className="grid gap-3 pt-3 sm:grid-cols-[1fr_190px]">
          <div className="grid grid-cols-2 gap-2">
            <PreviewImage label="Lifestyle" src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80" />
            <PreviewImage label="Detail" src="https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=800&q=80" />
            <PreviewImage label="Intro" src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80" />
            <div className="relative min-h-36 border border-white/10 bg-white p-3">
              <span className="absolute left-2 top-2 bg-[#f4f5f1] px-2 py-1 text-xs font-semibold text-ink">
                White BG
              </span>
              <div className="grid h-full place-items-center">
                <div className="h-20 w-20 rounded-full border border-line bg-white shadow-soft" />
              </div>
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.04] p-3">
            <p className="text-xs font-medium uppercase text-white/45">Shopify draft</p>
            <h3 className="mt-2 text-base font-semibold leading-6">Premium product listing</h3>
            <p className="mt-2 text-xs leading-5 text-white/55">
              Media, SEO copy, price, inventory, and publish status are ready for review.
            </p>
            <div className="mt-4 space-y-2">
              <PreviewMetric label="Media" value="4 images" />
              <PreviewMetric label="SEO" value="86/100" />
              <PreviewMetric label="GEO" value="78/100" />
              <PreviewMetric label="Status" value="Draft" />
            </div>
          </div>
        </div>

        <div className="mt-3 grid gap-px overflow-hidden bg-white/10 text-xs sm:grid-cols-4">
          <PreviewPill label="Lifestyle first" />
          <PreviewPill label="Copy checked" />
          <PreviewPill label="Price set" />
          <PreviewPill label="Inventory set" />
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
    <div className="group p-5 transition hover:bg-[#f4f5f1]">
      <p className="text-4xl font-semibold tracking-tight text-ink transition group-hover:-translate-y-0.5">{value}</p>
      <p className="mt-3 text-sm font-semibold">{label}</p>
      <p className="mt-1 text-xs leading-5 text-muted">{detail}</p>
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
  return (
    <div className="landing-reveal landing-reveal-delay border border-white/10 bg-white/[0.04] p-3">
      <div className="grid gap-3 lg:grid-cols-[180px_minmax(0,1fr)_230px]">
        <aside className="hidden border border-white/10 bg-[#101916] p-4 lg:block">
          <p className="text-sm font-semibold">AceStudio</p>
          <div className="mt-6 space-y-2 text-xs text-white/55">
            {["Product Studio", "Growth Studio", "Account"].map((item, index) => (
              <div key={item} className={index === 0 ? "bg-white/10 px-3 py-2 text-white" : "px-3 py-2"}>
                {item}
              </div>
            ))}
          </div>
        </aside>
        <div className="border border-white/10 bg-[#f4f5f1] p-4 text-ink">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <div>
              <p className="text-xs font-semibold uppercase text-muted">Product record</p>
              <h3 className="mt-1 text-xl font-semibold">Generated listing review</h3>
            </div>
            <span className="bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-800">Ready</span>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <ControlField label="SEO title" value="Minimal Black Running Shoe for Daily Training" />
            <ControlField label="Commerce" value="$79.00 · SKU ready · 42 in stock" />
            <ControlField label="Tags" value="running shoe, black trainer, daily wear" />
            <ControlField label="Publish mode" value="Shopify draft first" />
          </div>
        </div>
        <div className="border border-white/10 bg-[#101916] p-4">
          <LineChart className="h-5 w-5 text-[#98d7c3]" aria-hidden />
          <h3 className="mt-4 text-lg font-semibold">Growth audit</h3>
          <div className="mt-5 space-y-4">
            <ScoreLine label="SEO score" value="86" />
            <ScoreLine label="GEO score" value="78" />
            <ScoreLine label="Readiness" value="92" />
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
    <div className="group border-b border-line bg-white p-5 transition hover:bg-[#f8faf7] md:border-b-0 md:border-r md:last:border-r-0">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted">{number}</span>
        <Icon className="h-5 w-5 text-action transition group-hover:-translate-y-0.5" aria-hidden />
      </div>
      <h3 className="mt-10 text-xl font-semibold">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-muted">{detail}</p>
    </div>
  );
}

function GrowthScorePanel() {
  return (
    <div className="border border-line bg-white p-6">
      <div className="flex items-center gap-3">
        <BarChart3 className="h-6 w-6 text-action" aria-hidden />
        <div>
          <p className="text-xs font-semibold uppercase text-muted">Connected store audit</p>
          <h3 className="mt-1 text-2xl font-semibold">Lowest scoring products first</h3>
        </div>
      </div>
      <div className="mt-6 space-y-4">
        <AuditRow title="Black Training Shoe" score="62" issue="Missing buyer Q&A and image context" />
        <AuditRow title="Daily Crossbody Bag" score="74" issue="Meta description needs search intent" />
        <AuditRow title="Minimal Desk Lamp" score="81" issue="Comparison context can be stronger" />
      </div>
    </div>
  );
}

function AuditRow({ title, score, issue }: { title: string; score: string; issue: string }) {
  return (
    <div className="grid gap-3 border-t border-line pt-4 sm:grid-cols-[1fr_72px] sm:items-center">
      <div>
        <h4 className="text-sm font-semibold">{title}</h4>
        <p className="mt-1 text-xs text-muted">{issue}</p>
      </div>
      <div className="text-left sm:text-right">
        <p className="text-2xl font-semibold text-action">{score}</p>
        <p className="text-[11px] uppercase text-muted">score</p>
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

function TrustLine({ icon: Icon, title, detail }: { icon: LucideIcon; title: string; detail: string }) {
  return (
    <div className="grid gap-4 py-6 lg:grid-cols-[48px_minmax(0,1fr)]">
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
  excerpt
}: {
  href: string;
  category: string;
  title: string;
  excerpt: string;
}) {
  return (
    <Link
      href={href}
      className="studio-focus group flex min-h-64 flex-col border border-line bg-white p-5 transition hover:-translate-y-1 hover:border-action hover:bg-[#f8faf7]"
    >
      <p className="text-sm font-semibold text-action">{category}</p>
      <h3 className="mt-4 text-xl font-semibold leading-snug">{title}</h3>
      <p className="mt-3 flex-1 text-sm leading-6 text-muted">{excerpt}</p>
      <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold">
        Read guide
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
