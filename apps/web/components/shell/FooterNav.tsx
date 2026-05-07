"use client";

import Link from "next/link";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export function FooterNav() {
  const { t } = useLanguage();

  const groups = [
    {
      title: t.footer.product,
      links: [
        {
          label: t.footer.productStudio,
          href: "/shopify-ai-product-listing-generator"
        },
        {
          label: t.footer.draftPublisher,
          href: "/ai-shopify-draft-publisher"
        }
      ]
    },
    {
      title: t.footer.growth,
      links: [
        {
          label: t.footer.seoGeoOptimizer,
          href: "/shopify-seo-geo-optimizer"
        },
        {
          label: t.footer.seoCopy,
          href: "/shopify-seo-product-description-generator"
        },
        {
          label: t.footer.imageSeo,
          href: "/shopify-product-image-generator"
        }
      ]
    },
    {
      title: t.footer.resources,
      links: [
        {
          label: t.footer.guides,
          href: "/resources"
        },
        {
          label: t.footer.shopifyAiChecklist,
          href: "/resources/shopify-ai-product-listing-checklist"
        }
      ]
    },
    {
      title: t.footer.company,
      links: [
        {
          label: t.shell.support,
          href: "/support"
        },
        {
          label: t.shell.privacy,
          href: "/privacy"
        },
        {
          label: t.shell.refund,
          href: "/refund"
        },
        {
          label: t.shell.terms,
          href: "/terms"
        }
      ]
    }
  ];

  return (
    <nav className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4" aria-label="Footer">
      {groups.map((group) => (
        <div key={group.title}>
          <h2 className="text-xs font-semibold uppercase tracking-normal text-ink">{group.title}</h2>
          <ul className="mt-3 space-y-2">
            {group.links.map((link) => (
              <li key={link.href}>
                <Link className="hover:text-ink" href={link.href}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}
