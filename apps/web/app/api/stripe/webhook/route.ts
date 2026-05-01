import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { grantCreditsForUser } from "@/lib/credits";
import { getStripe, getStripeWebhookSecret } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = getStripeWebhookSecret();

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Stripe webhook is not configured." }, { status: 400 });
  }

  const rawBody = await request.text();
  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Invalid Stripe webhook signature."
      },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId || session.client_reference_id;
    const packId = session.metadata?.packId || "unknown_pack";
    const credits = Number(session.metadata?.credits ?? 0);

    if (session.payment_status === "paid" && userId && Number.isFinite(credits) && credits > 0) {
      await grantCreditsForUser({
        userId,
        amount: credits,
        reason: `stripe_credit_pack:${packId}`,
        stripePaymentId: session.id
      });
    }
  }

  return NextResponse.json({ received: true });
}
