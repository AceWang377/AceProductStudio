import type { Locale } from "@/lib/i18n/dictionaries";

export const LANGUAGE_STORAGE_KEY = "acestudio-language";
export const LANGUAGE_COOKIE_KEY = "acestudio-language";

export function normalizeLocale(value?: string | null): Locale | null {
  return value === "en" || value === "zh" ? value : null;
}
