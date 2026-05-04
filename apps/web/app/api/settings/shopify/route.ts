import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { isAdminEmail } from "@/lib/credits";
import { disconnectShopifyConnection, readState, saveShopifyConnection } from "@/lib/store";
import type { ShopifyConnection } from "@/lib/types";

function redactConnection(connection?: ShopifyConnection) {
  if (!connection) return null;
  const {
    adminAccessToken: _adminAccessToken,
    clientSecret: _clientSecret,
    ...safeConnection
  } = connection;
  return safeConnection;
}

export async function GET() {
  const state = await readState();
  return NextResponse.json(redactConnection(state.shopifyConnection));
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in before connecting Shopify." }, { status: 401 });
  }
  if (!isAdminEmail(user.email)) {
    return NextResponse.json(
      { error: "Manual Shopify credentials are restricted to admin accounts. Use Shopify OAuth instead." },
      { status: 403 }
    );
  }

  const body = await request.json();
  if (!body.shopDomain) {
    return NextResponse.json(
      { error: "Shop domain is required." },
      { status: 400 }
    );
  }
  if (!body.adminAccessToken && !(body.clientId && body.clientSecret)) {
    return NextResponse.json(
      { error: "Enter an Admin API token, or enter both Client ID and Client secret." },
      { status: 400 }
    );
  }

  const connection = await saveShopifyConnection({
    shopDomain: body.shopDomain,
    adminAccessToken: body.adminAccessToken || "",
    clientId: body.clientId || "",
    clientSecret: body.clientSecret || ""
  });
  return NextResponse.json(redactConnection(connection));
}

export async function DELETE() {
  await disconnectShopifyConnection();
  return NextResponse.json({ disconnected: true });
}
