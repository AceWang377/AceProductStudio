"use client";

import { useState } from "react";
import { CheckCircle2, CircleAlert, Image as ImageIcon, Loader2 } from "lucide-react";
import { useLanguage } from "@/components/i18n/LanguageProvider";

type GrowthSimpleDiffEntry = {
  label: string;
  before: string;
  after: string;
  changed: boolean;
};

type GrowthSimplePreviewPayload = {
  error?: string;
  title?: string;
  onlineStoreUrl?: string | null;
  plan?: {
    hasChanges: boolean;
    summary: string[];
    diff: GrowthSimpleDiffEntry[];
    reason?: string;
  };
  credits?: {
    required?: number;
    balance?: number;
    spent?: number;
    isUnlimited?: boolean;
  };
  applied?: {
    changedFields?: string[];
  };
};

export function GrowthImageAltApplyButton({
  productId,
  creditCost
}: {
  productId: string;
  creditCost: number;
}) {
  const { t } = useLanguage();
  const copy = t.growthPage.writeBackPreview;
  const imageCopy = copy.imageAlt;
  const [status, setStatus] = useState<"idle" | "previewing" | "preview" | "applying" | "applied" | "error">("idle");
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState<GrowthSimplePreviewPayload | null>(null);

  async function previewFixes() {
    setStatus("previewing");
    setMessage("");
    const response = await fetch("/api/growth/fix-preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, mode: "image_alt" })
    });
    const payload = (await response.json().catch(() => ({}))) as GrowthSimplePreviewPayload;
    if (!response.ok) {
      setStatus("error");
      setMessage(payload.error || imageCopy.errorPreview);
      return;
    }
    setPreview(payload);
    setStatus("preview");
  }

  async function applyFixes() {
    setStatus("applying");
    setMessage("");
    const response = await fetch("/api/growth/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, mode: "image_alt", confirmed: true })
    });
    const payload = (await response.json().catch(() => ({}))) as GrowthSimplePreviewPayload;
    if (!response.ok) {
      setStatus("error");
      setMessage(payload.error || imageCopy.errorApply);
      return;
    }
    setStatus("applied");
    const creditNote = payload.credits?.isUnlimited
      ? copy.adminNotCharged
      : typeof payload.credits?.spent === "number"
        ? `${copy.spent} ${payload.credits.spent} ${t.growthPage.nextBestAction.credits}. ${copy.balance}: ${payload.credits.balance}.`
        : "";
    setMessage(`${imageCopy.applied} ${creditNote}`.trim());
  }

  if (status === "preview" || status === "applying") {
    const diff = preview?.plan?.diff.filter((entry) => entry.changed) ?? [];
    return (
      <div className="space-y-3">
        <div className="border border-line bg-canvas p-3">
          <p className="text-[11px] font-semibold uppercase text-muted">{imageCopy.title}</p>
          <p className="mt-1 text-sm font-semibold">{preview?.title || copy.selectedProduct}</p>
          <div className="mt-3 space-y-2">
            {diff.length ? (
              diff.map((entry) => (
                <article key={`${entry.label}-${entry.after}`} className="border border-line bg-white p-3 text-xs leading-5">
                  <p className="font-semibold text-ink">{entry.label}</p>
                  <p className="mt-2 font-semibold uppercase text-muted/80">{copy.before}</p>
                  <p className="mt-1 text-muted">{entry.before}</p>
                  <p className="mt-2 font-semibold uppercase text-action">{copy.after}</p>
                  <p className="mt-1 text-ink">{entry.after}</p>
                </article>
              ))
            ) : (
              <p className="border border-line bg-white p-3 text-xs leading-5 text-muted">
                {preview?.plan?.reason || imageCopy.noChanges}
              </p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={!preview?.plan?.hasChanges || status === "applying"}
            onClick={applyFixes}
            className="studio-focus inline-flex h-10 items-center justify-center gap-2 rounded bg-action px-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {status === "applying" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                {copy.applying}
              </>
            ) : (
              `${imageCopy.confirm}${typeof preview?.credits?.required === "number" && preview.credits.required > 0 ? ` (${preview.credits.required})` : ""}`
            )}
          </button>
          <button
            type="button"
            disabled={status === "applying"}
            onClick={() => {
              setStatus("idle");
              setPreview(null);
            }}
            className="studio-focus inline-flex h-10 items-center justify-center rounded border border-line bg-white px-3 text-sm font-semibold"
          >
            {copy.cancel}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={status === "previewing" || status === "applied"}
        onClick={previewFixes}
        className="studio-focus inline-flex h-10 w-full items-center justify-center gap-2 rounded border border-line bg-white px-3 text-sm font-semibold hover:bg-canvas disabled:opacity-60"
      >
        {status === "previewing" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            {imageCopy.previewing}
          </>
        ) : status === "applied" ? (
          <>
            <CheckCircle2 className="h-4 w-4 text-action" aria-hidden />
            {imageCopy.applied}
          </>
        ) : (
          <>
            <ImageIcon className="h-4 w-4" aria-hidden />
            {imageCopy.preview} ({creditCost})
          </>
        )}
      </button>
      {message ? (
        <p className={`flex gap-2 text-xs leading-5 ${status === "error" ? "text-red-700" : "text-emerald-700"}`}>
          {status === "error" ? <CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden /> : null}
          <span>{message}</span>
        </p>
      ) : (
        <p className="text-xs leading-5 text-muted">{imageCopy.help}</p>
      )}
    </div>
  );
}
