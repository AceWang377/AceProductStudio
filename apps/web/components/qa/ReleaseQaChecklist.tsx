"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, CircleAlert, ClipboardCheck, ExternalLink, RotateCcw } from "lucide-react";
import type { QaStep, QaStepStatus } from "@/lib/qa-suite";

type StepState = {
  status: QaStepStatus;
  notes: string;
};

type QaState = Record<string, StepState>;

const statusOptions: Array<{ value: QaStepStatus; label: string }> = [
  { value: "pending", label: "Pending" },
  { value: "pass", label: "Pass" },
  { value: "fail", label: "Fail" },
  { value: "blocked", label: "Blocked" }
];

function getStorageKey(version: string) {
  return `acestudio-release-qa:${version}`;
}

function createInitialState(steps: QaStep[]): QaState {
  return Object.fromEntries(
    steps.map((step) => [
      step.id,
      {
        status: "pending",
        notes: ""
      }
    ])
  );
}

export function ReleaseQaChecklist({
  version,
  steps
}: {
  version: string;
  steps: QaStep[];
}) {
  const initialState = useMemo(() => createInitialState(steps), [steps]);
  const [state, setState] = useState<QaState>(initialState);
  const [isLoaded, setIsLoaded] = useState(false);
  const storageKey = getStorageKey(version);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (!saved) {
        setIsLoaded(true);
        return;
      }
      const parsed = JSON.parse(saved) as QaState;
      setState({
        ...initialState,
        ...parsed
      });
    } catch {
      setState(initialState);
    }
    setIsLoaded(true);
  }, [initialState, storageKey]);

  useEffect(() => {
    if (!isLoaded) return;
    window.localStorage.setItem(storageKey, JSON.stringify(state));
  }, [isLoaded, state, storageKey]);

  const summary = steps.reduce(
    (result, step) => {
      const status = state[step.id]?.status ?? "pending";
      result[status] += 1;
      return result;
    },
    { pending: 0, pass: 0, fail: 0, blocked: 0 } satisfies Record<QaStepStatus, number>
  );
  const done = summary.pass;
  const total = steps.length;
  const completion = total ? Math.round((done / total) * 100) : 0;

  function updateStep(stepId: string, patch: Partial<StepState>) {
    setState((current) => ({
      ...current,
      [stepId]: {
        status: current[stepId]?.status ?? "pending",
        notes: current[stepId]?.notes ?? "",
        ...patch
      }
    }));
  }

  function resetSuite() {
    setState(initialState);
  }

  return (
    <div className="space-y-5">
      <section className="grid gap-4 border border-line bg-white p-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-action" aria-hidden />
            <h2 className="text-lg font-semibold">Run status</h2>
          </div>
          <p className="mt-2 text-sm leading-6 text-muted">
            This progress is saved in this browser so the admin tester can pause, collect evidence, and resume the same QA run.
          </p>
          <div className="mt-5 h-2 overflow-hidden rounded bg-canvas">
            <div className="h-full rounded bg-action" style={{ width: `${completion}%` }} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <Metric label="Passed" value={summary.pass} tone="ready" />
          <Metric label="Failed" value={summary.fail} tone="error" />
          <Metric label="Blocked" value={summary.blocked} tone="warning" />
          <Metric label="Pending" value={summary.pending} tone="neutral" />
          <button
            type="button"
            onClick={resetSuite}
            className="studio-focus col-span-2 inline-flex h-10 items-center justify-center gap-2 rounded border border-line bg-white px-3 text-sm font-semibold hover:bg-canvas"
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
            Reset this QA run
          </button>
        </div>
      </section>

      <section className="space-y-4">
        {steps.map((step, index) => {
          const status = state[step.id]?.status ?? "pending";
          const notes = state[step.id]?.notes ?? "";
          return (
            <article key={step.id} className="border border-line bg-white">
              <div className="grid gap-4 border-b border-line p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded bg-canvas px-2 py-1 text-xs font-semibold text-muted">
                      {index + 1}. {step.phase}
                    </span>
                    <StatusPill status={status} />
                  </div>
                  <h3 className="mt-3 text-xl font-semibold">{step.title}</h3>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">{step.objective}</p>
                  <p className="mt-2 text-xs text-muted">Owner: {step.owner}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={step.href}
                    className="studio-focus inline-flex h-10 items-center gap-2 rounded bg-action px-4 text-sm font-semibold text-white"
                  >
                    Open step
                    <ExternalLink className="h-4 w-4" aria-hidden />
                  </Link>
                  <select
                    value={status}
                    onChange={(event) =>
                      updateStep(step.id, {
                        status: event.target.value as QaStepStatus
                      })
                    }
                    className="studio-focus h-10 rounded border border-line bg-white px-3 text-sm font-semibold"
                    aria-label={`Status for ${step.title}`}
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-5 p-5 lg:grid-cols-4">
                <QaList title="Setup" items={step.setup} />
                <QaList title="Actions" items={step.actions} />
                <QaList title="Evidence" items={step.evidence} />
                <QaList title="Pass criteria" items={step.passCriteria} />
              </div>
              <div className="border-t border-line p-5">
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                  <QaList title="Failure triage" items={step.failureTriage} />
                  <label className="block">
                    <span className="text-sm font-semibold">Run notes and evidence links</span>
                    <textarea
                      value={notes}
                      onChange={(event) => updateStep(step.id, { notes: event.target.value })}
                      className="studio-focus mt-2 min-h-28 w-full rounded border border-line bg-canvas p-3 text-sm"
                      placeholder="Paste screenshots, Shopify product links, Stripe event IDs, job IDs, or observed errors."
                    />
                    {step.notes ? <p className="mt-2 text-xs leading-5 text-muted">{step.notes}</p> : null}
                  </label>
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}

function QaList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="text-sm font-semibold">{title}</p>
      <ul className="mt-2 space-y-2 text-sm leading-6 text-muted">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-action" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Metric({
  label,
  value,
  tone
}: {
  label: string;
  value: number;
  tone: "ready" | "error" | "warning" | "neutral";
}) {
  const toneClass = {
    ready: "text-action",
    error: "text-red-700",
    warning: "text-amber-700",
    neutral: "text-muted"
  }[tone];

  return (
    <div className="border border-line bg-canvas p-3">
      <p className={`text-xl font-semibold ${toneClass}`}>{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}

function StatusPill({ status }: { status: QaStepStatus }) {
  const className = {
    pending: "bg-canvas text-muted",
    pass: "bg-emerald-50 text-emerald-700",
    fail: "bg-red-50 text-red-700",
    blocked: "bg-amber-50 text-amber-800"
  }[status];
  const Icon = status === "pass" ? CheckCircle2 : CircleAlert;

  return (
    <span className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold ${className}`}>
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {status}
    </span>
  );
}
