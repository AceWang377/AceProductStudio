import "server-only";
import { cookies } from "next/headers";
import { LANGUAGE_COOKIE_KEY, normalizeLocale } from "@/lib/i18n/constants";
import { dictionaries } from "@/lib/i18n/dictionaries";

export async function getServerDictionary() {
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get(LANGUAGE_COOKIE_KEY)?.value) ?? "en";

  return {
    locale,
    t: dictionaries[locale]
  };
}
