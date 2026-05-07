"use client";

import { useState } from "react";
import { Activity, Loader2 } from "lucide-react";

export function GrowthMonitorButton({ creditCost }: { creditCost?: number }) {
  const [status, setStatus] = useState<"idle" | "running" | "done" | "failed">("idle");
  const [message, setMessage] = useState("");

  async function runMonitor() {
    setStatus("running");
    setMessage("Running live technical SEO, Search Console, and AI visibility checks...");
    const response = await fetch("/api/growth/monitor", { method: "POST" });
    const data = (await response.json().catch(() => ({}))) as {
      error?: string;
      credits?: { spent?: number; balance?: number; isUnlimited?: boolean };
    };

    if (!response.ok) {
      setStatus("failed");
      setMessage(typeof data.error === "string" ? data.error : "Growth monitoring failed.");
      return;
    }

    setStatus("done");
    const creditNote = data.credits?.isUnlimited
      ? "Admin account was not charged."
      : typeof data.credits?.spent === "number"
        ? `Spent ${data.credits.spent} credit. Balance: ${data.credits.balance}.`
        : "";
    setMessage(`Growth monitor completed. ${creditNote}`.trim());
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
        Run live monitor{typeof creditCost === "number" ? ` (${creditCost})` : ""}
      </button>
      {message ? (
        <p className={status === "failed" ? "text-xs text-red-700" : "text-xs text-muted"}>{message}</p>
      ) : null}
    </div>
  );
}
