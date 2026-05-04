import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2, ImagePlus, ShieldCheck, Store } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { LoginForm } from "@/components/auth/LoginForm";
import { getCurrentUser } from "@/lib/auth";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-dynamic";

type LoginSearchParams = Promise<Record<string, string | string[] | undefined>>;

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function safeNextPath(value?: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/dashboard";
  return value;
}

export default async function LoginPage({
  searchParams
}: {
  searchParams?: LoginSearchParams;
}) {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");
  const params = searchParams ? await searchParams : {};
  const nextPath = safeNextPath(firstParam(params.next));
  const error = firstParam(params.error);

  return (
    <div className="grid min-h-[70vh] gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_430px] lg:items-center">
      <section>
        <p className="text-sm font-medium text-action">Secure workspace access</p>
        <h1 className="mt-3 max-w-2xl text-4xl font-semibold leading-tight">
          Sign in to {siteConfig.name}
        </h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-muted">
          Access your product drafts, connected Shopify store, generated media, job history, and credit balance from one account.
        </p>
        <div className="mt-8 max-w-xl divide-y divide-line border-y border-line">
          <LoginStep
            icon={ImagePlus}
            title="Create product drafts"
            detail="Upload one product photo, then build a complete listing workflow from it."
          />
          <LoginStep
            icon={Store}
            title="Connect your Shopify store"
            detail="OAuth keeps the connection saved to your account without exposing store tokens in the browser."
          />
          <LoginStep
            icon={CheckCircle2}
            title="Publish as draft"
            detail="Review media, copy, price, inventory, and checklist status before sending to Shopify."
          />
        </div>
      </section>

      <aside className="space-y-4">
        <LoginForm initialStatus={error} nextPath={nextPath} />
        <div className="border border-line bg-white p-5">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-action" aria-hidden />
            <div>
              <h2 className="text-sm font-semibold">Account safety</h2>
              <p className="mt-1 text-sm leading-6 text-muted">
                Sign-in links expire automatically. Use the same email each time to return to your own workspace.
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <Link className="text-action" href="/support">
              Support
            </Link>
            <Link className="text-action" href="/privacy">
              Privacy policy
            </Link>
          </div>
        </div>
      </aside>
    </div>
  );
}

function LoginStep({
  icon: Icon,
  title,
  detail
}: {
  icon: LucideIcon;
  title: string;
  detail: string;
}) {
  return (
    <div className="grid grid-cols-[36px_minmax(0,1fr)] gap-3 py-4">
      <span className="flex h-9 w-9 items-center justify-center rounded bg-white text-action">
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <span>
        <span className="block text-sm font-semibold">{title}</span>
        <span className="mt-1 block text-sm leading-6 text-muted">{detail}</span>
      </span>
    </div>
  );
}
