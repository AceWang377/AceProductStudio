import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Coins,
  FileText,
  ImagePlus,
  ListChecks,
  LockKeyhole,
  Send,
  ShieldCheck,
  Sparkles,
  Store
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { siteConfig } from "@/lib/site";

type HomeSearchParams = Promise<Record<string, string | string[] | undefined>>;

export const dynamic = "force-dynamic";

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

  return (
    <div className="space-y-14">
      <section className="relative left-1/2 right-1/2 -mx-[50vw] -mt-6 w-screen border-b border-line bg-[#eef4ef]">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:min-h-[calc(100svh-66px)] lg:grid-cols-[minmax(0,0.92fr)_minmax(520px,1fr)] lg:items-center lg:py-14">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-action">
              <BadgeCheck className="h-4 w-4" aria-hidden />
              Shopify-ready AI product workspace
            </p>
            <h1 className="mt-5 max-w-3xl text-5xl font-semibold leading-[1.03] sm:text-6xl">
              {siteConfig.name}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[#4f5f58]">
              Generate product media, SEO copy, price-ready listing details, and a reviewable Shopify draft from one product photo.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/login"
                className="studio-focus inline-flex h-12 items-center gap-2 rounded bg-action px-5 text-sm font-semibold text-white"
              >
                Start your first product
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/support"
                className="studio-focus inline-flex h-12 items-center rounded border border-[#c8d6cf] bg-white px-5 text-sm font-semibold"
              >
                Talk to support
              </Link>
            </div>
            <div className="mt-8 grid max-w-xl grid-cols-2 gap-x-6 gap-y-3 border-t border-[#c8d6cf] pt-5 text-sm sm:grid-cols-4">
              <TrustItem label="Draft-first" />
              <TrustItem label="OAuth stores" />
              <TrustItem label="4+ images" />
              <TrustItem label="Credits ready" />
            </div>
          </div>

          <ProductStudioPreview />
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[300px_minmax(0,1fr)]">
        <div>
          <p className="text-sm font-medium text-action">Workflow</p>
          <h2 className="mt-2 text-3xl font-semibold leading-tight">
            A cleaner path from raw photo to Shopify draft.
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <WorkflowStep
            icon={ImagePlus}
            title="Upload"
            detail="Start with the original product photo and keep it separate from generated media."
          />
          <WorkflowStep
            icon={Sparkles}
            title="Generate"
            detail="Create lifestyle, detail, intro, and white-background images in one workspace."
          />
          <WorkflowStep
            icon={FileText}
            title="Review"
            detail="Edit SEO title, description, tags, FAQ, price, and inventory before export."
          />
          <WorkflowStep
            icon={Send}
            title="Publish"
            detail="Create a Shopify draft with ordered media and retryable job history."
          />
        </div>
      </section>

      <section className="grid gap-6 border-y border-line py-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <div>
          <p className="text-sm font-medium text-action">Built for merchant trust</p>
          <h2 className="mt-2 max-w-3xl text-3xl font-semibold leading-tight">
            The product stays controlled, reviewable, and ready for paid credits later.
          </h2>
        </div>
        <div className="space-y-3">
          <TrustRow icon={ShieldCheck} title="Draft publishing by default" />
          <TrustRow icon={Store} title="Per-store Shopify OAuth" />
          <TrustRow icon={Coins} title="Credit balance already surfaced" />
          <TrustRow icon={LockKeyhole} title="Server-side store token handling" />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <LandingFeature
          icon={Store}
          title="Connect each store"
          detail="Every user connects their own Shopify store. No shared store tokens, no manual credential pasting for normal users."
        />
        <LandingFeature
          icon={ListChecks}
          title="Know what is ready"
          detail="Checklist and quality states make it clear when copy, media, pricing, and inventory are ready to publish."
        />
        <LandingFeature
          icon={CheckCircle2}
          title="Designed for production"
          detail="Products, jobs, stores, generated images, credits, and usage history already use persistent Supabase-backed storage."
        />
      </section>

      <section className="border border-line bg-white p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-action">Ready to try the flow?</p>
            <h2 className="mt-2 text-2xl font-semibold">Upload one product and publish the first draft.</h2>
          </div>
          <Link
            href="/login"
            className="studio-focus inline-flex h-11 items-center justify-center gap-2 rounded bg-action px-4 text-sm font-semibold text-white"
          >
            Open studio
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </section>
    </div>
  );
}

function ProductStudioPreview() {
  return (
    <div className="relative">
      <div className="border border-[#bccdc5] bg-white p-3 shadow-soft">
        <div className="flex items-center justify-between border-b border-line px-2 pb-3">
          <div>
            <p className="text-xs font-medium uppercase text-muted">Live workflow preview</p>
            <h2 className="mt-1 text-lg font-semibold">Product draft workspace</h2>
          </div>
          <span className="rounded bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-800">
            Ready
          </span>
        </div>

        <div className="grid gap-3 pt-3 sm:grid-cols-[1fr_180px]">
          <div className="grid grid-cols-2 gap-2">
            <ProductImage
              label="Lifestyle"
              src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80"
            />
            <ProductImage
              label="Detail"
              src="https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=800&q=80"
            />
            <ProductImage
              label="Intro"
              src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80"
            />
            <div className="relative min-h-32 border border-line bg-[#f9faf8] p-3">
              <span className="absolute left-2 top-2 rounded bg-white px-2 py-1 text-xs font-semibold">
                White BG
              </span>
              <div className="grid h-full place-items-center">
                <div className="h-20 w-20 rounded-full border border-line bg-white shadow-soft" />
              </div>
            </div>
          </div>

          <div className="space-y-3 border border-line bg-canvas p-3">
            <div>
              <p className="text-xs font-medium uppercase text-muted">Shopify preview</p>
              <h3 className="mt-1 text-base font-semibold leading-6">
                Premium Product Listing
              </h3>
              <p className="mt-2 text-xs leading-5 text-muted">
                SEO title, bullets, tags, price, and inventory are ready for review.
              </p>
            </div>
            <PreviewMetric label="Media" value="4 images" />
            <PreviewMetric label="Status" value="Draft" />
            <PreviewMetric label="Store" value="OAuth connected" />
            <div className="h-9 rounded bg-action px-3 py-2 text-center text-xs font-semibold text-white">
              Publish as draft
            </div>
          </div>
        </div>

        <div className="mt-3 grid gap-2 border-t border-line pt-3 text-xs sm:grid-cols-4">
          <PreviewPill label="Lifestyle first" />
          <PreviewPill label="Copy checked" />
          <PreviewPill label="Price set" />
          <PreviewPill label="Inventory set" />
        </div>
      </div>
    </div>
  );
}

function ProductImage({ label, src }: { label: string; src: string }) {
  return (
    <div className="relative min-h-32 overflow-hidden border border-line bg-white">
      <img
        src={src}
        alt=""
        className="h-full min-h-32 w-full object-cover"
        loading="lazy"
      />
      <span className="absolute left-2 top-2 rounded bg-white/95 px-2 py-1 text-xs font-semibold">
        {label}
      </span>
    </div>
  );
}

function PreviewMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-t border-line pt-2">
      <span className="text-xs text-muted">{label}</span>
      <span className="text-xs font-semibold">{value}</span>
    </div>
  );
}

function TrustItem({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm font-medium text-[#284139]">
      <CheckCircle2 className="h-4 w-4 text-action" aria-hidden />
      {label}
    </span>
  );
}

function TrustRow({
  icon: Icon,
  title
}: {
  icon: LucideIcon;
  title: string;
}) {
  return (
    <div className="flex items-center gap-3 border border-line bg-white p-3">
      <span className="flex h-9 w-9 items-center justify-center rounded bg-canvas text-action">
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <span className="text-sm font-semibold">{title}</span>
    </div>
  );
}

function PreviewPill({ label }: { label: string }) {
  return (
    <span className="border border-line bg-white px-2 py-1 text-center text-xs font-medium">
      {label}
    </span>
  );
}

function WorkflowStep({
  icon: Icon,
  title,
  detail
}: {
  icon: LucideIcon;
  title: string;
  detail: string;
}) {
  return (
    <div className="border border-line bg-white p-4">
      <span className="flex h-9 w-9 items-center justify-center rounded bg-canvas text-action">
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <h3 className="mt-4 text-base font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted">{detail}</p>
    </div>
  );
}

function LandingFeature({
  icon: Icon,
  title,
  detail
}: {
  icon: LucideIcon;
  title: string;
  detail: string;
}) {
  return (
    <div className="border border-line bg-white p-5">
      <Icon className="h-5 w-5 text-action" aria-hidden />
      <h2 className="mt-4 text-lg font-semibold">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted">{detail}</p>
    </div>
  );
}
