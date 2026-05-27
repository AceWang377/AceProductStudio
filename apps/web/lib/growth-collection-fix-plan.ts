export type GrowthCollectionFixField = "seo.title" | "seo.description" | "descriptionHtml";

export const GROWTH_COLLECTION_FIX_FIELDS: GrowthCollectionFixField[] = [
  "seo.title",
  "seo.description",
  "descriptionHtml"
];

export type GrowthCollectionFixCollection = {
  id: string;
  title: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  descriptionHtml?: string | null;
};

export type GrowthCollectionFixSuggestion = {
  seoTitle: string;
  seoDescription: string;
  tags?: string[];
  descriptionAppendHtml: string;
};

export type GrowthCollectionFixOverrides = {
  seoTitle?: string;
  seoDescription?: string;
  descriptionAppendHtml?: string;
  descriptionAppendText?: string;
};

export type GrowthCollectionFixDiffEntry = {
  field: GrowthCollectionFixField;
  label: string;
  before: string;
  after: string;
  changed: boolean;
};

export type GrowthCollectionFixPlan = {
  hasChanges: boolean;
  changes: {
    seo?: {
      title?: string;
      description?: string;
    };
    descriptionHtml?: string;
  };
  diff: GrowthCollectionFixDiffEntry[];
  descriptionAppended: boolean;
  summary: string[];
};

const COLLECTION_GUIDE_MARKER = "Collection guide for search and AI discovery";

function normalizeText(value?: string | null) {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function normalizeHtmlText(value?: string | null) {
  return normalizeText(
    (value ?? "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
  );
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildGuideBlockFromText(value: string) {
  const clean = normalizeText(value);
  if (!clean) return "";

  return [
    "<section>",
    `<h3>${COLLECTION_GUIDE_MARKER}</h3>`,
    `<p>${escapeHtml(clean)}</p>`,
    "</section>"
  ].join("");
}

function sameText(left?: string | null, right?: string | null) {
  return normalizeText(left).toLowerCase() === normalizeText(right).toLowerCase();
}

function getSelectedFields(selectedFields?: GrowthCollectionFixField[]) {
  return new Set(selectedFields ?? GROWTH_COLLECTION_FIX_FIELDS);
}

export function parseGrowthCollectionFixFields(value: unknown): GrowthCollectionFixField[] | undefined {
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) return [];
  const fieldSet = new Set(GROWTH_COLLECTION_FIX_FIELDS);
  return value.filter(
    (field): field is GrowthCollectionFixField => typeof field === "string" && fieldSet.has(field as GrowthCollectionFixField)
  );
}

export function buildGrowthCollectionFixPlan({
  collection,
  suggestedFix,
  selectedFields,
  overrides
}: {
  collection: GrowthCollectionFixCollection;
  suggestedFix: GrowthCollectionFixSuggestion;
  selectedFields?: GrowthCollectionFixField[];
  overrides?: GrowthCollectionFixOverrides;
}): GrowthCollectionFixPlan {
  const selected = getSelectedFields(selectedFields);
  const currentDescription = collection.descriptionHtml || "";
  const alreadyApplied = currentDescription.includes(COLLECTION_GUIDE_MARKER);
  const nextSeoTitle = normalizeText(overrides?.seoTitle) || suggestedFix.seoTitle;
  const nextSeoDescription = normalizeText(overrides?.seoDescription) || suggestedFix.seoDescription;
  const nextGuideBlock =
    buildGuideBlockFromText(overrides?.descriptionAppendText ?? "") ||
    normalizeText(overrides?.descriptionAppendHtml) ||
    suggestedFix.descriptionAppendHtml;
  const nextDescription = alreadyApplied
    ? currentDescription
    : `${currentDescription}${currentDescription ? "\n" : ""}${nextGuideBlock}`;

  const seoTitleChanged = selected.has("seo.title") && !sameText(collection.seoTitle || collection.title, nextSeoTitle);
  const seoDescriptionChanged = selected.has("seo.description") && !sameText(collection.seoDescription, nextSeoDescription);
  const descriptionAppended = selected.has("descriptionHtml") && !alreadyApplied;
  const changes: GrowthCollectionFixPlan["changes"] = {};

  if (seoTitleChanged || seoDescriptionChanged) {
    changes.seo = {};
    if (seoTitleChanged) changes.seo.title = nextSeoTitle;
    if (seoDescriptionChanged) changes.seo.description = nextSeoDescription;
  }
  if (descriptionAppended) changes.descriptionHtml = nextDescription;

  const diff: GrowthCollectionFixDiffEntry[] = [
    {
      field: "seo.title",
      label: "Collection SEO title",
      before: normalizeText(collection.seoTitle || collection.title),
      after: nextSeoTitle,
      changed: seoTitleChanged
    },
    {
      field: "seo.description",
      label: "Collection meta description",
      before: normalizeText(collection.seoDescription) || "No collection meta description",
      after: nextSeoDescription,
      changed: seoDescriptionChanged
    },
    {
      field: "descriptionHtml",
      label: "Collection buying guide",
      before: alreadyApplied ? "ACE ZERO TRADING collection guide already exists." : normalizeHtmlText(currentDescription) || "No collection guide",
      after: normalizeHtmlText(nextGuideBlock),
      changed: descriptionAppended
    }
  ];
  const summary = diff.filter((entry) => entry.changed).map((entry) => entry.label);

  return {
    hasChanges: summary.length > 0,
    changes,
    diff,
    descriptionAppended,
    summary
  };
}
