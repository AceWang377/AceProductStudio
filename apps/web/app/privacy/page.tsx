import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalSection } from "@/components/legal/LegalPage";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: `Privacy Policy | ${siteConfig.name}`,
  description: "Privacy policy for AI Product Studio"
};

export default function PrivacyPage() {
  return (
    <LegalPage eyebrow="Privacy" title="Privacy Policy" updated="May 3, 2026">
      <LegalSection title="Overview">
        <p>
          {siteConfig.name} helps merchants create product images, listing copy,
          and Shopify product drafts. This policy explains what data is handled
          when you use the app.
        </p>
      </LegalSection>

      <LegalSection title="Data We Collect">
        <p>
          We collect account information such as your email address, product
          content you upload or create, generated images and copy, credit usage,
          job history, and Shopify store connection details when you connect a
          store.
        </p>
        <p>
          Shopify access tokens are stored server-side and are used only to
          publish or manage product drafts for the connected store.
        </p>
      </LegalSection>

      <LegalSection title="How Data Is Used">
        <p>
          Product images and prompts may be sent to AI providers to analyze
          products, generate images, and create listing copy. Store connection
          data is used to publish products to Shopify at your request.
        </p>
        <p>
          Usage and credit records are used to operate the service, prevent
          abuse, provide account history, and support future billing.
        </p>
      </LegalSection>

      <LegalSection title="Service Providers">
        <p>
          The app may use Supabase for authentication, database, and storage;
          OpenAI for AI generation; Shopify for store publishing; Vercel for
          hosting; and Stripe for payments when billing is enabled.
        </p>
      </LegalSection>

      <LegalSection title="Your Responsibilities">
        <p>
          Only upload product images and business content that you have the right
          to use. Review generated output before publishing because AI-generated
          content may be incomplete or inaccurate.
        </p>
      </LegalSection>

      <LegalSection title="Data Requests">
        <p>
          To request deletion, export, or correction of account data, contact{" "}
          <a className="text-action underline-offset-4 hover:underline" href={`mailto:${siteConfig.supportEmail}`}>
            {siteConfig.supportEmail}
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="Related Pages">
        <p>
          Read the{" "}
          <Link className="text-action underline-offset-4 hover:underline" href="/terms">
            Terms & Conditions
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
