import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { GROWTH_APPLY_CREDIT_COST, grantCredits, spendCredits } from "@/lib/credits";
import { applyGrowthFixToShopify } from "@/lib/shopify-growth";
import { readState } from "@/lib/store";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in before applying Growth Studio fixes." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const productId = typeof body.productId === "string" ? body.productId : "";
  const confirmed = body.confirmed === true;

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

  const creditSpend = await spendCredits({
    amount: GROWTH_APPLY_CREDIT_COST,
    reason: "growth_apply",
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
    const result = await applyGrowthFixToShopify({
      connection: state.shopifyConnection,
      productId
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
      reason: "growth_apply_refund",
      productId
    }).catch(() => null);

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not apply Growth Studio fixes." },
      { status: 502 }
    );
  }
}
