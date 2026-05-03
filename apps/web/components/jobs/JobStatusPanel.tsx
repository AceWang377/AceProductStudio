"use client";

import type { GenerationJob } from "@/lib/types";
import { statusLabel } from "@/lib/status";
import { StatusBadge } from "@/components/product/StatusBadge";
import { RotateCcw } from "lucide-react";

export function JobStatusPanel({
  jobs,
  onRetry,
  retryingJobId
}: {
  jobs: GenerationJob[];
  onRetry?: (job: GenerationJob) => void;
  retryingJobId?: string;
}) {
  if (!jobs.length) {
    return (
      <div className="border border-line bg-white p-4 text-sm text-muted">
        No generation jobs yet.
      </div>
    );
  }

  return (
    <div className="divide-y divide-line border border-line bg-white">
      {jobs.slice(0, 5).map((job) => (
        <div key={job.id} className="p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <span className="text-sm font-semibold">{statusLabel(job.type)}</span>
              <p className="mt-1 text-xs text-muted">{formatJobTime(job.updatedAt)}</p>
            </div>
            <div className="flex items-center gap-2">
              {job.status === "FAILED" && onRetry ? (
                <button
                  type="button"
                  onClick={() => onRetry(job)}
                  disabled={retryingJobId === job.id}
                  className="studio-focus inline-flex h-8 items-center gap-2 rounded border border-line bg-white px-3 text-xs font-semibold hover:bg-canvas disabled:opacity-60"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden />
                  {retryingJobId === job.id ? "Retrying" : "Retry"}
                </button>
              ) : null}
              <StatusBadge status={job.status} />
            </div>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded bg-stone-100">
            <div
              className={`h-full transition-all ${job.status === "FAILED" ? "bg-red-600" : "bg-action"}`}
              style={{ width: `${job.progress}%` }}
            />
          </div>
          {job.error ? (
            <details className="mt-3 rounded border border-red-100 bg-red-50 p-3 text-xs text-red-800">
              <summary className="cursor-pointer font-semibold">Show technical error</summary>
              <p className="mt-2 break-words leading-5">{job.error}</p>
            </details>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function formatJobTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.toISOString().slice(0, 16).replace("T", " ")} UTC`;
}
