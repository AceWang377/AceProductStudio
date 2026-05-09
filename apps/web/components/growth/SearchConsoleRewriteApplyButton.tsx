"use client";

import { useState } from "react";
import { CheckCircle2, CircleAlert, Loader2, RefreshCcw, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/components/i18n/LanguageProvider";

type RewriteDraft = {
  seoTitle: string;
  seoDescription: string;
  faqQuestion: string;
  answerBlock: string;
  intent?: "commercial" | "informational" | "comparison" | "brand";
  confidence?: "high" | "medium" | "low";
};

type DiffEntry = {
  field: "seo.title" | "seo.description" | "descriptionHtml";
  label: string;
  before: string;
  after: string;
  changed: boolean;
};

type PreviewPayload = {
  error?: string;
  title?: string;
  onlineStoreUrl?: string;
  plan?: {
    hasChanges: boolean;
    summary: string[];
    diff: DiffEntry[];
  };
  credits?: {
    required: number;
    balance?: number;
    isUnlimited?: boolean;
  };
};

export function SearchConsoleRewriteApplyButton({
  productId,
  rewrite,
  creditCost
}: {
  productId: string;
  rewrite: RewriteDraft;
  creditCost: number;
}) {
  const { t } = useLanguage();
  const copy = t.growthPage.writeBackPreview;
  const rewriteCopy = copy.rewrite;
  const [status, setStatus] = useState<"idle" | "previewing" | "preview" | "applying" | "applied" | "error">("idle");
  const [preview, setPreview] = useState<PreviewPayload | null>(null);
  const [draftRewrite, setDraftRewrite] = useState<RewriteDraft>(rewrite);
  const [message, setMessage] = useState("");

  async function previewWriteBack() {
    setStatus("previewing");
    setMessage("");
    const response = await fetch("/api/growth/rewrite-preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, rewrite })
    });
    const payload = (await response.json().catch(() => ({}))) as PreviewPayload;
    if (!response.ok) {
      setStatus("error");
      setMessage(payload.error || rewriteCopy.errorPreview);
      return;
    }
    setPreview(payload);
    setDraftRewrite(rewrite);
    setStatus("preview");
  }

  async function applyWriteBack() {
    setStatus("applying");
    setMessage("");
    const response = await fetch("/api/growth/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId,
        rewrite: draftRewrite,
        mode: "search_console_rewrite",
        confirmed: true
      })
    });
    const payload = (await response.json().catch(() => ({}))) as {
      error?: string;
      credits?: { spent?: number; balance?: number; isUnlimited?: boolean };
    };
    if (!response.ok) {
      setStatus("error");
      setMessage(payload.error || rewriteCopy.errorApply);
      return;
    }
    setStatus("applied");
    const creditNote = payload.credits?.isUnlimited
      ? copy.adminNotCharged
      : typeof payload.credits?.spent === "number"
        ? `${copy.spent} ${payload.credits.spent} ${t.growthPage.nextBestAction.credits}. ${copy.balance}: ${payload.credits.balance}.`
        : "";
    setMessage(`${rewriteCopy.written} ${creditNote}`.trim());
  }

  if ((status === "preview" || status === "applying") && preview?.plan) {
    return (
      <div className="mt-3 space-y-3 border border-white/10 bg-black/15 p-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase text-white/45">{rewriteCopy.diffTitle}</p>
            <p className="mt-1 text-xs leading-5 text-white/70">
              {preview.plan.hasChanges
                ? `${preview.plan.summary.join(", ")} ${rewriteCopy.willUpdate}`
                : rewriteCopy.noChanges}
              {" "}{rewriteCopy.editHelp}
            </p>
          </div>
          <span className="rounded bg-white/10 px-2 py-1 text-[10px] font-semibold uppercase text-white/70">
            {preview.credits?.isUnlimited ? rewriteCopy.unlimited : `${preview.credits?.required ?? creditCost} ${rewriteCopy.credits}`}
          </span>
        </div>
        <div className="space-y-2">
          {preview.plan.diff.map((entry) => (
            <RewriteDiffBlock
              key={entry.field}
              entry={entry}
              draft={draftRewrite}
              onDraftChange={setDraftRewrite}
              beforeLabel={copy.before}
              afterLabel={copy.after}
              changeLabel={t.growthPage.common.change}
              sameLabel={t.growthPage.common.same}
            />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={!preview.plan.hasChanges || status === "applying"}
            onClick={applyWriteBack}
            className="studio-focus inline-flex h-10 items-center justify-center gap-2 rounded bg-[#98d7c3] px-3 text-xs font-semibold text-[#11211b] disabled:opacity-50"
          >
            {status === "applying" ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : <ShieldCheck className="h-3.5 w-3.5" aria-hidden />}
            {rewriteCopy.confirm}
          </button>
          <button
            type="button"
            onClick={() => {
              setStatus("idle");
              setPreview(null);
              setDraftRewrite(rewrite);
            }}
            className="studio-focus inline-flex h-10 items-center justify-center rounded border border-white/10 bg-white/[0.04] px-3 text-xs font-semibold text-white/75"
          >
            {copy.cancel}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-2">
      <button
        type="button"
        disabled={status === "previewing" || status === "applying" || status === "applied"}
        onClick={previewWriteBack}
        className="studio-focus inline-flex h-10 w-full items-center justify-center gap-2 rounded border border-[#98d7c3]/40 bg-[#98d7c3]/10 px-3 text-xs font-semibold text-[#d9fff1] disabled:opacity-60"
      >
        {status === "previewing" ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
            {rewriteCopy.previewing}
          </>
        ) : status === "applied" ? (
          <>
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
            {rewriteCopy.appliedToShopify}
          </>
        ) : (
          <>
            <RefreshCcw className="h-3.5 w-3.5" aria-hidden />
            {rewriteCopy.preview} ({creditCost})
          </>
        )}
      </button>
      {message ? (
        <p className={`flex gap-2 text-xs leading-5 ${status === "error" ? "text-red-200" : "text-[#98d7c3]"}`}>
          {status === "error" ? <CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden /> : null}
          {message}
        </p>
      ) : null}
    </div>
  );
}

function RewriteDiffBlock({
  entry,
  draft,
  onDraftChange,
  beforeLabel,
  afterLabel,
  changeLabel,
  sameLabel
}: {
  entry: DiffEntry;
  draft: RewriteDraft;
  onDraftChange: (draft: RewriteDraft) => void;
  beforeLabel: string;
  afterLabel: string;
  changeLabel: string;
  sameLabel: string;
}) {
  return (
    <div className="border border-white/10 bg-[#16251f] p-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase text-white/45">{entry.label}</p>
        <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
          entry.changed ? "bg-[#98d7c3]/20 text-[#98d7c3]" : "bg-white/10 text-white/50"
        }`}>
          {entry.changed ? changeLabel : sameLabel}
        </span>
      </div>
      <div className="mt-2 grid gap-2 text-xs leading-5 md:grid-cols-2">
        <p className="text-white/45">
          <span className="block text-[10px] font-semibold uppercase">{beforeLabel}</span>
          {entry.before}
        </p>
        <div className="text-white/80">
          <span className="block text-[10px] font-semibold uppercase text-[#98d7c3]">{afterLabel}</span>
          <EditableRewriteAfter entry={entry} draft={draft} onDraftChange={onDraftChange} />
        </div>
      </div>
    </div>
  );
}

function EditableRewriteAfter({
  entry,
  draft,
  onDraftChange
}: {
  entry: DiffEntry;
  draft: RewriteDraft;
  onDraftChange: (draft: RewriteDraft) => void;
}) {
  const inputClassName = "studio-focus mt-1 w-full rounded border border-white/10 bg-white/[0.06] px-2 py-2 text-xs leading-5 text-white shadow-sm placeholder:text-white/35";

  if (entry.field === "seo.title") {
    return (
      <input
        value={draft.seoTitle}
        maxLength={70}
        onChange={(event) => onDraftChange({ ...draft, seoTitle: event.target.value })}
        className={inputClassName}
        aria-label="Edit Search Console SEO title rewrite"
      />
    );
  }

  if (entry.field === "seo.description") {
    return (
      <textarea
        value={draft.seoDescription}
        rows={4}
        maxLength={165}
        onChange={(event) => onDraftChange({ ...draft, seoDescription: event.target.value })}
        className={inputClassName}
        aria-label="Edit Search Console meta description rewrite"
      />
    );
  }

  return (
    <div className="space-y-2">
      <input
        value={draft.faqQuestion}
        onChange={(event) => onDraftChange({ ...draft, faqQuestion: event.target.value })}
        className={inputClassName}
        aria-label="Edit Search Console answer question"
      />
      <textarea
        value={draft.answerBlock}
        rows={5}
        onChange={(event) => onDraftChange({ ...draft, answerBlock: event.target.value })}
        className={inputClassName}
        aria-label="Edit Search Console answer block"
      />
    </div>
  );
}
