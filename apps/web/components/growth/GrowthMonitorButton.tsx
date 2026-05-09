"use client";

import { useState } from "react";
import { Activity, Loader2 } from "lucide-react";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export function GrowthMonitorButton({ creditCost }: { creditCost?: number }) {
  const { t } = useLanguage();
  const copy = t.growthPage.monitorButton;
  const [status, setStatus] = useState<"idle" | "running" | "done" | "failed">("idle");
  const [message, setMessage] = useState("");

  async function runMonitor() {
    setStatus("running");
    setMessage(copy.runningMessage);
    const response = await fetch("/api/growth/monitor", { method: "POST" });
    const data = (await response.json().catch(() => ({}))) as {
      error?: string;
      credits?: { spent?: number; balance?: number; isUnlimited?: boolean };
    };

    if (!response.ok) {
      setStatus("failed");
      setMessage(typeof data.error === "string" ? data.error : copy.failed);
      return;
    }

    setStatus("done");
    const creditNote = data.credits?.isUnlimited
      ? copy.adminNotCharged
      : typeof data.credits?.spent === "number"
        ? `${copy.spent} ${data.credits.spent} ${t.growthPage.nextBestAction.credit}. ${copy.balance}: ${data.credits.balance}.`
        : "";
    setMessage(`${copy.completed} ${creditNote}`.trim());
    window.setTimeout(() => window.location.reload(), 800);
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={runMonitor}
        disabled={status === "running"}
        className="studio-focus inline-flex h-10 items-center gap-2 rounded bg-action px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
      >
        {status === "running" ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <Activity className="h-4 w-4" aria-hidden />
        )}
        {copy.run}{typeof creditCost === "number" ? ` (${creditCost})` : ""}
      </button>
      {message ? (
        <p className={status === "failed" ? "text-xs text-red-700" : "text-xs text-muted"}>{message}</p>
      ) : null}
    </div>
  );
}
