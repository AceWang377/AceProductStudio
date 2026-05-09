import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getCreditAccount, GROWTH_APPLY_CREDIT_COST } from "@/lib/credits";
import { parseGrowthCollectionFixFields, type GrowthCollectionFixOverrides } from "@/lib/growth-collection-fix-plan";
import { parseGrowthFixFields, type GrowthFixOverrides } from "@/lib/growth-fix-plan";
import type { GrowthInternalLinkSuggestionInput } from "@/lib/growth-internal-link-plan";
import {
  previewGrowthCollectionFixForShopify,
  previewGrowthFixForShopify,
  previewGrowthImageAltForShopify,
  previewGrowthInternalLinkForShopify
} from "@/lib/shopify-growth";
import { readState } from "@/lib/store";

function parseFixOverrides(value: unknown): GrowthFixOverrides | undefined {
  if (!value || typeof value !== "object") return undefined;
  const input = value as Record<string, unknown>;
  const tags = Array.isArray(input.tags)
    ? input.tags.filter((tag): tag is string => typeof tag === "string").map((tag) => tag.trim()).filter(Boolean)
    : typeof input.tags === "string"
      ? input.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
      : undefined;

  return {
    seoTitle: typeof input.seoTitle === "string" ? input.seoTitle.trim() : undefined,
    seoDescription: typeof input.seoDescription === "string" ? input.seoDescription.trim() : undefined,
    tags,
    descriptionAppendHtml: typeof input.descriptionAppendHtml === "string" ? input.descriptionAppendHtml.trim() : undefined,
    descriptionAppendText: typeof input.descriptionAppendText === "string" ? input.descriptionAppendText.trim() : undefined
  };
}

function parseCollectionFixOverrides(value: unknown): GrowthCollectionFixOverrides | undefined {
  if (!value || typeof value !== "object") return undefined;
  const input = value as Record<string, unknown>;

  return {
    seoTitle: typeof input.seoTitle === "string" ? input.seoTitle.trim() : undefined,
    seoDescription: typeof input.seoDescription === "string" ? input.seoDescription.trim() : undefined,
    descriptionAppendHtml: typeof input.descriptionAppendHtml === "string" ? input.descriptionAppendHtml.trim() : undefined,
    descriptionAppendText: typeof input.descriptionAppendText === "string" ? input.descriptionAppendText.trim() : undefined
  };
}

function parseInternalLinkSuggestion(value: unknown): GrowthInternalLinkSuggestionInput | null {
  if (!value || typeof value !== "object") return null;
  const input = value as Record<string, unknown>;
  const sourceType = input.sourceType === "product" || input.sourceType === "collection" ? input.sourceType : null;
  const linkType =
    input.linkType === "product_to_collection" ||
    input.linkType === "collection_to_product" ||
    input.linkType === "product_to_product" ||
    input.linkType === "blog_to_product"
      ? input.linkType
      : null;
  const priority = input.priority === "high" || input.priority === "medium" || input.priority === "low" ? input.priority : "medium";
  const sourceId = typeof input.sourceId === "string" ? input.sourceId : "";
  const targetUrl = typeof input.targetUrl === "string" ? input.targetUrl : "";
  const anchorText = typeof input.anchorText === "string" ? input.anchorText.trim() : "";
  if (!sourceType || !linkType || !sourceId || !targetUrl || !anchorText) return null;

  return {
    key: typeof input.key === "string" ? input.key : `${sourceId}-${targetUrl}`,
    sourceId,
    sourceType,
    sourceTitle: typeof input.sourceTitle === "string" ? input.sourceTitle : "Source page",
    targetTitle: typeof input.targetTitle === "string" ? input.targetTitle : "Target page",
    targetUrl,
    linkType,
    anchorText,
    reason: typeof input.reason === "string" ? input.reason : "Add a contextual internal link.",
    priority
  };
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in before previewing Growth Studio fixes." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const productId = typeof body.productId === "string" ? body.productId : "";
  const targetType = body.targetType === "collection" ? "collection" : "product";
  const mode = typeof body.mode === "string" ? body.mode : "suggested_fix";
  const internalLink = parseInternalLinkSuggestion(body.internalLink);
  const selectedFields = targetType === "collection"
    ? parseGrowthCollectionFixFields(body.selectedFields)
    : parseGrowthFixFields(body.selectedFields);
  const overrides = targetType === "collection"
    ? parseCollectionFixOverrides(body.overrides)
    : parseFixOverrides(body.overrides);
  if (!productId) {
    if (mode !== "internal_link") {
      return NextResponse.json({ error: targetType === "collection" ? "Missing Shopify collection ID." : "Missing Shopify product ID." }, { status: 400 });
    }
  }

  const state = await readState();
  if (!state.shopifyConnection?.isActive) {
    return NextResponse.json({ error: "Connect Shopify before previewing Growth Studio fixes." }, { status: 400 });
  }

  try {
    const [preview, credits] = await Promise.all([
      mode === "image_alt"
        ? previewGrowthImageAltForShopify({
          connection: state.shopifyConnection,
          productId
        })
        : mode === "internal_link"
          ? internalLink
            ? previewGrowthInternalLinkForShopify({
              connection: state.shopifyConnection,
              suggestion: internalLink
            })
            : Promise.reject(new Error("Missing internal link suggestion."))
          : targetType === "collection"
        ? previewGrowthCollectionFixForShopify({
          connection: state.shopifyConnection,
          collectionId: productId,
          selectedFields: selectedFields as ReturnType<typeof parseGrowthCollectionFixFields>,
          overrides: overrides as GrowthCollectionFixOverrides | undefined
        })
        : previewGrowthFixForShopify({
          connection: state.shopifyConnection,
          productId,
          selectedFields: selectedFields as ReturnType<typeof parseGrowthFixFields>,
          overrides: overrides as GrowthFixOverrides | undefined
        }),
      getCreditAccount()
    ]);

    return NextResponse.json({
      status: "preview",
      ...preview,
      credits: {
        balance: credits.balance,
        required: preview.plan.hasChanges ? GROWTH_APPLY_CREDIT_COST : 0,
        isUnlimited: Boolean(credits.isUnlimited)
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not preview Growth Studio fixes." },
      { status: 502 }
    );
  }
}
