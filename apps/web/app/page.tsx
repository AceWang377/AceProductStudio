import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  ImagePlus,
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
    <div className="space-y-10">
      <section className="grid gap-8 border-b border-line pb-10 lg:grid-cols-[minmax(0,1fr)_430px] lg:items-center">
        <div>
          <p className="inline-flex items-center gap-2 text-sm font-medium text-action">
            <Sparkles className="h-4 w-4" aria-hidden />
            Shopify product publishing workspace
          </p>
          <h1 className="mt-4 max-w-3xl text-5xl font-semibold leading-tight">
            {siteConfig.name}
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">
            Turn one product photo into generated product media, SEO copy, pricing-ready listing details, and a Shopify draft you can review before publishing.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/login"
              className="studio-focus inline-flex h-11 items-center gap-2 rounded bg-action px-4 text-sm font-semibold text-white"
            >
              Start with email
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/support"
              className="studio-focus inline-flex h-11 items-center rounded border border-line bg-white px-4 text-sm font-semibold"
            >
              Contact support
            </Link>
          </div>
        </div>

        <div className="border border-line bg-white p-4 shadow-soft">
          <div className="grid grid-cols-[112px_minmax(0,1fr)] gap-4 border-b border-line pb-4">
            <div className="aspect-square border border-line bg-canvas p-3">
              <div className="h-full w-full bg-[linear-gradient(135deg,#ffffff_0%,#ffffff_40%,#cbe7dc_41%,#cbe7dc_62%,#171a1f_63%,#171a1f_100%)]" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase text-muted">Preview listing</p>
              <h2 className="mt-2 text-xl font-semibold leading-7">
                Product draft ready for Shopify
              </h2>
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <PreviewPill label="4 media" />
                <PreviewPill label="SEO copy" />
                <PreviewPill label="Price" />
                <PreviewPill label="Inventory" />
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <WorkflowStep
              icon={ImagePlus}
              title="Upload product photo"
              detail="Keep the original separate from generated Shopify media."
            />
            <WorkflowStep
              icon={Sparkles}
              title="Generate image set"
              detail="Lifestyle first, detail shots in the middle, white background last."
            />
            <WorkflowStep
              icon={FileText}
              title="Review listing copy"
              detail="Edit title, description, tags, FAQ, price, and inventory before publish."
            />
            <WorkflowStep
              icon={Send}
              title="Publish draft"
              detail="Send to the connected Shopify store as a draft by default."
            />
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <LandingFeature
          icon={Store}
          title="Per-store connection"
          detail="Each user connects their own Shopify store through OAuth, so product publishing does not require manual token pasting."
        />
        <LandingFeature
          icon={ShieldCheck}
          title="Draft-first control"
          detail="Listings are designed to publish as drafts first, with a visible checklist and retry logs before anything goes live."
        />
        <LandingFeature
          icon={CheckCircle2}
          title="Production workflow"
          detail="Products, jobs, stores, generated images, and credits are stored in Supabase instead of local JSON files."
        />
      </section>
    </div>
  );
}

function PreviewPill({ label }: { label: string }) {
  return (
    <span className="border border-line bg-canvas px-2 py-1 text-center text-xs font-medium">
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
    <div className="grid grid-cols-[36px_minmax(0,1fr)] gap-3">
      <span className="flex h-9 w-9 items-center justify-center rounded bg-canvas text-action">
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <span>
        <span className="block text-sm font-semibold">{title}</span>
        <span className="mt-1 block text-sm leading-6 text-muted">{detail}</span>
      </span>
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
