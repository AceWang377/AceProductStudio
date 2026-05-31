# Open-Source Roadmap

AceProductStudio is maintained as a reference implementation for review-first AI commerce applications. The roadmap focuses on making the repository safer, easier to run, and more reusable for other maintainers.

## Near Term

- Improve setup documentation for local Supabase, Shopify OAuth, Stripe webhooks, and OpenAI configuration.
- Add integration test fixtures with mocked provider responses.
- Expand smoke tests for public routes, sitemap, robots, metadata, and health checks.
- Add focused tests for privacy export, account deletion, credit ledger behavior, and failed-generation refunds.
- Document the review-first publishing model with sequence diagrams.

## Security and Maintenance

- Add recurring secret scanning guidance for contributors.
- Harden examples around webhook verification and OAuth callback validation.
- Add documented rotation steps for OpenAI, Supabase, Shopify, Stripe, and Vercel credentials.
- Add dependency update workflow guidance for maintainers.
- Document admin-only surfaces and expected authorization boundaries.

## Reusability

- Extract provider boundaries so queue, storage, and AI services are easier to swap.
- Document patterns for adding non-Shopify commerce providers.
- Add sample data generators that do not include merchant or customer data.
- Improve component-level docs for the product workspace, QA checklist, and growth audit flows.

## Contribution Priorities

Good contributions are small, testable, and help other maintainers understand how to safely ship AI-assisted commerce workflows. Documentation, mocks, security hardening, and deployment notes are all valuable.
