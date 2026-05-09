export type GrowthInternalLinkSourceType = "product" | "collection";

export type GrowthInternalLinkSuggestionInput = {
  key: string;
  sourceId: string;
  sourceType: GrowthInternalLinkSourceType;
  sourceTitle: string;
  targetTitle: string;
  targetUrl?: string;
  linkType: "product_to_collection" | "collection_to_product" | "product_to_product" | "blog_to_product";
  anchorText: string;
  reason: string;
  priority: "high" | "medium" | "low";
};

export type GrowthInternalLinkSource = {
  id: string;
  title: string;
  descriptionHtml?: string | null;
};

export type GrowthInternalLinkPlan = {
  hasChanges: boolean;
  changes: {
    descriptionHtml?: string;
  };
  diff: Array<{
    field: "descriptionHtml";
    label: string;
    before: string;
    after: string;
    changed: boolean;
  }>;
  summary: string[];
  reason?: string;
};

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

function safeTargetUrl(value?: string) {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

function fingerprint(value: string) {
  return value.toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "");
}

function linkAlreadyExists(descriptionHtml: string, targetUrl: string, marker: string) {
  return descriptionHtml.includes(marker) || fingerprint(descriptionHtml).includes(fingerprint(targetUrl));
}

function buildLinkBlock(suggestion: GrowthInternalLinkSuggestionInput, targetUrl: string) {
  const marker = `data-acestudio-internal-link="${escapeHtml(suggestion.key)}"`;
  const intro =
    suggestion.linkType === "collection_to_product"
      ? `Recommended product:`
      : suggestion.linkType === "product_to_collection"
        ? `Explore the related collection:`
        : `Related option:`;

  return [
    `<section ${marker}>`,
    `<p>${intro} <a href="${escapeHtml(targetUrl)}">${escapeHtml(suggestion.anchorText)}</a>.</p>`,
    "</section>"
  ].join("");
}

export function buildGrowthInternalLinkPlan({
  source,
  suggestion
}: {
  source: GrowthInternalLinkSource;
  suggestion: GrowthInternalLinkSuggestionInput;
}): GrowthInternalLinkPlan {
  const targetUrl = safeTargetUrl(suggestion.targetUrl);
  if (!targetUrl) {
    return {
      hasChanges: false,
      changes: {},
      diff: [],
      summary: [],
      reason: "Invalid internal link target URL."
    };
  }

  const currentDescription = source.descriptionHtml || "";
  const marker = `data-acestudio-internal-link="${suggestion.key}"`;
  if (linkAlreadyExists(currentDescription, targetUrl, marker)) {
    return {
      hasChanges: false,
      changes: {},
      diff: [],
      summary: [],
      reason: "Internal link already exists on this Shopify page."
    };
  }

  const linkBlock = buildLinkBlock(suggestion, targetUrl);
  const descriptionHtml = `${currentDescription}${currentDescription ? "\n" : ""}${linkBlock}`;

  return {
    hasChanges: true,
    changes: { descriptionHtml },
    diff: [
      {
        field: "descriptionHtml",
        label: "Internal link",
        before: normalizeHtmlText(currentDescription) || "No page description",
        after: normalizeHtmlText(linkBlock),
        changed: true
      }
    ],
    summary: ["Internal link"]
  };
}
