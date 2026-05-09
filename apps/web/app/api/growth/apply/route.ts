import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { GROWTH_APPLY_CREDIT_COST, grantCredits, spendCredits } from "@/lib/credits";
import type { GrowthRewriteDraft } from "@/lib/growth-rewrite-plan";
import { parseGrowthFixFields, type GrowthFixOverrides } from "@/lib/growth-fix-plan";
import {
  applyGrowthFixToShopify,
  applyGrowthRewriteToShopify,
  previewGrowthFixForShopify,
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
  const confirmed = body.confirmed === true;
  const rewrite = parseRewrite(body.rewrite);
  const applySearchConsoleRewrite = body.mode === "search_console_rewrite" || Boolean(rewrite);
  const selectedFields = parseGrowthFixFields(body.selectedFields);
  const overrides = parseFixOverrides(body.overrides);

  if (!confirmed) {
    return NextResponse.json({ error: "Confirm the suggested SEO/GEO changes before applying them." }, { status: 400 });
  }
  if (!productId) {
    return NextResponse.json({ error: "Missing Shopify product ID." }, { status: 400 });
  }

  const state = await readState();
  if (!state.shopifyConnection?.isActive) {
    return NextResponse.json({ error: "Connect Shopify before applying Growth Studio fixes." }, { status: 400 });
  }

  if (applySearchConsoleRewrite) {
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
  } else {
    try {
      const preview = await previewGrowthFixForShopify({
        connection: state.shopifyConnection,
        productId,
        selectedFields,
        overrides
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
    reason: applySearchConsoleRewrite ? "growth_search_console_rewrite" : "growth_apply",
    productId
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
    const result = applySearchConsoleRewrite && rewrite
      ? await applyGrowthRewriteToShopify({
        connection: state.shopifyConnection,
        productId,
        rewrite
      })
      : await applyGrowthFixToShopify({
        connection: state.shopifyConnection,
        productId,
        selectedFields,
        overrides
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
      reason: applySearchConsoleRewrite ? "growth_search_console_rewrite_refund" : "growth_apply_refund",
      productId
    }).catch(() => null);

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not apply Growth Studio fixes." },
      { status: 502 }
    );
  }
}
