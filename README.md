# AceStudio

AceStudio is a Shopify-focused ecommerce content workspace for turning product photos into generated image sets, editable SEO copy, product readiness checks, and Shopify draft publishing.

## What is implemented

- Next.js App Router web app in `apps/web`
- Product image upload with file type and 10MB validation
- Supabase Auth, database tables, row-level security policies, and Storage-backed media
- Per-user product drafts, jobs, Shopify store connection, usage history, credits, and launch readiness
- Dashboard, product list, upload, product workspace, Shopify settings, usage, billing, support, and legal pages
- OpenAI image and copy generation with credit spending and refund handling on failed image generation
- Shopify OAuth connection and Shopify draft/live product publishing through the Admin GraphQL API
- Generated Shopify media ordering controls, product listing quality checks, and saved Shopify publish history
- OpenAI model env defaults for `gpt-5.3` text organization and `gpt-image-2` image generation/editing

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Before shipping a change, run:

```bash
npm run lint
npm run build
```

For a lightweight public-route smoke test, run the app locally or point the
test at production:

```bash
SMOKE_TEST_BASE_URL=https://acezerotrading.com npm run test:smoke
```

The production health endpoint is available at `/api/health`. It returns `200`
only when required launch checks are ready; otherwise it returns `503` with a
summary count of missing settings.

## Production environment

Set these in Vercel before inviting real users:

```bash
NEXT_PUBLIC_APP_URL=https://your-public-app-url.example.com
APP_PUBLIC_URL=https://your-public-app-url.example.com
OPENAI_API_KEY=xxxxxxxxx
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=xxxxxxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxxxxxx
NEXT_PUBLIC_SUPPORT_EMAIL=support@example.com
ADMIN_EMAILS=you@example.com
CRON_SECRET=generate-a-long-random-secret
SHOPIFY_TOKEN_ENCRYPTION_KEY=generate-a-long-random-secret
SHOPIFY_CLIENT_ID=xxxxxxxxx
SHOPIFY_CLIENT_SECRET=xxxxxxxxx
STRIPE_SECRET_KEY=sk_live_or_sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

Run `apps/web/supabase/migrations/001_app_state.sql` in the Supabase SQL editor, then open `/launch` to confirm the production checks.

## Shopify publishing

Open `/settings/shopify` and connect a store with Shopify OAuth. The manual credential form is still available as a local fallback, but OAuth is the intended standalone web app flow.

Server environment for OAuth:

```bash
SHOPIFY_CLIENT_ID=xxxxxxxxx
SHOPIFY_CLIENT_SECRET=xxxxxxxxx
APP_PUBLIC_URL=https://your-public-app-url.example.com
SHOPIFY_TOKEN_ENCRYPTION_KEY=generate-a-long-random-secret
```

In the Shopify Dev Dashboard, configure:

```text
App URL: https://your-public-app-url.example.com/settings/shopify
Allowed redirection URL: https://your-public-app-url.example.com/api/shopify/oauth/callback
```

For local OAuth testing, Shopify must be able to redirect back to your machine. Use a public tunnel such as ngrok or Cloudflare Tunnel and set `APP_PUBLIC_URL` to that public tunnel URL.

Use Shopify scopes `read_products`, `write_products`, `write_files`, `read_locations`, `write_inventory`, `read_publications`, and `write_publications` so local product images, price, SKU, inventory, and live sales-channel publication can be pushed to Shopify.

`SHOPIFY_TOKEN_ENCRYPTION_KEY` encrypts newly saved Shopify Admin tokens and manual client secrets before database storage. Existing plaintext tokens remain readable for backwards compatibility; reconnect a store after setting the key to re-save it encrypted.

Generated images are sent to Shopify only when they resolve to public `https` URLs. In production, set:

```bash
APP_PUBLIC_URL=https://your-deployed-app.example.com
```

Without a public app URL, the product draft still publishes with title, description, bullets, FAQ, tags, and product type, but local `/uploads/...` images are skipped.

## Operations and support

AceStudio includes a few production-support foundations that do not require a
paid queue provider yet:

- `/admin` is admin-only and supports searching by user email, store domain,
  product, job id, or error text for customer support.
- `/account` includes JSON account export and account deletion controls for
  privacy requests.
- `/usage` includes CSV exports for job history and credit ledger entries.
- `/api/cron/growth-monitor` runs Growth Monitor and also marks stale queued or
  processing jobs as failed so users can retry instead of being stuck forever.
- `npm run test:smoke` checks the public shell, login page, resources, robots,
  sitemap, and health endpoint.
- `/qa` is an admin-only real-user release checklist covering registration,
  Google login, Shopify OAuth, upload, image generation, copy generation,
  Shopify draft publishing, Stripe credits, Growth scan, and Growth write-back.

For higher-volume usage, replace the `after()`-style generation flow with a
durable queue such as Inngest, Trigger.dev, BullMQ + Redis, or Supabase Queues.

## Product documentation

Public docs live under `/resources` and are generated from
`apps/web/lib/seo-resources.ts`. Current guides cover getting started, Shopify
connection, credit pricing, AI image generation, draft publishing, and SEO/GEO
scoring. Add new guides there so sitemap, structured data, and resource cards
stay consistent.
