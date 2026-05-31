# AceProductStudio

AceProductStudio is an open-source reference implementation for building review-first AI commerce workflows. It shows how to combine Next.js, OpenAI, Supabase, Shopify OAuth, Stripe credits, privacy controls, and release QA in one production-shaped application.

The hosted product using this codebase is ACE ZERO TRADING, but the repository is intended to be useful beyond that product: it is a practical starter and learning resource for maintainers building AI-assisted ecommerce tools that keep humans in control before publishing changes to live stores.

## Open-Source Purpose

This project exists to document and improve reliable patterns for AI commerce applications:

- Human-review-first generation for product copy, images, SEO suggestions, and Shopify publishing.
- Safe integration boundaries for OpenAI, Shopify Admin GraphQL, Supabase Auth/RLS/Storage, and Stripe Checkout.
- Privacy and operations surfaces such as account export, account deletion, usage export, admin support search, and launch readiness checks.
- Repeatable maintainer workflows for smoke tests, release QA, security review, and public documentation.

The root package is marked `private: true` only to prevent accidental npm publication of the app workspace. The source is intended to be public and reusable under the MIT license.

## What Is Implemented

- Next.js App Router web app in `apps/web`.
- Product image upload with file type and 10 MB validation.
- Supabase Auth, database tables, row-level security policies, and Storage-backed media.
- Per-user product drafts, jobs, Shopify store connection, usage history, credits, and launch readiness.
- Dashboard, product list, upload, product workspace, Shopify settings, usage, billing, support, and legal pages.
- OpenAI image and copy generation with credit spending and refund handling on failed image generation.
- Shopify OAuth connection and Shopify draft/live product publishing through the Admin GraphQL API.
- Generated Shopify media ordering controls, product listing quality checks, and saved Shopify publish history.
- Growth Studio style SEO/GEO checks, monitoring, and write-back review flows.
- Smoke tests, QA suite checks, and production health checks.

## Repository Layout

```text
apps/web                 Next.js application, routes, components, scripts
apps/web/supabase        Supabase SQL migrations
packages/ai              OpenAI copy and image service helpers
packages/database        Prisma schema and database client
packages/queue           Queue/workflow adapters and workers
packages/shopify         Shopify OAuth and Admin API service logic
packages/storage         Storage service helpers
docs                     Public maintainer and product documentation
```

## Run Locally

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

For a lightweight public-route smoke test, run the app locally or point the test at production:

```bash
SMOKE_TEST_BASE_URL=https://acezerotrading.com npm run test:smoke
```

The production health endpoint is available at `/api/health`. It returns `200` only when required launch checks are ready; otherwise it returns `503` with a summary count of missing settings.

## Environment

Copy `.env.example` or `apps/web/.env.example` and provide your own local values. Never commit `.env.local`, Vercel local environment files, service-role keys, webhook secrets, OAuth client secrets, or generated app state.

Required production values include:

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

Run `apps/web/supabase/migrations/001_app_state.sql` and `apps/web/supabase/migrations/002_growth_monitoring.sql` in Supabase, then open `/launch` to confirm the production checks.

## Shopify Publishing

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

Use Shopify scopes `read_products`, `write_products`, `write_files`, `read_locations`, `write_inventory`, `read_publications`, and `write_publications` so local product images, price, SKU, inventory, and live sales-channel publication can be pushed to Shopify.

Generated images are sent to Shopify only when they resolve to public `https` URLs. Without a public app URL, the product draft still publishes with title, description, bullets, FAQ, tags, and product type, but local `/uploads/...` images are skipped.

## Maintainer Workflows

- `npm run lint` checks the web app with ESLint.
- `npm run build` validates the Next.js production build.
- `npm run test:smoke` checks public routes, metadata, robots, sitemap, and health behavior.
- `npm run test:qa-suite` validates the release QA checklist data.
- `/qa` is an admin-only real-user release checklist covering registration, Google login, Shopify OAuth, upload, image generation, copy generation, Shopify publishing, Stripe credits, Growth scan, and Growth write-back.
- `/account` includes JSON account export and account deletion controls for privacy requests.
- `/usage` includes CSV exports for job history and credit ledger entries.
- `/admin` is admin-only and supports support searches by user email, store domain, product, job id, or error text.

## Roadmap

The near-term OSS roadmap is maintained in [docs/open-source-roadmap.md](docs/open-source-roadmap.md). Good first contribution areas include documentation, provider adapters, test coverage, queue adapters, and security hardening around OAuth, webhook, and secret-handling flows.

## Contributing

Contributions are welcome. Start with [CONTRIBUTING.md](CONTRIBUTING.md), open an issue for larger changes, and keep pull requests focused enough to review. Security issues should follow [SECURITY.md](SECURITY.md) instead of public issue discussion.

## License

MIT. See [LICENSE](LICENSE).
