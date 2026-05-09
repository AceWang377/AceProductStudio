import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getCreditAccount, GROWTH_APPLY_CREDIT_COST } from "@/lib/credits";
import { parseGrowthFixFields, type GrowthFixOverrides } from "@/lib/growth-fix-plan";
import { previewGrowthFixForShopify } from "@/lib/shopify-growth";
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

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in before previewing Growth Studio fixes." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const productId = typeof body.productId === "string" ? body.productId : "";
  const selectedFields = parseGrowthFixFields(body.selectedFields);
  const overrides = parseFixOverrides(body.overrides);
  if (!productId) {
    return NextResponse.json({ error: "Missing Shopify product ID." }, { status: 400 });
  }

  const state = await readState();
  if (!state.shopifyConnection?.isActive) {
    return NextResponse.json({ error: "Connect Shopify before previewing Growth Studio fixes." }, { status: 400 });
  }

  try {
    const [preview, credits] = await Promise.all([
      previewGrowthFixForShopify({
        connection: state.shopifyConnection,
        productId,
        selectedFields,
        overrides
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
