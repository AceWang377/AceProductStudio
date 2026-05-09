"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import { useRouter } from "next/navigation";
import { dictionaries, type Dictionary, type Locale } from "@/lib/i18n/dictionaries";
import { LANGUAGE_COOKIE_KEY, LANGUAGE_STORAGE_KEY, normalizeLocale } from "@/lib/i18n/constants";

export type { Locale };

const LanguageContext = createContext<{
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Dictionary;
} | null>(null);

function getInitialLocale(): Locale {
  if (typeof window === "undefined") return "en";

  const cookieLocale = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(`${LANGUAGE_COOKIE_KEY}=`))
    ?.split("=")[1];
  const savedCookieLocale = normalizeLocale(cookieLocale);
  if (savedCookieLocale) return savedCookieLocale;

  const saved = normalizeLocale(window.localStorage.getItem(LANGUAGE_STORAGE_KEY));
  if (saved) return saved;

  return window.navigator.language.toLowerCase().startsWith("zh") ? "zh" : "en";
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const initialLocale = getInitialLocale();
    setLocaleState(initialLocale);
    document.cookie = `${LANGUAGE_COOKIE_KEY}=${initialLocale}; path=/; max-age=31536000; SameSite=Lax`;
  }, []);

  const setLocale = useCallback((nextLocale: Locale) => {
    setLocaleState(nextLocale);
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLocale);
    document.cookie = `${LANGUAGE_COOKIE_KEY}=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`;
    router.refresh();
  }, [router]);

  useEffect(() => {
    document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
  }, [locale]);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t: dictionaries[locale]
    }),
    [locale, setLocale]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }
  return context;
}
