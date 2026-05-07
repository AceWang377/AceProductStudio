import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  CircleAlert,
  ClipboardCheck,
  ExternalLink,
  Rocket
} from "lucide-react";
import {
  getLaunchReadiness,
  summarizeReadiness,
  type ReadinessCheck,
  type ReadinessStatus
} from "@/lib/launch-readiness";
import { requireCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const statusCopy: Record<ReadinessStatus, { label: string; className: string }> = {
  ready: {
    label: "Ready",
    className: "border-emerald-200 bg-emerald-50 text-emerald-900"
  },
  warning: {
    label: "Optional",
    className: "border-amber-200 bg-amber-50 text-amber-900"
  },
  missing: {
    label: "Missing",
    className: "border-red-200 bg-red-50 text-red-900"
  }
};

export default async function LaunchPage() {
  await requireCurrentUser();
  const groups = await getLaunchReadiness();
  const summary = summarizeReadiness(groups);
  const nextFix = getNextFix(groups);

  return (
    <div className="space-y-6">
      <section className="grid gap-5 border-b border-line pb-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div>
          <p className="text-sm text-muted">Production readiness</p>
          <h1 className="mt-1 text-3xl font-semibold">Launch checklist</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
            A private setup view for confirming the app is ready for real users: login,
            Supabase tables, OpenAI, Shopify OAuth, credits, and billing.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="studio-focus inline-flex h-10 items-center gap-2 rounded border border-line bg-white px-4 text-sm font-semibold hover:bg-canvas"
            >
              Open dashboard
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/settings/shopify"
              className="studio-focus inline-flex h-10 items-center gap-2 rounded bg-action px-4 text-sm font-semibold text-white"
            >
              Connect Shopify
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/qa"
              className="studio-focus inline-flex h-10 items-center gap-2 rounded border border-line bg-white px-4 text-sm font-semibold hover:bg-canvas"
            >
              Run release QA
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
        <div className="border border-line bg-white p-5">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded bg-emerald-50 text-action">
              <Rocket className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <p className="text-2xl font-semibold">
                {summary.ready}/{summary.total}
              </p>
              <p className="text-sm text-muted">checks ready</p>
            </div>
          </div>
          <div className="mt-5 h-2 overflow-hidden rounded bg-canvas">
            <div
              className="h-full rounded bg-action"
              style={{ width: `${Math.round((summary.ready / summary.total) * 100)}%` }}
            />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <Metric label="Blockers" value={summary.missing} tone={summary.missing ? "error" : "ready"} />
            <Metric label="Optional" value={summary.warnings} tone={summary.warnings ? "warning" : "ready"} />
          </div>
        </div>
      </section>

      {summary.launchReady ? (
        <Notice
          tone="success"
          title="No blocking launch issues found"
          body="The required app configuration and database checks are passing. Optional billing settings can still be completed later."
        />
      ) : (
        <Notice
          tone="error"
          title="Launch blockers remain"
          body="Fix the missing checks below, redeploy if env vars changed, then refresh this page."
        />
      )}

      {nextFix ? (
        <section className="grid gap-4 border border-line bg-white p-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              Recommended next fix
            </p>
            <h2 className="mt-2 text-lg font-semibold">{nextFix.label}</h2>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-muted">{nextFix.action}</p>
          </div>
          <FixAction check={nextFix} variant="primary" />
        </section>
      ) : null}

      <section className="grid gap-5 lg:grid-cols-2">
        {groups.map((group) => (
          <div key={group.title} className="border border-line bg-white">
            <div className="border-b border-line p-5">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5 text-action" aria-hidden />
                <h2 className="text-lg font-semibold">{group.title}</h2>
              </div>
              <p className="mt-2 text-sm text-muted">{group.description}</p>
            </div>
            <div className="divide-y divide-line">
              {group.checks.map((check) => (
                <ReadinessRow key={`${group.title}-${check.label}`} check={check} />
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

function getNextFix(groups: Awaited<ReturnType<typeof getLaunchReadiness>>) {
  const checks = groups.flatMap((group) => group.checks);
  return checks.find((check) => check.status === "missing") ?? checks.find((check) => check.status === "warning");
}

function ReadinessRow({ check }: { check: ReadinessCheck }) {
  const StatusIcon =
    check.status === "ready" ? CheckCircle2 : check.status === "warning" ? AlertTriangle : CircleAlert;
  const status = statusCopy[check.status];

  return (
    <div className="grid gap-3 p-4 text-sm sm:grid-cols-[auto_1fr_auto]">
      <StatusIcon
        className={`mt-0.5 h-5 w-5 ${
          check.status === "ready"
            ? "text-action"
            : check.status === "warning"
              ? "text-amber-600"
              : "text-red-600"
        }`}
        aria-hidden
      />
      <div className="min-w-0">
        <p className="font-semibold">{check.label}</p>
        <p className="mt-1 break-words text-muted">{check.detail}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <p className="break-words text-xs text-muted">{check.action}</p>
          <FixAction check={check} />
        </div>
      </div>
      <span className={`h-8 rounded border px-3 py-1 text-xs font-semibold ${status.className}`}>
        {status.label}
      </span>
    </div>
  );
}

function FixAction({ check, variant = "secondary" }: { check: ReadinessCheck; variant?: "primary" | "secondary" }) {
  if (!check.actionHref || !check.actionLabel) {
    return null;
  }

  const className =
    variant === "primary"
      ? "studio-focus inline-flex h-10 items-center justify-center gap-2 rounded bg-action px-4 text-sm font-semibold text-white"
      : "studio-focus inline-flex h-8 items-center justify-center gap-1 rounded border border-line bg-white px-3 text-xs font-semibold hover:bg-canvas";
  const icon = check.actionHref.startsWith("/") ? (
    <ArrowUpRight className="h-4 w-4" aria-hidden />
  ) : (
    <ExternalLink className="h-4 w-4" aria-hidden />
  );

  if (check.actionHref.startsWith("/")) {
    return (
      <Link href={check.actionHref} className={className}>
        {check.actionLabel}
        {icon}
      </Link>
    );
  }

  return (
    <a href={check.actionHref} className={className} target="_blank" rel="noreferrer">
      {check.actionLabel}
      {icon}
    </a>
  );
}

function Metric({
  label,
  value,
  tone
}: {
  label: string;
  value: number;
  tone: "ready" | "warning" | "error";
}) {
  const toneClass = {
    ready: "text-action",
    warning: "text-amber-700",
    error: "text-red-700"
  }[tone];

  return (
    <div className="border border-line bg-canvas p-3">
      <p className={`text-xl font-semibold ${toneClass}`}>{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}

function Notice({
  tone,
  title,
  body
}: {
  tone: "success" | "error";
  title: string;
  body: string;
}) {
  const styles = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-900",
    error: "border-red-200 bg-red-50 text-red-900"
  }[tone];
  const Icon = tone === "success" ? CheckCircle2 : CircleAlert;

  return (
    <div className={`max-w-3xl border p-4 text-sm ${styles}`}>
      <div className="flex gap-3">
        <Icon className="mt-0.5 h-5 w-5 flex-none" aria-hidden />
        <div>
          <p className="font-semibold">{title}</p>
          <p className="mt-1">{body}</p>
        </div>
      </div>
    </div>
  );
}
