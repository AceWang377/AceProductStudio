export type CreditPack = {
  id: string;
  name: string;
  description: string;
  credits: number;
  unitAmount: number;
  currency: "usd";
};

export const CREDIT_PACKS: CreditPack[] = [
  {
    id: "starter",
    name: "Starter",
    description: "Enough for first customer demos and small product batches.",
    credits: 30,
    unitAmount: 500,
    currency: "usd"
  },
  {
    id: "studio",
    name: "Studio",
    description: "Best for regular Shopify draft creation.",
    credits: 100,
    unitAmount: 1500,
    currency: "usd"
  },
  {
    id: "growth",
    name: "Growth",
    description: "Lower cost per image for larger catalogs.",
    credits: 300,
    unitAmount: 3900,
    currency: "usd"
  }
];

export function getCreditPack(packId: string) {
  return CREDIT_PACKS.find((pack) => pack.id === packId) ?? null;
}

export function formatPackPrice(pack: CreditPack) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: pack.currency.toUpperCase()
  }).format(pack.unitAmount / 100);
}

export function isStripeBillingConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET);
}
