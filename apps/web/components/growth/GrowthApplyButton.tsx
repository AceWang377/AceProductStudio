"use client";

import { useState } from "react";
import { ArrowUpRight, CheckCircle2, CircleAlert, Loader2, ShieldCheck, WandSparkles } from "lucide-react";

type GrowthFixField = "seo.title" | "seo.description" | "tags" | "descriptionHtml";

type GrowthDiffEntry = {
  field: GrowthFixField;
  label: string;
  before: string;
  after: string;
  changed: boolean;
};

type GrowthFixPreviewPayload = {
  error?: string;
  title?: string;
  onlineStoreUrl?: string | null;
  beforeScore?: number;
  plan?: {
    hasChanges: boolean;
    summary: string[];
    diff: GrowthDiffEntry[];
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

type GrowthDraftValues = {
  seoTitle: string;
  seoDescription: string;
  tags: string;
  descriptionAppendText: string;
};

const EMPTY_DRAFT_VALUES: GrowthDraftValues = {
  seoTitle: "",
  seoDescription: "",
  tags: "",
  descriptionAppendText: ""
};

export function GrowthApplyButton({
  productId,
  creditCost,
  disabled = false
}: {
  productId: string;
  creditCost?: number;
  disabled?: boolean;
}) {
  const [status, setStatus] = useState<"idle" | "previewing" | "preview" | "applying" | "applied" | "error">("idle");
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState<GrowthFixPreviewPayload | null>(null);
  const [selectedFields, setSelectedFields] = useState<GrowthFixField[]>([]);
  const [draftValues, setDraftValues] = useState<GrowthDraftValues>(EMPTY_DRAFT_VALUES);

  async function previewFixes() {
    setStatus("previewing");
    setMessage("");
    const response = await fetch("/api/growth/fix-preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId })
    });
    const payload = (await response.json().catch(() => ({}))) as GrowthFixPreviewPayload;

    if (!response.ok) {
      setStatus("error");
      setMessage(payload.error || "Could not preview the Shopify write-back.");
      return;
    }

    setPreview(payload);
    setSelectedFields(payload.plan?.diff.filter((entry) => entry.changed).map((entry) => entry.field) ?? []);
    setDraftValues(buildDraftValues(payload.plan?.diff ?? []));
    setStatus("preview");
    setMessage("");
  }

  async function applyFixes() {
    setStatus("applying");
    setMessage("");
    const response = await fetch("/api/growth/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId,
        confirmed: true,
        mode: "suggested_fix",
        selectedFields,
        overrides: buildOverrides(draftValues)
      })
    });
    const payload = (await response.json().catch(() => ({}))) as GrowthFixPreviewPayload;

    if (!response.ok) {
      setStatus("error");
      setMessage(payload.error || "Could not apply the selected SEO/GEO fixes.");
      return;
    }

    setStatus("applied");
    const fields = payload.applied?.changedFields?.length
      ? `Updated ${payload.applied.changedFields.join(", ")}.`
      : "SEO/GEO fixes were written to Shopify.";
    const creditNote = payload.credits?.isUnlimited
      ? "Admin account was not charged."
      : typeof payload.credits?.spent === "number"
        ? `Spent ${payload.credits.spent} credits. Balance: ${payload.credits.balance}.`
        : "";
    setMessage(`${fields} ${creditNote}`.trim());
  }

  const changedDiff = preview?.plan?.diff.filter((entry) => entry.changed) ?? [];
  const cost = preview?.credits?.required ?? creditCost;
  const hasChanges = Boolean(preview?.plan?.hasChanges);
  const hasSelectedChanges = hasChanges && selectedFields.length > 0;

  function toggleField(field: GrowthFixField) {
    setSelectedFields((current) =>
      current.includes(field)
        ? current.filter((selectedField) => selectedField !== field)
        : [...current, field]
    );
  }

  function updateDraftValue(field: GrowthFixField, value: string) {
    setDraftValues((current) => ({ ...current, [draftKeyForField(field)]: value }));
    setSelectedFields((current) => current.includes(field) ? current : [...current, field]);
  }

  if (status === "preview" || status === "applying") {
    return (
      <div className="space-y-3">
        <div className="border border-line bg-canvas p-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase text-muted">Shopify write-back preview</p>
              <p className="mt-1 text-sm font-semibold">{preview?.title || "Selected product"}</p>
            </div>
            <span className="rounded border border-line bg-white px-2 py-1 text-[11px] font-semibold text-muted">
              {preview?.beforeScore ?? "--"}/100
            </span>
          </div>
          <div className="mt-3 space-y-2">
            {changedDiff.length ? (
              changedDiff.map((entry) => (
                <GrowthDiffBlock
                  key={entry.field}
                  entry={entry}
                  selected={selectedFields.includes(entry.field)}
                  value={draftValues[draftKeyForField(entry.field)]}
                  onToggle={() => toggleField(entry.field)}
                  onChange={(value) => updateDraftValue(entry.field, value)}
                />
              ))
            ) : (
              <p className="border border-line bg-white p-3 text-xs leading-5 text-muted">
                The suggested SEO/GEO fixes are already applied to Shopify.
              </p>
            )}
          </div>
          <div className="mt-3 border border-emerald-200 bg-emerald-50 p-3 text-xs leading-5 text-emerald-900">
            <div className="flex gap-2">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              <p>
                Nothing is changed until you approve. Edit the After fields if needed, then write selected
                SEO title, meta description, product tags, and answer-ready content back to Shopify.
              </p>
            </div>
          </div>
          {changedDiff.length ? (
            <p className="mt-3 text-xs font-semibold text-muted">
              {selectedFields.length} of {changedDiff.length} fields selected for write-back.
            </p>
          ) : null}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={!hasSelectedChanges || status === "applying"}
            onClick={applyFixes}
            className="studio-focus inline-flex h-10 items-center justify-center gap-2 rounded bg-action px-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {status === "applying" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Applying
              </>
            ) : (
              `Apply${typeof cost === "number" && cost > 0 ? ` (${cost})` : ""}`
            )}
          </button>
          <button
            type="button"
            disabled={status === "applying"}
            onClick={() => {
              setStatus("idle");
              setPreview(null);
              setDraftValues(EMPTY_DRAFT_VALUES);
              setSelectedFields([]);
            }}
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
        disabled={disabled || status === "previewing" || status === "applied"}
        onClick={previewFixes}
        className="studio-focus inline-flex h-10 w-full items-center justify-center gap-2 rounded bg-action px-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {status === "previewing" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Building preview
          </>
        ) : status === "applied" ? (
          <>
            <CheckCircle2 className="h-4 w-4" aria-hidden />
            Applied
          </>
        ) : (
          <>
            <WandSparkles className="h-4 w-4" aria-hidden />
            Preview Shopify write-back{typeof creditCost === "number" ? ` (${creditCost})` : ""}
          </>
        )}
      </button>
      {message ? (
        <p className={`flex gap-2 text-xs leading-5 ${status === "error" ? "text-red-700" : "text-emerald-700"}`}>
          {status === "error" ? <CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden /> : null}
          <span>{message}</span>
        </p>
      ) : (
        <p className="text-xs leading-5 text-muted">
          Review exact field changes before updating Shopify.
        </p>
      )}
      {status === "error" ? (
        <button type="button" onClick={previewFixes} className="text-xs font-semibold text-action">
          Try preview again
        </button>
      ) : null}
      {status === "applied" && preview?.onlineStoreUrl ? (
        <a href={preview.onlineStoreUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-action">
          View live product
          <ArrowUpRight className="h-3 w-3" aria-hidden />
        </a>
      ) : null}
    </div>
  );
}

function GrowthDiffBlock({
  entry,
  selected,
  value,
  onToggle,
  onChange
}: {
  entry: GrowthDiffEntry;
  selected: boolean;
  value: string;
  onToggle: () => void;
  onChange: (value: string) => void;
}) {
  return (
    <article className={`border p-3 ${selected ? "border-action bg-white" : "border-line bg-white/70"}`}>
      <label className="flex cursor-pointer items-start gap-2">
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          className="mt-0.5 h-4 w-4 rounded border-line accent-[#14785f]"
        />
        <span className="text-xs font-semibold text-ink">{entry.label}</span>
      </label>
      <div className="mt-2 grid gap-2 text-xs leading-5 text-muted">
        <div>
          <p className="font-semibold uppercase text-muted/80">Before</p>
          <p className="mt-1 line-clamp-3">{entry.before}</p>
        </div>
        <div>
          <p className="font-semibold uppercase text-action">After</p>
          <EditableAfterField entry={entry} selected={selected} value={value} onChange={onChange} />
        </div>
      </div>
    </article>
  );
}

function EditableAfterField({
  entry,
  selected,
  value,
  onChange
}: {
  entry: GrowthDiffEntry;
  selected: boolean;
  value: string;
  onChange: (value: string) => void;
}) {
  const commonClassName = `studio-focus mt-1 w-full rounded border border-line bg-white px-2 py-2 text-xs leading-5 text-ink shadow-sm ${
    selected ? "" : "opacity-70"
  }`;

  if (entry.field === "seo.title") {
    return (
      <input
        value={value}
        maxLength={70}
        onChange={(event) => onChange(event.target.value)}
        className={commonClassName}
        aria-label="Edit SEO title after value"
      />
    );
  }

  if (entry.field === "tags") {
    return (
      <textarea
        value={value}
        rows={3}
        onChange={(event) => onChange(event.target.value)}
        className={commonClassName}
        aria-label="Edit product tags after value"
      />
    );
  }

  return (
    <textarea
      value={value}
      rows={entry.field === "descriptionHtml" ? 5 : 4}
      maxLength={entry.field === "seo.description" ? 165 : undefined}
      onChange={(event) => onChange(event.target.value)}
      className={commonClassName}
      aria-label={`Edit ${entry.label} after value`}
    />
  );
}

function buildDraftValues(diff: GrowthDiffEntry[]): GrowthDraftValues {
  return diff.reduce<GrowthDraftValues>((values, entry) => {
    values[draftKeyForField(entry.field)] = entry.after;
    return values;
  }, { ...EMPTY_DRAFT_VALUES });
}

function draftKeyForField(field: GrowthFixField): keyof GrowthDraftValues {
  if (field === "seo.title") return "seoTitle";
  if (field === "seo.description") return "seoDescription";
  if (field === "tags") return "tags";
  return "descriptionAppendText";
}

function buildOverrides(values: GrowthDraftValues) {
  return {
    seoTitle: values.seoTitle,
    seoDescription: values.seoDescription,
    tags: values.tags,
    descriptionAppendText: values.descriptionAppendText
  };
}
