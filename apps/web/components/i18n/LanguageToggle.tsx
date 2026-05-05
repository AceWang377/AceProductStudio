"use client";

import { Languages } from "lucide-react";
import { useLanguage, type Locale } from "@/components/i18n/LanguageProvider";

const options: Locale[] = ["en", "zh"];

export function LanguageToggle() {
  const { locale, setLocale, t } = useLanguage();

  return (
    <div
      className="studio-focus inline-flex h-10 shrink-0 items-center gap-1 rounded border border-line bg-white p-1"
      role="group"
      aria-label={t.shell.language}
      title={t.shell.language}
    >
      <Languages className="ml-1 h-4 w-4 text-muted" aria-hidden />
      {options.map((option) => {
        const active = locale === option;
        return (
          <button
            key={option}
            type="button"
            onClick={() => setLocale(option)}
            className={`h-7 rounded px-2 text-xs font-semibold transition ${
              active ? "bg-ink text-white" : "text-muted hover:bg-canvas hover:text-ink"
            }`}
            aria-pressed={active}
          >
            {option === "en" ? t.shell.english : t.shell.chinese}
          </button>
        );
      })}
    </div>
  );
}
