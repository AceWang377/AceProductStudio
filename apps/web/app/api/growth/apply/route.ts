import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { GROWTH_APPLY_CREDIT_COST, grantCredits, spendCredits } from "@/lib/credits";
import { parseGrowthCollectionFixFields, type GrowthCollectionFixOverrides } from "@/lib/growth-collection-fix-plan";
import type { GrowthInternalLinkSuggestionInput } from "@/lib/growth-internal-link-plan";
import type { GrowthRewriteDraft } from "@/lib/growth-rewrite-plan";
import { parseGrowthFixFields, type GrowthFixOverrides } from "@/lib/growth-fix-plan";
import {
  applyGrowthCollectionFixToShopify,
  applyGrowthFixToShopify,
  applyGrowthImageAltToShopify,
  applyGrowthInternalLinkToShopify,
  applyGrowthRewriteToShopify,
  previewGrowthCollectionFixForShopify,
  previewGrowthFixForShopify,
  previewGrowthImageAltForShopify,
  previewGrowthInternalLinkForShopify,
  previewGrowthRewriteForShopify
} from "@/lib/shopify-growth";
import { readState } from "@/lib/store";

function parseRewrite(value: unknown): GrowthRewriteDraft | null {
  if (!value || typeof value !== "object") return null;
  const rewrite = value as Record<string, unknown>;
  const seoTitle = typeof rewrite.seoTitle === "string" ? rewrite.seoTitle.trim() : "";
  const seoDescription = typeof rewrite.seoDescription === "string" ? rewrite.seoDescription.trim() : "";
  const faqQuestion = typeof rewrite.faqQuestion === "string" ? rewrite.faqQuestion.trim() : "";
  const answerBlock = typeof rewrite.answerBlock === "string" ? rewrite.answerBlock.trim() : "";
  if (!seoTitle && !seoDescription && !answerBlock) return null;

  return {
    seoTitle,
    seoDescription,
    faqQuestion,
    answerBlock,
    intent: rewrite.intent === "informational" || rewrite.intent === "comparison" || rewrite.intent === "brand"
      ? rewrite.intent
      : "commercial",
    confidence: rewrite.confidence === "low" || rewrite.confidence === "medium" || rewrite.confidence === "high"
      ? rewrite.confidence
      : "medium"
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

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in before applying Growth Studio fixes." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const productId = typeof body.productId === "string" ? body.productId : "";
  const targetType = body.targetType === "collection" ? "collection" : "product";
  const mode = typeof body.mode === "string" ? body.mode : "suggested_fix";
  const confirmed = body.confirmed === true;
  const rewrite = parseRewrite(body.rewrite);
  const applySearchConsoleRewrite = body.mode === "search_console_rewrite" || Boolean(rewrite);
  const internalLink = parseInternalLinkSuggestion(body.internalLink);
  const selectedFields = targetType === "collection"
    ? parseGrowthCollectionFixFields(body.selectedFields)
    : parseGrowthFixFields(body.selectedFields);
  const overrides = targetType === "collection"
    ? parseCollectionFixOverrides(body.overrides)
    : parseFixOverrides(body.overrides);

  if (!confirmed) {
    return NextResponse.json({ error: "Confirm the suggested SEO/GEO changes before applying them." }, { status: 400 });
  }
  if (!productId) {
    if (mode !== "internal_link") {
      return NextResponse.json({ error: targetType === "collection" ? "Missing Shopify collection ID." : "Missing Shopify product ID." }, { status: 400 });
    }
  }

  const state = await readState();
  if (!state.shopifyConnection?.isActive) {
    return NextResponse.json({ error: "Connect Shopify before applying Growth Studio fixes." }, { status: 400 });
  }

  if (targetType === "collection" && applySearchConsoleRewrite) {
    return NextResponse.json({ error: "Search Console rewrite write-back is currently available for product pages." }, { status: 400 });
  }

  if (mode === "image_alt") {
    try {
      const preview = await previewGrowthImageAltForShopify({
        connection: state.shopifyConnection,
        productId
      });
      if (!preview.plan.hasChanges) {
        return NextResponse.json({ error: "Image alt text is already strong enough for this Shopify product." }, { status: 400 });
      }
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Could not validate image alt text fixes." },
        { status: 502 }
      );
    }
  } else if (mode === "internal_link") {
    if (!internalLink) {
      return NextResponse.json({ error: "Missing internal link suggestion." }, { status: 400 });
    }
    try {
      const preview = await previewGrowthInternalLinkForShopify({
        connection: state.shopifyConnection,
        suggestion: internalLink
      });
      if (!preview.plan.hasChanges) {
        return NextResponse.json({ error: preview.plan.reason || "This internal link is already applied to Shopify." }, { status: 400 });
      }
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Could not validate the internal link write-back." },
        { status: 502 }
      );
    }
  } else if (applySearchConsoleRewrite) {
    if (!rewrite) {
      return NextResponse.json({ error: "Missing Search Console rewrite draft." }, { status: 400 });
    }

    try {
      const preview = await previewGrowthRewriteForShopify({
        connection: state.shopifyConnection,
        productId,
        rewrite
      });
      if (!preview.plan.hasChanges) {
        return NextResponse.json({ error: "This Search Console rewrite is already applied to Shopify." }, { status: 400 });
      }
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Could not validate the Search Console rewrite." },
        { status: 502 }
      );
    }
  } else if (targetType === "collection") {
    try {
      const preview = await previewGrowthCollectionFixForShopify({
        connection: state.shopifyConnection,
        collectionId: productId,
        selectedFields: selectedFields as ReturnType<typeof parseGrowthCollectionFixFields>,
        overrides: overrides as GrowthCollectionFixOverrides | undefined
      });
      if (!preview.plan.hasChanges) {
        return NextResponse.json({ error: "The suggested collection SEO/GEO fixes are already applied to Shopify." }, { status: 400 });
      }
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Could not validate the collection Growth Studio fixes." },
        { status: 502 }
      );
    }
  } else {
    try {
      const preview = await previewGrowthFixForShopify({
        connection: state.shopifyConnection,
        productId,
        selectedFields: selectedFields as ReturnType<typeof parseGrowthFixFields>,
        overrides: overrides as GrowthFixOverrides | undefined
      });
      if (!preview.plan.hasChanges) {
        return NextResponse.json({ error: "The suggested SEO/GEO fixes are already applied to Shopify." }, { status: 400 });
      }
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Could not validate the Growth Studio fixes." },
        { status: 502 }
      );
    }
  }

  const creditSpend = await spendCredits({
    amount: GROWTH_APPLY_CREDIT_COST,
    reason: mode === "image_alt"
      ? "growth_image_alt_apply"
      : mode === "internal_link"
        ? "growth_internal_link_apply"
        : applySearchConsoleRewrite
      ? "growth_search_console_rewrite"
      : targetType === "collection"
        ? "growth_collection_apply"
        : "growth_apply",
    productId: productId || internalLink?.sourceId
  });

  if (!creditSpend.ok) {
    return NextResponse.json(
      {
        error: creditSpend.error || "Not enough credits to apply Growth Studio fixes.",
        credits: {
          balance: creditSpend.balance,
          required: GROWTH_APPLY_CREDIT_COST,
          isUnlimited: Boolean(creditSpend.isUnlimited)
        }
      },
      { status: 402 }
    );
  }

  try {
    const result = mode === "image_alt"
      ? await applyGrowthImageAltToShopify({
        connection: state.shopifyConnection,
        productId
      })
      : mode === "internal_link" && internalLink
        ? await applyGrowthInternalLinkToShopify({
          connection: state.shopifyConnection,
          suggestion: internalLink
        })
      : applySearchConsoleRewrite && rewrite
      ? await applyGrowthRewriteToShopify({
        connection: state.shopifyConnection,
        productId,
        rewrite
      })
      : targetType === "collection"
        ? await applyGrowthCollectionFixToShopify({
          connection: state.shopifyConnection,
          collectionId: productId,
          selectedFields: selectedFields as ReturnType<typeof parseGrowthCollectionFixFields>,
          overrides: overrides as GrowthCollectionFixOverrides | undefined
        })
      : await applyGrowthFixToShopify({
        connection: state.shopifyConnection,
        productId,
        selectedFields: selectedFields as ReturnType<typeof parseGrowthFixFields>,
        overrides: overrides as GrowthFixOverrides | undefined
      });
    return NextResponse.json({
      status: "applied",
      ...result,
      credits: {
        balance: creditSpend.balance,
        spent: creditSpend.isUnlimited ? 0 : GROWTH_APPLY_CREDIT_COST,
        isUnlimited: Boolean(creditSpend.isUnlimited)
      }
    });
  } catch (error) {
    await grantCredits({
      amount: GROWTH_APPLY_CREDIT_COST,
      reason: mode === "image_alt"
        ? "growth_image_alt_apply_refund"
        : mode === "internal_link"
          ? "growth_internal_link_apply_refund"
          : applySearchConsoleRewrite
        ? "growth_search_console_rewrite_refund"
        : targetType === "collection"
          ? "growth_collection_apply_refund"
          : "growth_apply_refund",
      productId: productId || internalLink?.sourceId
    }).catch(() => null);

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not apply Growth Studio fixes." },
      { status: 502 }
    );
  }
}
