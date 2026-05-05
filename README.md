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
SHOPIFY_TOKEN_ENCRYPTION_KEY=generate-a-long-random-secret
SHOPIFY_CLIENT_ID=xxxxxxxxx
SHOPIFY_CLIENT_SECRET=xxxxxxxxx
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
