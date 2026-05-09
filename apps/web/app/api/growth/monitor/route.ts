import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { GROWTH_AUDIT_CREDIT_COST, grantCredits, spendCredits } from "@/lib/credits";
import { runGrowthMonitor } from "@/lib/growth-monitoring";
import { getGrowthAudit } from "@/lib/growth-audit";
import { listProducts, readState } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in before running Growth monitoring." }, { status: 401 });
  }

  const creditSpend = await spendCredits({
    amount: GROWTH_AUDIT_CREDIT_COST,
    reason: "growth_monitor"
  });

  if (!creditSpend.ok) {
    return NextResponse.json(
      {
        error: creditSpend.error || "Not enough credits to run Growth monitoring.",
        credits: {
          balance: creditSpend.balance,
          required: GROWTH_AUDIT_CREDIT_COST,
          isUnlimited: Boolean(creditSpend.isUnlimited)
        }
      },
      { status: 402 }
    );
  }

  try {
    const [products, state] = await Promise.all([listProducts(), readState()]);
    const audit = await getGrowthAudit({
      connection: state.shopifyConnection,
      workspaceProducts: products
    });
    const targetUrl = audit.primaryDomain || storefrontRootFromProductUrl(audit.products[0]?.product.onlineStoreUrl);
    if (!targetUrl) {
      throw new Error("Connect Shopify and make at least one Online Store product live/listed before running Growth monitoring.");
    }
    const output = await runGrowthMonitor({
      userId: user.id,
      storeId: state.shopifyConnection?.id,
      connection: state.shopifyConnection,
      targetUrl,
      products: audit.products.map((product) => product.product)
    });

    return NextResponse.json({
      status: "completed",
      output,
      credits: {
        balance: creditSpend.balance,
        spent: creditSpend.isUnlimited ? 0 : GROWTH_AUDIT_CREDIT_COST,
        isUnlimited: Boolean(creditSpend.isUnlimited)
      }
    });
  } catch (error) {
    await grantCredits({
      amount: GROWTH_AUDIT_CREDIT_COST,
      reason: "growth_monitor_refund"
    }).catch(() => null);

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Growth monitoring failed." },
      { status: 502 }
    );
  }
}

function storefrontRootFromProductUrl(value?: string) {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return `${url.protocol}//${url.hostname}`;
  } catch {
    return undefined;
  }
}
