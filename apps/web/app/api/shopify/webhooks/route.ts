import { NextResponse } from "next/server";
import { disconnectShopifyConnectionByShopDomain } from "@/lib/store";
import { verifyShopifyWebhook } from "@/lib/shopify-webhooks";

export async function POST(request: Request) {
  const rawBody = Buffer.from(await request.arrayBuffer());
  const verification = verifyShopifyWebhook(request, rawBody);

  if (!verification.ok) {
    return NextResponse.json(
      { error: verification.error },
      { status: verification.status }
    );
  }

  if (verification.topic !== "app/uninstalled") {
    return NextResponse.json({
      ok: true,
      ignored: true,
      topic: verification.topic
    });
  }

  const disconnectedCount = await disconnectShopifyConnectionByShopDomain(verification.shopDomain);

  return NextResponse.json({
    ok: true,
    topic: verification.topic,
    shopDomain: verification.shopDomain,
    webhookId: verification.webhookId,
    disconnectedCount
  });
}
