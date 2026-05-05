"use client";

import Link from "next/link";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export function FooterNav() {
  const { t } = useLanguage();

  return (
    <nav className="flex flex-wrap gap-4">
      <Link className="hover:text-ink" href="/shopify-product-image-generator">
        Image generator
      </Link>
      <Link className="hover:text-ink" href="/shopify-seo-product-description-generator">
        SEO copy
      </Link>
      <Link className="hover:text-ink" href="/ai-shopify-draft-publisher">
        Draft publisher
      </Link>
      <Link className="hover:text-ink" href="/support">
        {t.shell.support}
      </Link>
      <Link className="hover:text-ink" href="/privacy">
        {t.shell.privacy}
      </Link>
      <Link className="hover:text-ink" href="/refund">
        {t.shell.refund}
      </Link>
      <Link className="hover:text-ink" href="/terms">
        {t.shell.terms}
      </Link>
    </nav>
  );
}
