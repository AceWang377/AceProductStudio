"use client";

import { useState } from "react";
import { CheckCircle2, CircleAlert, Loader2, WandSparkles } from "lucide-react";

export function GrowthApplyButton({
  productId,
  creditCost,
  disabled = false
}: {
  productId: string;
  creditCost?: number;
  disabled?: boolean;
}) {
  const [status, setStatus] = useState<"idle" | "confirm" | "applying" | "applied" | "error">("idle");
  const [message, setMessage] = useState("");

  async function applyFixes() {
    setStatus("applying");
    setMessage("");
    const response = await fetch("/api/growth/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, confirmed: true })
    });
    const payload = (await response.json().catch(() => ({}))) as {
      error?: string;
      credits?: { spent?: number; balance?: number; isUnlimited?: boolean };
    };

    if (!response.ok) {
      setStatus("error");
      setMessage(payload.error || "Could not apply the selected SEO/GEO fixes.");
      return;
    }

    setStatus("applied");
    const creditNote = payload.credits?.isUnlimited
      ? "Admin account was not charged."
      : typeof payload.credits?.spent === "number"
        ? `Spent ${payload.credits.spent} credits. Balance: ${payload.credits.balance}.`
        : "";
    setMessage(`SEO/GEO fixes were written to Shopify. ${creditNote}`.trim());
  }

  if (status === "confirm") {
    return (
      <div className="space-y-2">
        <p className="text-xs leading-5 text-muted">
          This will update SEO title, meta description, tags, and append a buyer Q&A section in Shopify.
          {typeof creditCost === "number" ? ` This action costs ${creditCost} credits.` : ""}
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={applyFixes}
            className="studio-focus inline-flex h-10 items-center justify-center rounded bg-action px-3 text-sm font-semibold text-white"
          >
            Confirm apply
          </button>
          <button
            type="button"
            onClick={() => setStatus("idle")}
            className="studio-focus inline-flex h-10 items-center justify-center rounded border border-line bg-white px-3 text-sm font-semibold"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={disabled || status === "applying" || status === "applied"}
        onClick={() => setStatus("confirm")}
        className="studio-focus inline-flex h-10 w-full items-center justify-center gap-2 rounded bg-action px-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {status === "applying" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Applying...
          </>
        ) : status === "applied" ? (
          <>
            <CheckCircle2 className="h-4 w-4" aria-hidden />
            Applied
          </>
        ) : (
          <>
            <WandSparkles className="h-4 w-4" aria-hidden />
            Apply SEO/GEO fixes{typeof creditCost === "number" ? ` (${creditCost})` : ""}
          </>
        )}
      </button>
      {message ? (
        <p className={`flex gap-2 text-xs leading-5 ${status === "error" ? "text-red-700" : "text-emerald-700"}`}>
          {status === "error" ? <CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden /> : null}
          {message}
        </p>
      ) : null}
    </div>
  );
}
