"use client";

import { siteConfig } from "@/lib/site";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export function BrandText() {
  const { t } = useLanguage();

  return (
    <span>
      <span className="block text-sm font-semibold leading-5">{siteConfig.name}</span>
      <span className="block text-xs text-muted">{t.shell.subtitle}</span>
    </span>
  );
}
