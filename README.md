# AI Product Studio

AI Product Studio is a personal ecommerce content workspace for turning product photos into product drafts, generated image sets, editable copy, and Shopify draft payloads.

## What is implemented

- Next.js App Router web app in `apps/web`
- Product image upload with file type and 10MB validation
- Product draft creation and local JSON persistence
- Dashboard, product list, new product, product workspace, and Shopify settings pages
- OpenAI image and copy generation with local fallbacks when API keys are not connected
- Shopify draft product publishing through the Admin GraphQL API
- Prisma schema and typed service package boundaries for database, AI, storage, queue, and Shopify
- OpenAI model env defaults for `gpt-5.3` text organization and `gpt-image-2` image generation/editing

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Shopify publishing

Open `/settings/shopify` and connect a store with Shopify OAuth. The manual credential form is still available as a local fallback, but OAuth is the intended standalone web app flow.

Server environment for OAuth:

```bash
SHOPIFY_CLIENT_ID=xxxxxxxxx
SHOPIFY_CLIENT_SECRET=xxxxxxxxx
APP_PUBLIC_URL=https://your-public-app-url.example.com
```

In the Shopify Dev Dashboard, configure:

```text
App URL: https://your-public-app-url.example.com/settings/shopify
Allowed redirection URL: https://your-public-app-url.example.com/api/shopify/oauth/callback
```

For local OAuth testing, Shopify must be able to redirect back to your machine. Use a public tunnel such as ngrok or Cloudflare Tunnel and set `APP_PUBLIC_URL` to that public tunnel URL.

Use Shopify scopes `read_products`, `write_products`, `write_files`, `read_locations`, `write_inventory`, `read_publications`, and `write_publications` so local product images, price, SKU, inventory, and live sales-channel publication can be pushed to Shopify.

Generated images are sent to Shopify only when they resolve to public `https` URLs. In production, set:

```bash
APP_PUBLIC_URL=https://your-deployed-app.example.com
```

Without a public app URL, the product draft still publishes with title, description, bullets, FAQ, tags, and product type, but local `/uploads/...` images are skipped.

## Production services still to connect

The app currently uses local JSON storage for a personal, no-database first run. Production service boundaries are already in place:

- `packages/database/prisma/schema.prisma` for PostgreSQL + Prisma
- `packages/ai/src` for OpenAI image and copy generation
- `packages/storage/src` for R2/S3-compatible object storage
- `packages/queue/src` for BullMQ + Redis workers

Once credentials are available, replace the local app data calls with the package services and run:

```bash
npm run prisma:generate
npm run prisma:migrate
```
