export type GrowthRewriteDraft = {
  seoTitle: string;
  seoDescription: string;
  faqQuestion: string;
  answerBlock: string;
  intent?: "commercial" | "informational" | "comparison" | "brand";
  confidence?: "high" | "medium" | "low";
};

export type GrowthRewriteProduct = {
  id: string;
  title: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  descriptionHtml?: string | null;
};

export type GrowthRewriteDiffEntry = {
  field: "seo.title" | "seo.description" | "descriptionHtml";
  label: string;
  before: string;
  after: string;
  changed: boolean;
};

export type GrowthRewritePlan = {
  productId: string;
  hasChanges: boolean;
  changes: {
    seo?: {
      title?: string;
      description?: string;
    };
    descriptionHtml?: string;
  };
  diff: GrowthRewriteDiffEntry[];
  descriptionAppended: boolean;
  summary: string[];
};

const REWRITE_MARKER = "data-acestudio-growth-rewrite";
const MAX_TITLE_LENGTH = 70;
const MAX_DESCRIPTION_LENGTH = 165;

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

function clampSentence(value: string, maxLength: number) {
  const clean = normalizeText(value);
  if (clean.length <= maxLength) return clean;
  const sliced = clean.slice(0, maxLength + 1);
  const lastSpace = sliced.lastIndexOf(" ");
  const base = (lastSpace > maxLength * 0.68 ? sliced.slice(0, lastSpace) : sliced.slice(0, maxLength)).trim();
  return base.replace(/[,.:\-;]+$/g, "");
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildAnswerBlock(rewrite: GrowthRewriteDraft) {
  const question = normalizeText(rewrite.faqQuestion);
  const answer = normalizeText(rewrite.answerBlock);
  if (!question || !answer) return "";

  return [
    `<section ${REWRITE_MARKER}="true">`,
    `<h3>${escapeHtml(question)}</h3>`,
    `<p>${escapeHtml(answer)}</p>`,
    "</section>"
  ].join("");
}

function sameText(left?: string | null, right?: string | null) {
  return normalizeText(left).toLowerCase() === normalizeText(right).toLowerCase();
}

export function buildGrowthRewritePlan({
  product,
  rewrite
}: {
  product: GrowthRewriteProduct;
  rewrite: GrowthRewriteDraft;
}): GrowthRewritePlan {
  const nextTitle = clampSentence(rewrite.seoTitle, MAX_TITLE_LENGTH);
  const nextDescription = clampSentence(rewrite.seoDescription, MAX_DESCRIPTION_LENGTH);
  const currentTitle = normalizeText(product.seoTitle || product.title);
  const currentDescription = normalizeText(product.seoDescription);
  const currentHtml = product.descriptionHtml ?? "";
  const answerBlock = buildAnswerBlock(rewrite);
  const alreadyHasAnswerBlock = currentHtml.includes(REWRITE_MARKER);
  const nextHtml = answerBlock && !alreadyHasAnswerBlock
    ? `${currentHtml}${currentHtml.trim() ? "\n" : ""}${answerBlock}`
    : currentHtml;

  const titleChanged = Boolean(nextTitle) && !sameText(currentTitle, nextTitle);
  const descriptionChanged = Boolean(nextDescription) && !sameText(currentDescription, nextDescription);
  const descriptionAppended = Boolean(answerBlock) && !alreadyHasAnswerBlock;
  const changes: GrowthRewritePlan["changes"] = {};

  if (titleChanged || descriptionChanged) {
    changes.seo = {};
    if (titleChanged) changes.seo.title = nextTitle;
    if (descriptionChanged) changes.seo.description = nextDescription;
  }
  if (descriptionAppended) {
    changes.descriptionHtml = nextHtml;
  }

  const diff: GrowthRewriteDiffEntry[] = [
    {
      field: "seo.title",
      label: "SEO title",
      before: currentTitle,
      after: titleChanged ? nextTitle : currentTitle,
      changed: titleChanged
    },
    {
      field: "seo.description",
      label: "Meta description",
      before: currentDescription || "No meta description",
      after: descriptionChanged ? nextDescription : currentDescription || "No meta description",
      changed: descriptionChanged
    },
    {
      field: "descriptionHtml",
      label: "AI answer block",
      before: alreadyHasAnswerBlock ? "Search answer block already exists." : normalizeHtmlText(currentHtml) || "No product description",
      after: descriptionAppended ? normalizeHtmlText(answerBlock) : alreadyHasAnswerBlock ? "Search answer block already exists." : normalizeHtmlText(currentHtml) || "No product description",
      changed: descriptionAppended
    }
  ];

  const summary = diff
    .filter((entry) => entry.changed)
    .map((entry) => entry.label);

  return {
    productId: product.id,
    hasChanges: summary.length > 0,
    changes,
    diff,
    descriptionAppended,
    summary
  };
}
