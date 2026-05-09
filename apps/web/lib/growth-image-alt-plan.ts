export type GrowthImageAltMedia = {
  id: string;
  url?: string | null;
  alt?: string | null;
};

export type GrowthImageAltProduct = {
  id: string;
  title: string;
  productType?: string | null;
  tags?: string[];
  media: GrowthImageAltMedia[];
};

export type GrowthImageAltUpdate = {
  id: string;
  alt: string;
};

export type GrowthImageAltDiffEntry = {
  field: "imageAltText";
  mediaId: string;
  label: string;
  before: string;
  after: string;
  changed: boolean;
};

export type GrowthImageAltPlan = {
  hasChanges: boolean;
  mediaUpdates: GrowthImageAltUpdate[];
  diff: GrowthImageAltDiffEntry[];
  summary: string[];
};

const WEAK_ALT_PATTERNS = [
  /^$/,
  /^image$/i,
  /^photo$/i,
  /^product$/i,
  /^img[_-]?\d+$/i,
  /^dsc[_-]?\d+$/i,
  /^screenshot/i,
  /^untitled/i
];

function normalizeText(value?: string | null) {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function titleCaseWord(value: string) {
  return value.slice(0, 1).toUpperCase() + value.slice(1);
}

function keywordFromUrl(value?: string | null) {
  if (!value) return "";
  try {
    const url = new URL(value);
    const file = url.pathname.split("/").pop() ?? "";
    return file
      .replace(/\.[a-z0-9]+$/i, "")
      .replace(/[_-]+/g, " ")
      .replace(/\b(img|dsc|image|photo|copy|\d+)\b/gi, " ")
      .replace(/\s+/g, " ")
      .trim();
  } catch {
    return "";
  }
}

function isWeakAlt(value?: string | null) {
  const normalized = normalizeText(value);
  if (normalized.length < 12) return true;
  return WEAK_ALT_PATTERNS.some((pattern) => pattern.test(normalized));
}

function uniqueTerms(values: string[]) {
  const seen = new Set<string>();
  return values
    .flatMap((value) => normalizeText(value).split(/[,|]/))
    .map((value) => value.trim())
    .filter(Boolean)
    .filter((value) => {
      const key = value.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function truncate(value: string, maxLength: number) {
  if (value.length <= maxLength) return value;
  return value.slice(0, maxLength - 1).replace(/\s+\S*$/, "").trim();
}

function imageRole(index: number, url?: string | null) {
  const keyword = keywordFromUrl(url).toLowerCase();
  if (/lifestyle|model|hand|wear|room|home|outdoor/.test(keyword)) return "lifestyle photo";
  if (/detail|close|macro|texture|side|back/.test(keyword)) return "detail photo";
  if (/white|front|main|hero/.test(keyword)) return "main product photo";
  return index === 0 ? "main product photo" : `${titleCaseWord(index === 1 ? "detail" : "supporting")} photo`;
}

export function buildGrowthImageAltPlan({ product }: { product: GrowthImageAltProduct }): GrowthImageAltPlan {
  const title = normalizeText(product.title) || "Product";
  const contextTerms = uniqueTerms([
    product.productType ?? "",
    ...(product.tags ?? [])
  ])
    .filter((term) => !title.toLowerCase().includes(term.toLowerCase()))
    .slice(0, 2);

  const diff: GrowthImageAltDiffEntry[] = [];
  const mediaUpdates: GrowthImageAltUpdate[] = [];

  product.media.forEach((media, index) => {
    if (!media.id || !isWeakAlt(media.alt)) return;
    const role = imageRole(index, media.url);
    const urlKeyword = keywordFromUrl(media.url);
    const parts = [
      title,
      ...contextTerms,
      urlKeyword && !title.toLowerCase().includes(urlKeyword.toLowerCase()) ? urlKeyword : "",
      role
    ].filter(Boolean);
    const alt = truncate(uniqueTerms(parts).join(" "), 125);
    mediaUpdates.push({ id: media.id, alt });
    diff.push({
      field: "imageAltText",
      mediaId: media.id,
      label: `Image ${index + 1} alt text`,
      before: normalizeText(media.alt) || "No alt text",
      after: alt,
      changed: true
    });
  });

  return {
    hasChanges: mediaUpdates.length > 0,
    mediaUpdates,
    diff,
    summary: mediaUpdates.length ? [`${mediaUpdates.length} image alt text ${mediaUpdates.length === 1 ? "update" : "updates"}`] : []
  };
}
