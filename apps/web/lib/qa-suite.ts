export type QaStepStatus = "pending" | "pass" | "fail" | "blocked";

export type QaStep = {
  id: string;
  phase: string;
  title: string;
  href: string;
  owner: "Admin tester" | "Merchant tester" | "Support tester";
  objective: string;
  setup: string[];
  actions: string[];
  evidence: string[];
  passCriteria: string[];
  failureTriage: string[];
  notes?: string;
};

export const realUserQaSuite = {
  version: "2026-05-real-user-v1",
  title: "Real user release QA",
  description:
    "Run this before inviting new merchants or after changing auth, Shopify, OpenAI, Stripe, credits, or Growth Studio behavior.",
  preflight: [
    "Use a dedicated merchant test account, not the admin account, for the main run.",
    "Use a Shopify development store with at least one live product and one unlisted product for Growth Studio filtering.",
    "Use Stripe sandbox card 4242 4242 4242 4242 for sandbox QA. Do a low-value live payment only after switching Stripe to live mode.",
    "Confirm /launch has no missing blockers before starting.",
    "Record screenshots or links for every pass/fail decision."
  ],
  steps: [
    {
      id: "register-email",
      phase: "Access",
      title: "Register with email and password",
      href: "/login",
      owner: "Merchant tester",
      objective: "Confirm a new user can create an account and land in their own workspace.",
      setup: [
        "Use an email address that is not already in Supabase Auth.",
        "Use a password with at least 8 characters."
      ],
      actions: [
        "Open the login page.",
        "Choose Create account.",
        "Submit email and password.",
        "Confirm the email if Supabase requires confirmation.",
        "Return to AceStudio and open the dashboard."
      ],
      evidence: [
        "Dashboard loads without admin-only data.",
        "Account page shows the test user's email.",
        "Initial credits are visible."
      ],
      passCriteria: [
        "The user can sign in without a magic-link-only dependency.",
        "The user sees only their own products, jobs, stores, credits, and history.",
        "No server-side exception appears after email confirmation."
      ],
      failureTriage: [
        "Check Supabase Auth email redirect URLs.",
        "Check NEXT_PUBLIC_APP_URL in Vercel.",
        "Check /auth/callback logs in Vercel."
      ]
    },
    {
      id: "google-login",
      phase: "Access",
      title: "Sign in with Google",
      href: "/login",
      owner: "Merchant tester",
      objective: "Confirm Google OAuth works and displays AceStudio branding in the consent flow.",
      setup: [
        "Google provider is enabled in Supabase.",
        "Google OAuth redirect URI points to the Supabase auth callback URL.",
        "Supabase Site URL and Redirect URLs include the production AceStudio domain."
      ],
      actions: [
        "Open the login page.",
        "Click Continue with Google.",
        "Select the test Google account.",
        "Return to AceStudio."
      ],
      evidence: [
        "Google consent shows AceStudio or the configured app name.",
        "The user lands on /dashboard.",
        "Account page shows the Google account email."
      ],
      passCriteria: [
        "Google login completes without localhost redirects.",
        "The session persists after refresh.",
        "The user has a normal credit account."
      ],
      failureTriage: [
        "Check Google OAuth client authorized redirect URIs.",
        "Check Supabase Auth provider settings and branding.",
        "Check NEXT_PUBLIC_APP_URL on Vercel."
      ]
    },
    {
      id: "connect-shopify",
      phase: "Shopify",
      title: "Connect Shopify through OAuth",
      href: "/settings/shopify",
      owner: "Merchant tester",
      objective: "Confirm a merchant can connect their own Shopify store without pasting an Admin API token.",
      setup: [
        "Use a Shopify development store.",
        "Use the original myshopify.com store domain.",
        "Shopify app URL and redirect URL are set to the production AceStudio domain."
      ],
      actions: [
        "Open Shopify settings.",
        "Enter the store's myshopify.com domain.",
        "Start OAuth.",
        "Approve the requested Shopify permissions.",
        "Return to AceStudio."
      ],
      evidence: [
        "Connected store success message is shown.",
        "Store domain is visible in the Shopify settings page.",
        "No client secret or Admin API token is exposed in the browser."
      ],
      passCriteria: [
        "The OAuth callback returns to AceStudio.",
        "The store is saved to the signed-in user's account.",
        "Reconnect works without creating duplicate broken state."
      ],
      failureTriage: [
        "Check SHOPIFY_CLIENT_ID and SHOPIFY_CLIENT_SECRET.",
        "Check Shopify allowed redirection URL.",
        "Check stores table columns and token encryption configuration."
      ]
    },
    {
      id: "upload-product-image",
      phase: "Product flow",
      title: "Upload product image",
      href: "/products/new",
      owner: "Merchant tester",
      objective: "Confirm a merchant can create a product draft from one product photo.",
      setup: [
        "Use a PNG, JPEG, or WebP image under 10MB.",
        "Pick a product that is safe to publish as a Shopify draft."
      ],
      actions: [
        "Open New product.",
        "Upload the product image.",
        "Wait for product detection.",
        "Open the created product workspace."
      ],
      evidence: [
        "Original image is visible.",
        "Product title/category are detected or editable.",
        "A product record appears in the dashboard."
      ],
      passCriteria: [
        "Upload does not fail on valid image types.",
        "The image persists after refresh.",
        "The product belongs only to the test user."
      ],
      failureTriage: [
        "Check Supabase Storage bucket permissions.",
        "Check upload size/type validation.",
        "Check OpenAI key and product detection logs."
      ]
    },
    {
      id: "generate-images",
      phase: "Product flow",
      title: "Generate product images",
      href: "/products/new",
      owner: "Merchant tester",
      objective: "Confirm image generation creates the required publish media set and spends credits correctly.",
      setup: [
        "The test account has enough credits or is an admin account.",
        "OPENAI_IMAGE_MODEL is configured."
      ],
      actions: [
        "Open the product workspace.",
        "Generate images.",
        "Review lifestyle, detail, intro, and white-background outputs.",
        "Check media ordering labels."
      ],
      evidence: [
        "At least four generated images are visible.",
        "Lifestyle image is first in publish order.",
        "White-background image is last in publish order.",
        "Credit balance decreases or admin bypass is clearly shown."
      ],
      passCriteria: [
        "The original image is not included in the publish media set.",
        "Generated images have stable download links.",
        "Failed image jobs refund reserved credits."
      ],
      failureTriage: [
        "Check OpenAI image model and API key.",
        "Check credit ledger entries.",
        "Check product_images storage_key and public URL values."
      ]
    },
    {
      id: "generate-copy",
      phase: "Product flow",
      title: "Generate Shopify SEO copy",
      href: "/products/new",
      owner: "Merchant tester",
      objective: "Confirm generated product copy fills the editor and remains editable.",
      setup: [
        "Product title/category should be set.",
        "Optional: add SEO keywords, target market, tone, language, and brand voice."
      ],
      actions: [
        "Open the product workspace.",
        "Generate copy.",
        "Edit title, description, bullets, tags, and FAQ.",
        "Refresh and confirm changes persist."
      ],
      evidence: [
        "Copy fields populate with real generated text.",
        "Manual edits remain after save/refresh.",
        "Copy generation does not spend image credits."
      ],
      passCriteria: [
        "The editor updates immediately after generation.",
        "No stale local state overwrites new copy.",
        "FAQ, tags, and bullets are publish-ready fields."
      ],
      failureTriage: [
        "Check OpenAI text model fallback logs.",
        "Check product update API response.",
        "Check editor client state after generation."
      ]
    },
    {
      id: "publish-shopify-draft",
      phase: "Shopify",
      title: "Publish Shopify draft",
      href: "/products/new",
      owner: "Merchant tester",
      objective: "Confirm the complete listing can be sent to Shopify as a draft with generated media.",
      setup: [
        "Shopify OAuth connection is active.",
        "Product has generated images, copy, price, SKU, and inventory.",
        "The publish checklist is complete."
      ],
      actions: [
        "Open the product workspace.",
        "Review Shopify preview card.",
        "Click publish draft.",
        "Open the Shopify Admin product link."
      ],
      evidence: [
        "Job status shows Shopify publish completed.",
        "Shopify product link is saved.",
        "Shopify draft contains title, description, images, price, SKU, and inventory."
      ],
      passCriteria: [
        "Product is draft by default unless live publish is explicitly chosen.",
        "All generated images except the original are uploaded in the expected order.",
        "A retryable failed job is shown if Shopify rejects the publish."
      ],
      failureTriage: [
        "Check Shopify scopes.",
        "Check generated media URLs are public https URLs.",
        "Check Shopify GraphQL error in job history."
      ]
    },
    {
      id: "buy-credits",
      phase: "Billing",
      title: "Buy credits",
      href: "/billing",
      owner: "Merchant tester",
      objective: "Confirm Stripe Checkout adds credits only after verified payment confirmation.",
      setup: [
        "Use Stripe sandbox mode for normal QA.",
        "Stripe webhook endpoint listens to checkout.session.completed.",
        "Use test card 4242 4242 4242 4242 in sandbox."
      ],
      actions: [
        "Open Billing.",
        "Buy the Starter pack.",
        "Complete Stripe Checkout.",
        "Return to Billing and refresh after webhook delivery."
      ],
      evidence: [
        "Checkout success page returns to AceStudio.",
        "Credit balance increases by the pack amount.",
        "Credit ledger records the Stripe payment id."
      ],
      passCriteria: [
        "Canceled checkout does not add credits.",
        "Successful checkout waits for Stripe webhook confirmation.",
        "Admin unlimited accounts cannot accidentally buy packs."
      ],
      failureTriage: [
        "Check STRIPE_SECRET_KEY mode.",
        "Check STRIPE_WEBHOOK_SECRET matches the endpoint.",
        "Check /api/stripe/webhook logs and credit_ledger rows."
      ],
      notes: "Do not use real money for routine QA. Use one low-value live purchase only when validating live Stripe before launch."
    },
    {
      id: "growth-scan",
      phase: "Growth",
      title: "Run Growth scan",
      href: "/growth",
      owner: "Merchant tester",
      objective: "Confirm Growth Studio audits only live/listed Shopify products and active growth targets.",
      setup: [
        "Connected Shopify store has at least one live/listed product.",
        "Connected Shopify store has at least one unlisted product to verify filtering.",
        "The account has enough credits for the selected scan tier."
      ],
      actions: [
        "Open Growth Studio.",
        "Sync or load Shopify products.",
        "Run an SEO/GEO scan.",
        "Review product, collection, image, schema, internal link, and technical SEO recommendations."
      ],
      evidence: [
        "Unlisted Shopify products do not appear in the optimization list.",
        "Scores are shown for live/listed products.",
        "Credit spend is visible before running the scan."
      ],
      passCriteria: [
        "The scan excludes unlisted products.",
        "The scan produces actionable recommendations, not only monitoring data.",
        "Credit charging is clear and recorded in usage history."
      ],
      failureTriage: [
        "Check Shopify product status mapping.",
        "Check Growth Studio filtering logic.",
        "Check credit ledger reason for Growth scan entries."
      ]
    },
    {
      id: "growth-write-back",
      phase: "Growth",
      title: "Approve Growth write-back",
      href: "/growth",
      owner: "Merchant tester",
      objective: "Confirm optimized SEO/GEO content is never written back to Shopify without explicit merchant approval.",
      setup: [
        "Run a Growth scan with at least one recommendation.",
        "Use a safe test product in a development store."
      ],
      actions: [
        "Open a recommendation.",
        "Review the proposed Shopify changes.",
        "Confirm the write-back action.",
        "Open Shopify Admin and compare the updated product."
      ],
      evidence: [
        "Write-back button requires explicit confirmation.",
        "Only selected fields are updated.",
        "Shopify Admin reflects the approved change."
      ],
      passCriteria: [
        "No automatic write-back happens when viewing recommendations.",
        "The app records success or a retryable failed job.",
        "The merchant can see what changed."
      ],
      failureTriage: [
        "Check Shopify write scopes.",
        "Check Growth apply API response.",
        "Check job history and Shopify product update payload."
      ]
    }
  ] satisfies QaStep[]
};

export const qaStepCount = realUserQaSuite.steps.length;
