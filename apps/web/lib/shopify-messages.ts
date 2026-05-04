export type ShopifyStatusMessage = {
  title: string;
  text: string;
};

const shopifyErrors: Record<string, ShopifyStatusMessage> = {
  callback_failed: {
    title: "Shopify connection failed",
    text: "Something interrupted the Shopify callback. Start the connection again."
  },
  invalid_shop: {
    title: "Shopify store domain was invalid",
    text: "Use the original myshopify.com domain or an admin.shopify.com/store/... URL."
  },
  missing_code: {
    title: "Shopify did not approve the connection",
    text: "No authorization code was returned. Start the connection again from this page."
  },
  not_configured: {
    title: "Shopify OAuth is not configured",
    text: "Add SHOPIFY_CLIENT_ID and SHOPIFY_CLIENT_SECRET in the server environment before connecting stores."
  },
  state_failed: {
    title: "Shopify connection expired",
    text: "The connection session expired or did not match this browser. Start the connection again."
  },
  signature_failed: {
    title: "Shopify security check failed",
    text: "The OAuth signature could not be verified. Start the connection again."
  },
  token_exchange_failed: {
    title: "Shopify token exchange failed",
    text: "Shopify approved the app but did not issue a store token. Check the app URL and redirect URL, then try again."
  }
};

export function getShopifyErrorMessage(value?: string): ShopifyStatusMessage | null {
  if (!value) return null;

  return (
    shopifyErrors[value] || {
      title: "Shopify connection failed",
      text: "Start the connection again. If it keeps happening, contact support."
    }
  );
}

