import { NextResponse } from "next/server";
import { getCreditPack, isStripeBillingConfigured } from "@/lib/billing";
import { getCurrentUser } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";

function getAppBaseUrl(request: Request) {
  const explicit = process.env.APP_PUBLIC_URL?.trim() || process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  return new URL(request.url).origin;
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login?next=/billing", request.url), 303);
  }

  if (!isStripeBillingConfigured()) {
    return NextResponse.redirect(new URL("/billing?error=stripe_not_configured", request.url), 303);
  }

  const formData = await request.formData();
  const packId = String(formData.get("packId") ?? "");
  const pack = getCreditPack(packId);

  if (!pack) {
    return NextResponse.redirect(new URL("/billing?error=invalid_pack", request.url), 303);
  }

  try {
    const appBaseUrl = getAppBaseUrl(request);
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: user.email ?? undefined,
      client_reference_id: user.id,
      success_url: `${appBaseUrl}/billing?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appBaseUrl}/billing?checkout=canceled`,
      metadata: {
        userId: user.id,
        packId: pack.id,
        credits: String(pack.credits)
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: pack.currency,
            unit_amount: pack.unitAmount,
            product_data: {
              name: `${pack.credits} AceStudio credits`,
              description: pack.description
            }
          }
        }
      ]
    });

    if (!session.url) {
      return NextResponse.redirect(new URL("/billing?error=checkout_failed", request.url), 303);
    }

    return NextResponse.redirect(session.url, 303);
  } catch {
    return NextResponse.redirect(new URL("/billing?error=checkout_failed", request.url), 303);
  }
}
