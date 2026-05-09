"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, CircleAlert, Link2, Loader2 } from "lucide-react";
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

type InternalLinkSuggestion = {
  key: string;
  sourceId?: string;
  sourceType?: "product" | "collection" | "blog";
  sourceTitle: string;
  targetTitle: string;
  targetUrl?: string;
  linkType: "product_to_collection" | "collection_to_product" | "product_to_product" | "blog_to_product";
  anchorText: string;
  reason: string;
  priority: "high" | "medium" | "low";
};

export function GrowthInternalLinkApplyButton({
  suggestion,
  creditCost
}: {
  suggestion: InternalLinkSuggestion;
  creditCost: number;
}) {
  const { t } = useLanguage();
  const copy = t.growthPage.writeBackPreview;
  const linkCopy = copy.internalLink;
  const canWriteBack =
    Boolean(suggestion.sourceId) &&
    Boolean(suggestion.targetUrl) &&
    (suggestion.sourceType === "product" || suggestion.sourceType === "collection");
  const [status, setStatus] = useState<"idle" | "previewing" | "preview" | "applying" | "applied" | "error">("idle");
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState<GrowthSimplePreviewPayload | null>(null);
  const [anchorText, setAnchorText] = useState(suggestion.anchorText);

  const internalLink = useMemo(() => ({
    key: suggestion.key,
    sourceId: suggestion.sourceId,
    sourceType: suggestion.sourceType,
    sourceTitle: suggestion.sourceTitle,
    targetTitle: suggestion.targetTitle,
    targetUrl: suggestion.targetUrl,
    linkType: suggestion.linkType,
    anchorText: anchorText.trim() || suggestion.anchorText,
    reason: suggestion.reason,
    priority: suggestion.priority
  }), [anchorText, suggestion]);

  async function previewLink() {
    setStatus("previewing");
    setMessage("");
    const response = await fetch("/api/growth/fix-preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "internal_link", internalLink })
    });
    const payload = (await response.json().catch(() => ({}))) as GrowthSimplePreviewPayload;
    if (!response.ok) {
      setStatus("error");
      setMessage(payload.error || linkCopy.errorPreview);
      return;
    }
    setPreview(payload);
    setStatus("preview");
  }

  async function applyLink() {
    setStatus("applying");
    setMessage("");
    const response = await fetch("/api/growth/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "internal_link", internalLink, confirmed: true })
    });
    const payload = (await response.json().catch(() => ({}))) as GrowthSimplePreviewPayload;
    if (!response.ok) {
      setStatus("error");
      setMessage(payload.error || linkCopy.errorApply);
      return;
    }
    setStatus("applied");
    const creditNote = payload.credits?.isUnlimited
      ? copy.adminNotCharged
      : typeof payload.credits?.spent === "number"
        ? `${copy.spent} ${payload.credits.spent} ${t.growthPage.nextBestAction.credits}. ${copy.balance}: ${payload.credits.balance}.`
        : "";
    setMessage(`${linkCopy.applied} ${creditNote}`.trim());
  }

  if (!canWriteBack) {
    return <p className="mt-3 text-xs leading-5 text-muted">{linkCopy.manualOnly}</p>;
  }

  if (status === "preview" || status === "applying") {
    const diff = preview?.plan?.diff.filter((entry) => entry.changed) ?? [];
    return (
      <div className="mt-3 space-y-3">
        <div className="border border-line bg-white p-3">
          <p className="text-[11px] font-semibold uppercase text-muted">{linkCopy.title}</p>
          <p className="mt-1 text-sm font-semibold">{preview?.title || suggestion.sourceTitle}</p>
          <div className="mt-3 space-y-2">
            {diff.length ? (
              diff.map((entry) => (
                <article key={`${entry.label}-${entry.after}`} className="border border-line bg-canvas p-3 text-xs leading-5">
                  <p className="font-semibold text-ink">{entry.label}</p>
                  <p className="mt-2 font-semibold uppercase text-muted/80">{copy.before}</p>
                  <p className="mt-1 text-muted">{entry.before}</p>
                  <p className="mt-2 font-semibold uppercase text-action">{copy.after}</p>
                  <p className="mt-1 text-ink">{entry.after}</p>
                </article>
              ))
            ) : (
              <p className="border border-line bg-canvas p-3 text-xs leading-5 text-muted">
                {preview?.plan?.reason || linkCopy.noChanges}
              </p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={!preview?.plan?.hasChanges || status === "applying"}
            onClick={applyLink}
            className="studio-focus inline-flex h-10 items-center justify-center gap-2 rounded bg-action px-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {status === "applying" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                {copy.applying}
              </>
            ) : (
              `${linkCopy.confirm}${typeof preview?.credits?.required === "number" && preview.credits.required > 0 ? ` (${preview.credits.required})` : ""}`
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
    <div className="mt-3 space-y-2">
      <label className="block text-xs font-semibold text-muted" htmlFor={`anchor-${suggestion.key}`}>
        {linkCopy.anchorLabel}
      </label>
      <input
        id={`anchor-${suggestion.key}`}
        value={anchorText}
        onChange={(event) => {
          setAnchorText(event.target.value);
          setPreview(null);
          if (status === "error") setStatus("idle");
        }}
        className="studio-focus h-10 w-full rounded border border-line bg-white px-3 text-sm"
      />
      <button
        type="button"
        disabled={status === "previewing" || status === "applied"}
        onClick={previewLink}
        className="studio-focus inline-flex h-10 w-full items-center justify-center gap-2 rounded border border-line bg-white px-3 text-sm font-semibold hover:bg-canvas disabled:opacity-60"
      >
        {status === "previewing" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            {linkCopy.previewing}
          </>
        ) : status === "applied" ? (
          <>
            <CheckCircle2 className="h-4 w-4 text-action" aria-hidden />
            {linkCopy.applied}
          </>
        ) : (
          <>
            <Link2 className="h-4 w-4" aria-hidden />
            {linkCopy.preview} ({creditCost})
          </>
        )}
      </button>
      {message ? (
        <p className={`flex gap-2 text-xs leading-5 ${status === "error" ? "text-red-700" : "text-emerald-700"}`}>
          {status === "error" ? <CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden /> : null}
          <span>{message}</span>
        </p>
      ) : (
        <p className="text-xs leading-5 text-muted">{linkCopy.help}</p>
      )}
    </div>
  );
}
