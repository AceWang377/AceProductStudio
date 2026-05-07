# Real User QA Runbook

Run this before inviting new merchants, changing auth, changing Shopify publish
logic, switching Stripe modes, or releasing Growth Studio write-back.

Open the in-app admin checklist at `/qa`. It persists pass/fail state and notes
in the browser so you can paste evidence links, Shopify product links, Stripe
event IDs, screenshots, and failed job IDs.

## Test account setup

- Use a non-admin merchant test account for the main run.
- Use Google login and email/password registration at least once.
- Use a Shopify development store with one live/listed product and one unlisted
  product.
- Use Stripe sandbox card `4242 4242 4242 4242` for routine billing QA.
- Do not use real money until Stripe live mode is ready. For live validation,
  use the smallest pack once, then confirm credits and receipts.

## Required flow

1. Register with email and password.
2. Sign in with Google.
3. Connect Shopify through OAuth.
4. Upload a product image.
5. Generate the required product image set.
6. Generate Shopify SEO copy.
7. Publish a Shopify draft and open the Shopify Admin product link.
8. Buy credits through Stripe Checkout.
9. Run Growth Studio SEO/GEO scan.
10. Approve one Growth write-back and verify the Shopify update.

## Release evidence

For every run, collect:

- Test user email.
- Connected Shopify store domain.
- AceStudio product URL.
- Shopify draft product URL.
- Image generation job ID.
- Copy generation job ID.
- Shopify publish job ID.
- Stripe Checkout Session ID or event ID.
- Growth scan target URL.
- Growth write-back job ID.

## Stop-ship failures

- A non-admin user can see another user's product, job, store, credit, or history.
- OAuth returns to localhost or a certificate warning page.
- Shopify draft publishes live without explicit confirmation.
- Generated media order is wrong or includes the original upload.
- Stripe success return adds credits without a verified webhook.
- Growth Studio lists unlisted Shopify products for optimization.
- Growth write-back updates Shopify without explicit approval.
