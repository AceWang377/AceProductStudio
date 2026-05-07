import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalSection } from "@/components/legal/LegalPage";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: `Terms & Conditions | ${siteConfig.name}`,
  description: "Terms and conditions for AceStudio",
  alternates: {
    canonical: "/terms"
  }
};

export default function TermsPage() {
  return (
    <LegalPage eyebrow="Terms" title="Terms & Conditions" updated="May 3, 2026">
      <LegalSection title="Using the Service">
        <p>
          {siteConfig.name} provides tools for creating ecommerce product media,
          product copy, and Shopify product drafts. You are responsible for the
          content you upload, generate, edit, and publish.
        </p>
      </LegalSection>

      <LegalSection title="Account and Store Access">
        <p>
          You must use accurate account information and only connect Shopify
          stores you are authorized to manage. You can disconnect or rotate store
          access from Shopify or within the app settings when supported.
        </p>
      </LegalSection>

      <LegalSection title="AI Output">
        <p>
          AI-generated images and copy are drafts. You must review titles,
          descriptions, images, tags, prices, inventory, and claims before
          publishing. Do not publish content that is misleading, unlawful,
          infringing, unsafe, or unsupported by your product information.
        </p>
      </LegalSection>

      <LegalSection title="Credits and Billing">
        <p>
          The app may use credits to meter image generation and other actions.
          Paid credit terms, subscriptions, and checkout terms will be shown
          before checkout when billing is enabled. Refunds are handled under the{" "}
          <Link className="text-action underline-offset-4 hover:underline" href="/refund">
            Refund Policy
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="Acceptable Use">
        <p>
          Do not abuse the service, bypass limits, scrape, overload endpoints,
          upload malicious files, or use the app to generate or publish illegal,
          harmful, deceptive, or rights-infringing content.
        </p>
      </LegalSection>

      <LegalSection title="Availability">
        <p>
          The service depends on third-party systems including Shopify,
          Supabase, OpenAI, Vercel, and Stripe. Features may be unavailable if
          those services are unavailable or if your credentials, permissions, or
          credits are not valid.
        </p>
      </LegalSection>

      <LegalSection title="Support">
        <p>
          For account, publishing, or billing questions, contact{" "}
          <a className="text-action underline-offset-4 hover:underline" href={`mailto:${siteConfig.supportEmail}`}>
            {siteConfig.supportEmail}
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="Related Pages">
        <p>
          Read the{" "}
          <Link className="text-action underline-offset-4 hover:underline" href="/privacy">
            Privacy Policy
          </Link>
          , the{" "}
          <Link className="text-action underline-offset-4 hover:underline" href="/refund">
            Refund Policy
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
