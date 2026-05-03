import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalSection } from "@/components/legal/LegalPage";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: `Refund Policy | ${siteConfig.name}`,
  description: "Refund policy for AI Product Studio"
};

export default function RefundPage() {
  return (
    <LegalPage eyebrow="Refunds" title="Refund Policy" updated="May 3, 2026">
      <LegalSection title="Overview">
        <p>
          {siteConfig.name} provides digital AI generation tools, Shopify draft
          publishing tools, and usage-based credits. This policy explains how
          refund requests are handled when paid billing is enabled.
        </p>
      </LegalSection>

      <LegalSection title="Used Credits and Completed Generations">
        <p>
          Credits are non-refundable once they have been used to generate images,
          create AI output, process a job, or publish a product draft, except
          where required by law. AI generation uses third-party compute and may
          create irreversible digital output immediately after you start a job.
        </p>
      </LegalSection>

      <LegalSection title="Unused Credits">
        <p>
          Unused paid credits are generally non-refundable unless required by
          applicable law, the charge was made in error, or we approve an
          exception. Trial, promotional, bonus, or admin credits have no cash
          value and are not refundable.
        </p>
      </LegalSection>

      <LegalSection title="Failed Jobs and Service Errors">
        <p>
          If a generation job fails because of a service error, the app is
          designed to return the affected credits automatically where possible.
          If credits were not returned after a failed job, contact support and
          include your account email, product name, and approximate time of the
          job.
        </p>
      </LegalSection>

      <LegalSection title="Subscriptions">
        <p>
          If subscriptions are enabled, cancelling a subscription stops future
          renewals but does not automatically refund the current billing period
          unless required by law or stated at checkout. Any included credits or
          plan benefits may remain available until the end of the paid billing
          period, unless the plan terms say otherwise.
        </p>
      </LegalSection>

      <LegalSection title="Legal Rights">
        <p>
          Nothing in this policy limits any consumer rights that cannot be
          excluded by law. Depending on where you live, you may have cancellation
          rights, rights for faulty or misdescribed digital content, or rights
          relating to unauthorized or mistaken charges.
        </p>
      </LegalSection>

      <LegalSection title="How to Request a Refund Review">
        <p>
          Email{" "}
          <a className="text-action underline-offset-4 hover:underline" href={`mailto:${siteConfig.supportEmail}`}>
            {siteConfig.supportEmail}
          </a>{" "}
          with your account email, payment date, charge amount, and reason for
          the request. We may ask for additional information to verify the
          account, payment, or affected job.
        </p>
      </LegalSection>

      <LegalSection title="Related Pages">
        <p>
          Read the{" "}
          <Link className="text-action underline-offset-4 hover:underline" href="/terms">
            Terms & Conditions
          </Link>
          , the{" "}
          <Link className="text-action underline-offset-4 hover:underline" href="/privacy">
            Privacy Policy
          </Link>{" "}
          or visit{" "}
          <Link className="text-action underline-offset-4 hover:underline" href="/support">
            Support
          </Link>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
