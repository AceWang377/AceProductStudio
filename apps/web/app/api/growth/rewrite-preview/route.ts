import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getCreditAccount, GROWTH_APPLY_CREDIT_COST } from "@/lib/credits";
import type { GrowthRewriteDraft } from "@/lib/growth-rewrite-plan";
import { previewGrowthRewriteForShopify } from "@/lib/shopify-growth";
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

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in before previewing Shopify write-back." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const productId = typeof body.productId === "string" ? body.productId : "";
  const rewrite = parseRewrite(body.rewrite);

  if (!productId) {
    return NextResponse.json({ error: "Missing Shopify product ID." }, { status: 400 });
  }
  if (!rewrite) {
    return NextResponse.json({ error: "Missing Search Console rewrite draft." }, { status: 400 });
  }

  const state = await readState();
  if (!state.shopifyConnection?.isActive) {
    return NextResponse.json({ error: "Connect Shopify before previewing write-back." }, { status: 400 });
  }

  try {
    const [preview, credits] = await Promise.all([
      previewGrowthRewriteForShopify({
        connection: state.shopifyConnection,
        productId,
        rewrite
      }),
      getCreditAccount()
    ]);

    return NextResponse.json({
      status: "preview",
      ...preview,
      credits: {
        required: preview.plan.hasChanges ? GROWTH_APPLY_CREDIT_COST : 0,
        balance: credits.balance,
        isUnlimited: Boolean(credits.isUnlimited)
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not preview Shopify write-back." },
      { status: 502 }
    );
  }
}
