import "server-only";

const SHOPIFY_API_VERSION = "2026-04";
const APP_UNINSTALLED_TOPIC = "APP_UNINSTALLED";

type ShopifyGraphQLResponse<T> = {
  data?: T;
  errors?: Array<{ message: string }>;
};

type WebhookSubscriptionNode = {
  id: string;
  topic: string;
  uri: string;
};

type WebhookSubscriptionsPayload = {
  webhookSubscriptions: {
    nodes: WebhookSubscriptionNode[];
  };
};

type WebhookSubscriptionCreatePayload = {
  webhookSubscriptionCreate: {
    webhookSubscription: WebhookSubscriptionNode | null;
    userErrors: Array<{ field?: string[]; message: string }>;
  };
};

export type ShopifyWebhookRegistrationResult =
  | {
      ok: true;
      uri: string;
      status: "already_registered" | "registered";
      subscriptionId?: string;
    }
  | {
      ok: false;
      uri: string;
      error: string;
    };

async function shopifyGraphQL<T>({
  shopDomain,
  accessToken,
  query,
  variables
}: {
  shopDomain: string;
  accessToken: string;
  query: string;
  variables?: Record<string, unknown>;
}) {
  const response = await fetch(`https://${shopDomain}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": accessToken
    },
    body: JSON.stringify({ query, variables: variables ?? {} })
  });
  const payload = (await response.json()) as ShopifyGraphQLResponse<T>;

  if (!response.ok) {
    throw new Error(`Shopify GraphQL request failed (${response.status}).`);
  }
  if (payload.errors?.length) {
    throw new Error(payload.errors.map((error) => error.message).join("; "));
  }

  return payload.data;
}

function webhookUri(appBaseUrl: string) {
  return `${appBaseUrl.replace(/\/$/, "")}/api/shopify/webhooks`;
}

export async function registerShopifyUninstallWebhook({
  shopDomain,
  accessToken,
  appBaseUrl
}: {
  shopDomain: string;
  accessToken: string;
  appBaseUrl: string;
}): Promise<ShopifyWebhookRegistrationResult> {
  const uri = webhookUri(appBaseUrl);

  try {
    const existing = await shopifyGraphQL<WebhookSubscriptionsPayload>({
      shopDomain,
      accessToken,
      query: `
        query ExistingWebhookSubscriptions($first: Int!) {
          webhookSubscriptions(first: $first) {
            nodes {
              id
              topic
              uri
            }
          }
        }
      `,
      variables: { first: 50 }
    });
    const existingSubscription = existing?.webhookSubscriptions.nodes.find(
      (subscription) => subscription.topic === APP_UNINSTALLED_TOPIC && subscription.uri === uri
    );

    if (existingSubscription) {
      return {
        ok: true,
        uri,
        status: "already_registered",
        subscriptionId: existingSubscription.id
      };
    }

    const created = await shopifyGraphQL<WebhookSubscriptionCreatePayload>({
      shopDomain,
      accessToken,
      query: `
        mutation WebhookSubscriptionCreate(
          $topic: WebhookSubscriptionTopic!
          $webhookSubscription: WebhookSubscriptionInput!
        ) {
          webhookSubscriptionCreate(topic: $topic, webhookSubscription: $webhookSubscription) {
            webhookSubscription {
              id
              topic
              uri
            }
            userErrors {
              field
              message
            }
          }
        }
      `,
      variables: {
        topic: APP_UNINSTALLED_TOPIC,
        webhookSubscription: { uri }
      }
    });

    const result = created?.webhookSubscriptionCreate;
    const userErrors = result?.userErrors ?? [];
    if (userErrors.length) {
      const message = userErrors.map((error) => error.message).join("; ");
      if (/already|taken|exists/i.test(message)) {
        return {
          ok: true,
          uri,
          status: "already_registered"
        };
      }

      return {
        ok: false,
        uri,
        error: message
      };
    }

    return {
      ok: true,
      uri,
      status: "registered",
      subscriptionId: result?.webhookSubscription?.id
    };
  } catch (error) {
    return {
      ok: false,
      uri,
      error: error instanceof Error ? error.message : "Could not register Shopify uninstall webhook."
    };
  }
}
