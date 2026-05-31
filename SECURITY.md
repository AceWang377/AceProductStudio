# Security Policy

AceProductStudio handles OAuth credentials, service-role keys, webhook secrets, generated media, product data, and billing events. Please report vulnerabilities responsibly.

## Supported Versions

Security fixes are accepted against the `main` branch.

## Reporting a Vulnerability

Please do not open a public issue for suspected vulnerabilities. Instead, contact the maintainer privately through the security contact listed on the GitHub repository, or email the public support address configured for the project if no GitHub private vulnerability reporting option is available.

Include:

- A short description of the issue.
- Affected files, routes, API endpoints, or provider integrations.
- Steps to reproduce with test data only.
- Impact and any suggested remediation.

## Sensitive Data Rules

Never include real secrets or customer data in issues, pull requests, logs, screenshots, or test fixtures. This includes:

- OpenAI API keys.
- Supabase service-role keys and JWT secrets.
- Shopify client secrets, Admin API tokens, OAuth codes, and webhook payloads containing merchant data.
- Stripe secret keys, webhook secrets, payment identifiers tied to real customers, or live billing data.
- Vercel OIDC tokens or local environment files.

## Maintainer Expectations

Security-related changes should preserve:

- Server-only use of privileged provider keys.
- Webhook signature verification.
- Encryption or safe storage of long-lived provider credentials.
- Row-level access controls for user-owned data.
- Auditability around admin-only operations.
- Human review before publishing or writing changes back to Shopify.
