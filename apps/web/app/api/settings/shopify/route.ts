import { NextResponse } from "next/server";
import { readState, saveShopifyConnection } from "@/lib/store";
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
