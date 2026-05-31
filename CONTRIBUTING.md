# Contributing

Thanks for helping improve AceProductStudio. This repository is maintained as a practical reference implementation for review-first AI commerce workflows, so contributions that make the system easier to run, safer to operate, or clearer to learn from are especially valuable.

## Good First Areas

- Documentation for setup, deployment, and provider-specific configuration.
- Tests for OpenAI, Shopify, Stripe, Supabase, and privacy/export flows.
- Security hardening for OAuth, webhook verification, token storage, and secret handling.
- Provider adapters for queues, storage, or commerce platforms.
- UX improvements that preserve the review-first publishing model.

## Development Workflow

1. Fork the repository and create a focused branch.
2. Copy `.env.example` or `apps/web/.env.example` into a local env file and add your own test credentials.
3. Run `npm install`.
4. Run `npm run dev` for local development.
5. Before opening a pull request, run:

```bash
npm run lint
npm run build
npm run test:smoke
npm run test:qa-suite
```

If a check cannot be run because it requires external credentials or services, explain that clearly in the pull request.

## Pull Request Guidelines

- Keep changes scoped to one behavior or documentation improvement.
- Include screenshots for visible UI changes.
- Add or update tests when changing business logic, integrations, auth, billing, or privacy behavior.
- Do not commit `.env.local`, `.vercel/`, generated uploads, local app state, browser logs, API responses with credentials, or customer data.
- Use placeholder values in examples and docs.

## Review Priorities

Maintainers prioritize changes that improve:

- Reliability of AI generation and human review flows.
- Safety of Shopify publishing and write-back behavior.
- Clear setup paths for new contributors.
- Security, privacy, and operational visibility.
- Reusable patterns for other OSS maintainers building AI commerce tools.
