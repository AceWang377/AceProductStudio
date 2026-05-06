"use client";

import Link from "next/link";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export function FooterNav() {
  const { t } = useLanguage();

  const groups = [
    {
      title: "Product",
      links: [
        {
          label: "Product listing generator",
          href: "/shopify-ai-product-listing-generator"
        },
        {
          label: "Image generator",
          href: "/shopify-product-image-generator"
        },
        {
          label: "SEO copy",
          href: "/shopify-seo-product-description-generator"
        },
        {
          label: "SEO/GEO optimizer",
          href: "/shopify-seo-geo-optimizer"
        },
        {
          label: "Draft publisher",
          href: "/ai-shopify-draft-publisher"
        }
      ]
    },
    {
      title: "Resources",
      links: [
        {
          label: "Resources",
          href: "/resources"
        },
        {
          label: "Shopify AI checklist",
          href: "/resources/shopify-ai-product-listing-checklist"
        }
      ]
    },
    {
      title: "Support",
      links: [
        {
          label: t.shell.support,
          href: "/support"
        }
      ]
    },
    {
      title: "Legal",
      links: [
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
