import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
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

  try {
    const result = await applyGrowthFixToShopify({
      connection: state.shopifyConnection,
      productId
    });
    return NextResponse.json({ status: "applied", ...result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not apply Growth Studio fixes." },
      { status: 502 }
    );
  }
}
