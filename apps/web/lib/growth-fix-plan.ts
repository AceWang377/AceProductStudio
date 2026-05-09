export type GrowthFixField = "seo.title" | "seo.description" | "tags" | "descriptionHtml";

export const GROWTH_FIX_FIELDS: GrowthFixField[] = ["seo.title", "seo.description", "tags", "descriptionHtml"];

export type GrowthFixProduct = {
  id: string;
  title: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  tags?: string[];
  descriptionHtml?: string | null;
};

export type GrowthFixSuggestion = {
  seoTitle: string;
  seoDescription: string;
  tags: string[];
  descriptionAppendHtml: string;
};

export type GrowthFixOverrides = {
  seoTitle?: string;
  seoDescription?: string;
  tags?: string[];
  descriptionAppendHtml?: string;
  descriptionAppendText?: string;
};

export type GrowthFixDiffEntry = {
  field: GrowthFixField;
  label: string;
  before: string;
  after: string;
  changed: boolean;
};

export type GrowthFixPlan = {
  hasChanges: boolean;
  changes: {
    seo?: {
      title?: string;
      description?: string;
    };
    tags?: string[];
    descriptionHtml?: string;
  };
  diff: GrowthFixDiffEntry[];
  descriptionAppended: boolean;
  summary: string[];
};

const ANSWER_BLOCK_MARKER = "Product details for search and AI discovery";

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

function buildAnswerBlockFromText(value: string) {
  const clean = normalizeText(value);
  if (!clean) return "";

  return [
    "<section>",
    `<h3>${ANSWER_BLOCK_MARKER}</h3>`,
    `<p>${escapeHtml(clean)}</p>`,
    "</section>"
  ].join("");
}

function sameText(left?: string | null, right?: string | null) {
  return normalizeText(left).toLowerCase() === normalizeText(right).toLowerCase();
}

function normalizeTags(tags?: string[]) {
  return Array.from(new Set((tags ?? []).map((tag) => tag.trim()).filter(Boolean)));
}

function sameTags(left?: string[], right?: string[]) {
  const normalizedLeft = normalizeTags(left).map((tag) => tag.toLowerCase()).sort();
  const normalizedRight = normalizeTags(right).map((tag) => tag.toLowerCase()).sort();
  return normalizedLeft.length === normalizedRight.length && normalizedLeft.every((tag, index) => tag === normalizedRight[index]);
}

function getSelectedFields(selectedFields?: GrowthFixField[]) {
  return new Set(selectedFields ?? GROWTH_FIX_FIELDS);
}

export function parseGrowthFixFields(value: unknown): GrowthFixField[] | undefined {
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) return [];
  const fieldSet = new Set(GROWTH_FIX_FIELDS);
  return value.filter((field): field is GrowthFixField => typeof field === "string" && fieldSet.has(field as GrowthFixField));
}

export function buildGrowthFixPlan({
  product,
  suggestedFix,
  selectedFields,
  overrides
}: {
  product: GrowthFixProduct;
  suggestedFix: GrowthFixSuggestion;
  selectedFields?: GrowthFixField[];
  overrides?: GrowthFixOverrides;
}): GrowthFixPlan {
  const selected = getSelectedFields(selectedFields);
  const currentDescription = product.descriptionHtml || "";
  const alreadyApplied = currentDescription.includes(ANSWER_BLOCK_MARKER);
  const nextSeoTitle = normalizeText(overrides?.seoTitle) || suggestedFix.seoTitle;
  const nextSeoDescription = normalizeText(overrides?.seoDescription) || suggestedFix.seoDescription;
  const nextTags = normalizeTags(overrides?.tags?.length ? overrides.tags : suggestedFix.tags);
  const nextAnswerBlock =
    buildAnswerBlockFromText(overrides?.descriptionAppendText ?? "") ||
    normalizeText(overrides?.descriptionAppendHtml) ||
    suggestedFix.descriptionAppendHtml;
  const nextDescription = alreadyApplied
    ? currentDescription
    : `${currentDescription}${currentDescription ? "\n" : ""}${nextAnswerBlock}`;

  const seoTitleChanged = selected.has("seo.title") && !sameText(product.seoTitle || product.title, nextSeoTitle);
  const seoDescriptionChanged = selected.has("seo.description") && !sameText(product.seoDescription, nextSeoDescription);
  const tagsChanged = selected.has("tags") && !sameTags(product.tags, nextTags);
  const descriptionAppended = selected.has("descriptionHtml") && !alreadyApplied;
  const changes: GrowthFixPlan["changes"] = {};

  if (seoTitleChanged || seoDescriptionChanged) {
    changes.seo = {};
    if (seoTitleChanged) changes.seo.title = nextSeoTitle;
    if (seoDescriptionChanged) changes.seo.description = nextSeoDescription;
  }
  if (tagsChanged) {
    changes.tags = nextTags;
  }
  if (descriptionAppended) {
    changes.descriptionHtml = nextDescription;
  }

  const diff: GrowthFixDiffEntry[] = [
    {
      field: "seo.title",
      label: "SEO title",
      before: normalizeText(product.seoTitle || product.title),
      after: nextSeoTitle,
      changed: seoTitleChanged
    },
    {
      field: "seo.description",
      label: "Meta description",
      before: normalizeText(product.seoDescription) || "No meta description",
      after: nextSeoDescription,
      changed: seoDescriptionChanged
    },
    {
      field: "tags",
      label: "Product tags / keywords",
      before: normalizeTags(product.tags).join(", ") || "No product tags",
      after: nextTags.join(", "),
      changed: tagsChanged
    },
    {
      field: "descriptionHtml",
      label: "Answer-ready product content",
      before: alreadyApplied ? "AceStudio buyer Q&A already exists." : normalizeHtmlText(currentDescription) || "No AceStudio answer block",
      after: normalizeHtmlText(nextAnswerBlock),
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
